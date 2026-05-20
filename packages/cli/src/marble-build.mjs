/**
 * Marble black-box wrapper. Builds a marble KG from a user-supplied data file
 * without the user ever invoking the `marble` CLI or knowing it's there.
 *
 * Marble's `ingestConversations` / `ingestEpisodes` require an `llm` function
 * passed to the constructor (env-based provider discovery only kicks in for
 * `learn()` and a few internals). So we build a small wrapper that translates
 * marble's `async (prompt) => string` contract into OpenCode/Anthropic HTTP
 * calls using the user's API key.
 *
 * Lifecycle:
 *   1. detectFormat(dataPath)        — chat-export JSON vs episodes JSON vs text
 *   2. report('ingesting')           — server logs the transition; /connect shows progress
 *   3. marble.init() + ingest…       — marble persists the KG to `storage` (~/.events-x-marble/marble-kg.json)
 *   4. report('learning')
 *   5. marble.learn()
 *   6. validate KG has minimum content (interests > 0 OR beliefs > 5)
 *
 * On any throw, report('error', category) is fired by the caller (init.mjs's
 * preflight loop). This module only raises with a descriptive message.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { report } from "./status-report.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map our config's llm_provider to marble's LLM_PROVIDER env values.
const PROVIDER_MAP = {
  opencode: "opencode",
  anthropic: "anthropic",
  openai: "openai",
};

/**
 * Build a KG file at kgPath from a SET of discovered data sources using marble.
 * Returns { kgPath, summary, counts, ingested } on success. Throws on failure.
 *
 * Each source is `{ path, format, kind, label, sizeBytes, recordEstimate }`
 * as produced by discover-data.mjs's discoverDataSources(). Marble's ingest
 * is called once per source; the storage path is shared so each ingest
 * incrementally extends the same KG.
 *
 * cfg fields used: site_url, token (for status reports), llm_provider, llm_api_key_env
 */
export async function buildKgFromSources({ cfg, kgPath, sources }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("buildKgFromSources: at least one source required");
  }

  const apiKey = process.env[cfg.llm_api_key_env];
  if (!apiKey) {
    throw new Error(`${cfg.llm_api_key_env} not set in env — required by marble for KG synthesis`);
  }

  const marbleProvider = PROVIDER_MAP[cfg.llm_provider];
  if (!marbleProvider) {
    throw new Error(`marble doesn't support provider '${cfg.llm_provider}' yet`);
  }

  if (!process.env.EMBEDDINGS_PROVIDER) process.env.EMBEDDINGS_PROVIDER = "none";

  const llmFn = buildLlmFn(cfg.llm_provider, apiKey);
  const { Marble } = await import("marble");

  const marble = new Marble({
    storage: kgPath,
    llm: llmFn,
    silent: true,
  });
  await marble.init();

  const ingested = [];
  const skipped = [];

  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (!existsSync(src.path)) {
      skipped.push({ ...src, reason: "missing" });
      continue;
    }
    const detected = src.format === "auto" ? detectFormat(src.path) : normalizeFormat(src);
    await report({
      cfg,
      state: "ingesting",
      message: `ingesting ${i + 1}/${sources.length}: ${src.label}`,
    });
    try {
      await ingestOne(marble, src.path, detected);
      ingested.push({ ...src, asFormat: detected });
    } catch (e) {
      // Don't fail the whole bootstrap if one source is malformed — log it
      // and continue. The rest of the KG can still come together.
      skipped.push({ ...src, reason: e.message ?? String(e) });
      process.stderr.write(
        `  [ingest] skipped ${src.label}: ${e.message?.slice(0, 120) ?? e}\n`,
      );
    }
  }

  if (ingested.length === 0) {
    throw new Error(
      `couldn't ingest any of the ${sources.length} discovered sources — see log above.`,
    );
  }

  await report({
    cfg,
    state: "learning",
    message: "first learn pass (L1.5 insight swarm → L2 inference → L3 clones)…",
  });

  await marble.learn();

  // Run marble's adaptive investigation committee to fill knowledge gaps
  // (curator-driven probing, not gated on the first learn). Best-effort —
  // if investigate isn't available in this marble version, just skip.
  if (typeof marble.investigate === "function") {
    await report({
      cfg,
      state: "learning",
      message: "investigating gaps (adaptive committee)…",
    });
    try {
      await marble.investigate({ rounds: 1 });
    } catch (e) {
      // Don't fail the whole build on a flaky investigate pass.
      process.stderr.write(`  [investigate] skipped: ${e.message}\n`);
    }

    // Second learn pass — incorporates anything investigate() produced into
    // the L1.5/L2/L3 layers so the final KG reflects the full pipeline.
    await report({
      cfg,
      state: "learning",
      message: "second learn pass (incorporating new gap-beliefs)…",
    });
    try {
      await marble.learn();
    } catch (e) {
      process.stderr.write(`  [learn-2nd-pass] skipped: ${e.message}\n`);
    }
  }

  // Validate the KG actually has usable content. Newer marble versions
  // synthesize into `user.insights` even when the older slots stay empty
  // (sparse input data) — accept either.
  const finalKg = JSON.parse(readFileSync(kgPath, "utf8"));
  const user = finalKg.user ?? finalKg;
  const counts = {
    interests: user.interests?.length ?? 0,
    beliefs: user.beliefs?.length ?? 0,
    preferences: user.preferences?.length ?? 0,
    identities: user.identities?.length ?? 0,
    syntheses: user.syntheses?.length ?? 0,
    insights: user.insights?.length ?? 0,
    episodes: user.episodes?.length ?? 0,
  };
  const summary =
    `${counts.interests}i · ${counts.beliefs}b · ${counts.preferences}p · ` +
    `${counts.identities}id · ${counts.syntheses}t · ${counts.insights}insights`;

  const totalSignal = counts.interests + counts.beliefs + counts.preferences + counts.identities + counts.insights;
  if (totalSignal === 0) {
    throw new Error(
      `marble produced an empty KG (${summary}). The discovered sources may not have contained any extractable signal — try richer data.`,
    );
  }
  if (totalSignal < 5) {
    process.stderr.write(
      `\n  warning: KG is sparse (${summary}). Picks quality may be low.\n`,
    );
  }

  return { kgPath, summary, counts, ingested, skipped };
}

/**
 * Legacy single-file wrapper kept for backward compatibility with any caller
 * that hasn't moved to source arrays yet. Wraps the path in a one-item
 * sources array and delegates.
 */
export async function buildKgFromFile({ cfg, kgPath, dataPath, format = "auto" }) {
  if (!existsSync(dataPath)) {
    throw new Error(`data file not found: ${dataPath}`);
  }
  return buildKgFromSources({
    cfg,
    kgPath,
    sources: [
      {
        path: dataPath,
        format,
        kind: "manual-build-from",
        label: `manual override · ${path.basename(dataPath)}`,
        sizeBytes: statSync(dataPath).size,
        recordEstimate: 0,
      },
    ],
  });
}

/** Single-file ingest dispatch. Used inside the buildKgFromSources loop. */
async function ingestOne(marble, dataPath, detectedFormat) {
  if (detectedFormat === "chat") {
    await marble.ingestConversations(dataPath);
    return;
  }
  if (detectedFormat === "jsonl") {
    // JSONL → parse each non-empty line as an episode. We keep this lenient:
    // any line with a usable `content` / `text` field becomes an episode.
    const lines = readFileSync(dataPath, "utf8").split(/\r?\n/).filter(Boolean);
    const episodes = [];
    for (let i = 0; i < lines.length; i++) {
      let obj;
      try { obj = JSON.parse(lines[i]); } catch { continue; }
      const text = extractEpisodeText(obj);
      if (!text || text.length < 8) continue;
      episodes.push({
        id: `${path.basename(dataPath)}-${i}`,
        timestamp:
          (typeof obj?.timestamp === "string" && obj.timestamp) ||
          new Date(Date.now() - (lines.length - i) * 86_400_000).toISOString(),
        text,
      });
    }
    if (episodes.length === 0) throw new Error("jsonl: no usable lines");
    await marble.ingestEpisodes(episodes);
    return;
  }
  if (detectedFormat === "episodes") {
    const raw = readFileSync(dataPath, "utf8");
    const parsed = JSON.parse(raw);
    const episodes = Array.isArray(parsed) ? parsed : parsed.episodes;
    if (!Array.isArray(episodes)) throw new Error("expected array of episodes");
    await marble.ingestEpisodes(episodes);
    return;
  }
  if (detectedFormat === "text") {
    const text = readFileSync(dataPath, "utf8");
    const paragraphs = text
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    if (paragraphs.length === 0) throw new Error("file appears empty");
    const episodes = paragraphs.map((p, i) => ({
      id: `${path.basename(dataPath)}-${i}`,
      timestamp: new Date(Date.now() - (paragraphs.length - i) * 86_400_000).toISOString(),
      text: p,
    }));
    await marble.ingestEpisodes(episodes);
    return;
  }
  throw new Error(`unknown format: ${detectedFormat}`);
}

/** Convert discover-data's format field into the dispatch token ingestOne expects. */
function normalizeFormat(src) {
  // Most JSON sources are chat-shape. The exception is when the JSON is
  // explicitly an episodes array — we let the auto-detect path handle that.
  if (src.format === "json") return src.kind === "chatgpt-export" || src.kind === "chatgpt-export-archive" || src.kind === "json-chat-heuristic" || src.kind === "claude-desktop" ? "chat" : detectFormat(src.path);
  return src.format;
}

/** Extract a single representative text string from a parsed JSONL row. Covers
 *  Claude Code session lines, ChatGPT message rows, and generic shapes. */
function extractEpisodeText(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.content === "string") return obj.content;
  // ChatGPT-style: message.content.parts[]
  if (obj.message && obj.message.content) {
    const c = obj.message.content;
    if (typeof c === "string") return c;
    if (Array.isArray(c?.parts)) return c.parts.filter((p) => typeof p === "string").join("\n");
  }
  // Claude Code session: { role, content } where content can be string or array
  if (typeof obj.role === "string" && obj.content) {
    if (typeof obj.content === "string") return obj.content;
    if (Array.isArray(obj.content)) {
      return obj.content
        .map((part) =>
          typeof part === "string"
            ? part
            : typeof part?.text === "string"
              ? part.text
              : "",
        )
        .filter(Boolean)
        .join("\n");
    }
  }
  return null;
}

// ---- helpers ----

function detectFormat(dataPath) {
  const ext = path.extname(dataPath).toLowerCase();
  const sizeBytes = statSync(dataPath).size;

  if (ext === ".txt" || ext === ".md") return "text";

  if (ext === ".json") {
    // Peek at the first 4 KB to decide chat vs episodes shape.
    const peek = readFileSync(dataPath, { encoding: "utf8", flag: "r" }).slice(0, 4096);
    try {
      const trimmed = peek.trim();
      if (trimmed.startsWith("[")) return "episodes"; // bare array
      if (trimmed.startsWith("{")) {
        // Quick text-based detection without a full parse (file may be huge).
        if (/"messages"\s*:/.test(peek) || /"conversations"\s*:/.test(peek)) return "chat";
        if (/"episodes"\s*:/.test(peek)) return "episodes";
      }
    } catch {
      // fall through
    }
    // Default for JSON: assume chat export (most common case for marble).
    return "chat";
  }

  // Anything else → text-as-episodes fallback. Caller should pass --format explicitly.
  if (sizeBytes > 0) return "text";

  throw new Error(`empty file: ${dataPath}`);
}

function commandExistsSync(cmd) {
  try {
    const which = spawnSync(
      process.platform === "win32" ? "where" : "which",
      [cmd],
      { stdio: "ignore" },
    );
    return which.status === 0;
  } catch {
    return false;
  }
}

/**
 * Build the `(prompt: string) => Promise<string>` callable that marble's
 * constructor expects. Wraps OpenCode Zen / Anthropic's /v1/messages endpoint.
 *
 * Marble itself splits work between "heavy" (e.g. trait synthesis) and "fast"
 * (e.g. miner extraction) models, but at the user-llm contract level the
 * signature is a single text-in/text-out function. We use the same model for
 * both — keeps cost predictable and Haiku is fast enough for both passes.
 */
function buildLlmFn(provider, apiKey) {
  const PROVIDER_BASES = {
    opencode: "https://opencode.ai/zen/v1",
    anthropic: "https://api.anthropic.com/v1",
  };
  const DEFAULT_MODELS = {
    opencode: process.env.MARBLE_LLM_MODEL || "claude-haiku-4-5",
    anthropic: process.env.MARBLE_LLM_MODEL || "claude-haiku-4-5",
  };
  if (!(provider in PROVIDER_BASES)) {
    throw new Error(
      `marble-build: provider '${provider}' is not supported yet for KG bootstrapping ` +
        "(only opencode and anthropic). Set --provider on init or use an existing KG.",
    );
  }
  const base = PROVIDER_BASES[provider];
  const model = DEFAULT_MODELS[provider];

  return async function llm(prompt) {
    const res = await fetch(`${base}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `marble llm call: ${provider}/${model} HTTP ${res.status} ${text.slice(0, 200)}`,
      );
    }
    const body = await res.json();
    return body?.content?.[0]?.text ?? "";
  };
}

// quell unused import warnings (commandExistsSync no longer called after refactor;
// __dirname is here for future use by ingestion helpers)
void __dirname;
void commandExistsSync;
