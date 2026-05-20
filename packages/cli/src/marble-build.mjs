/**
 * Marble black-box wrapper. Builds a marble KG from a user-supplied data file
 * without the user ever invoking the `marble` CLI or knowing it's there.
 *
 * The `marble` npm dep ships its own LLM provider layer that reads env vars
 * (LLM_PROVIDER + provider-specific API key). We don't pass a custom `llm`
 * function to the Marble constructor — we just configure those env vars from
 * the events-x-marble config and let marble do the rest.
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
 * Build a KG file at kgPath from dataPath, using marble.
 * Returns { kgPath, summary } on success. Throws on failure.
 *
 * cfg fields used: site_url, token (for status reports), llm_provider, llm_api_key_env
 */
export async function buildKgFromFile({ cfg, kgPath, dataPath, format = "auto" }) {
  if (!existsSync(dataPath)) {
    throw new Error(`data file not found: ${dataPath}`);
  }

  const apiKey = process.env[cfg.llm_api_key_env];
  if (!apiKey) {
    throw new Error(`${cfg.llm_api_key_env} not set in env — required by marble for KG synthesis`);
  }

  const marbleProvider = PROVIDER_MAP[cfg.llm_provider];
  if (!marbleProvider) {
    throw new Error(`marble doesn't support provider '${cfg.llm_provider}' yet`);
  }

  // Configure marble via env. We intentionally don't expose marble's CLI to
  // the user — set these for THIS process only, marble's import-time provider
  // discovery picks them up.
  process.env.LLM_PROVIDER = marbleProvider;
  // Suppress the embeddings-not-configured banner; events-x-marble doesn't use
  // semantic embeddings (the scorer prompt does the heavy lifting via LLM).
  if (!process.env.EMBEDDINGS_PROVIDER) process.env.EMBEDDINGS_PROVIDER = "none";

  // Mirror the user's API key into whatever env name marble expects.
  switch (marbleProvider) {
    case "opencode":
      // Marble's opencode provider runs the CLI; it doesn't need an API key,
      // but it does need the opencode binary in PATH. For Pass B v1 we'll
      // fall back to anthropic-format direct HTTP via openai-compatible if
      // opencode CLI isn't installed.
      if (!process.env.OPENCODE_BIN && !commandExistsSync("opencode")) {
        // Reroute to anthropic-compatible HTTP: marble has 'openai-compatible'
        // which works with OpenCode Zen's /v1 endpoint.
        process.env.LLM_PROVIDER = "openai-compatible";
        process.env.LLM_BASE_URL = "https://opencode.ai/zen/v1";
        process.env.LLM_API_KEY = apiKey;
        process.env.MARBLE_LLM_MODEL = process.env.MARBLE_LLM_MODEL ?? "claude-haiku-4-5";
      }
      break;
    case "anthropic":
      process.env.ANTHROPIC_API_KEY = apiKey;
      break;
    case "openai":
      process.env.OPENAI_API_KEY = apiKey;
      break;
  }

  // Dynamically import marble so the embeddings banner only fires when this
  // function actually runs (not on every CLI invocation).
  const { Marble } = await import("marble");

  const detectedFormat = format === "auto" ? detectFormat(dataPath) : format;
  await report({
    cfg,
    state: "ingesting",
    message: `ingesting ${path.basename(dataPath)} as ${detectedFormat}…`,
  });

  const marble = new Marble({
    storage: kgPath,
    silent: true, // don't print warnings; we report via status
  });
  await marble.init();

  if (detectedFormat === "chat") {
    await marble.ingestConversations(dataPath);
  } else if (detectedFormat === "episodes") {
    const raw = readFileSync(dataPath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`couldn't parse ${dataPath} as JSON: ${e.message}`);
    }
    const episodes = Array.isArray(parsed) ? parsed : parsed.episodes;
    if (!Array.isArray(episodes)) {
      throw new Error(`expected an array of episodes in ${dataPath} (got ${typeof episodes})`);
    }
    await marble.ingestEpisodes(episodes);
  } else if (detectedFormat === "text") {
    // Treat each non-empty paragraph as a single-message episode. Quick but
    // reasonable for journals / freeform notes.
    const text = readFileSync(dataPath, "utf8");
    const paragraphs = text
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    if (paragraphs.length === 0) {
      throw new Error(`no usable content in ${dataPath} (file appears empty)`);
    }
    const episodes = paragraphs.map((p, i) => ({
      id: `txt-${i}`,
      timestamp: new Date(Date.now() - (paragraphs.length - i) * 86_400_000).toISOString(),
      text: p,
    }));
    await marble.ingestEpisodes(episodes);
  } else {
    throw new Error(`unknown format: ${detectedFormat}`);
  }

  await report({
    cfg,
    state: "learning",
    message: "synthesising patterns across your KG… (this can take 2–5 minutes)",
  });

  await marble.learn();

  // Validate the KG actually has usable content.
  const finalKg = JSON.parse(readFileSync(kgPath, "utf8"));
  const user = finalKg.user ?? finalKg;
  const counts = {
    interests: user.interests?.length ?? 0,
    beliefs: user.beliefs?.length ?? 0,
    preferences: user.preferences?.length ?? 0,
    identities: user.identities?.length ?? 0,
    syntheses: user.syntheses?.length ?? 0,
  };
  const summary = `${counts.interests}i · ${counts.beliefs}b · ${counts.preferences}p · ${counts.identities}id · ${counts.syntheses}t`;

  if (counts.interests === 0 && counts.beliefs < 3) {
    throw new Error(
      `marble built a KG but it's nearly empty (${summary}). The input data may have been too short or shaped wrong. Try a larger / more varied data file.`,
    );
  }

  return { kgPath, summary, counts };
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

// quell unused import warning
void __dirname;
