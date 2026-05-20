/**
 * Auto-discover marble-ingestable data on the user's laptop.
 *
 * The black-box invariant: events × marble doesn't ask the user to point at a
 * single file. It scans known locations on their machine for anything marble
 * can learn from, then ingests all of it. The user grants "everything we
 * find" once at install — they don't have to pre-stage data.
 *
 * Sources we look for (in priority order):
 *   1. Claude Code session history    ~/.claude/projects/<proj>/<id>.jsonl
 *   2. Claude desktop conversations    ~/Library/Application Support/Anthropic/...
 *                                      ~/.config/Claude/conversations/...
 *   3. ChatGPT export archives         ~/Downloads/{conversations,chatgpt-*}.json
 *   4. Generic chat-shape JSON         ~/Downloads/*.json (peek-tested)
 *   5. Markdown journal-like files     ~/Documents/{Journal,Notes}/*.{md,txt}
 *
 * Each candidate is a path + an estimated record-count and a one-line label
 * for surfacing to the user. The caller picks all of them or filters by
 * --include / --exclude flags.
 *
 * Privacy contract holds: nothing here uploads anywhere. We just enumerate
 * candidates, then `marble-build.mjs` calls marble's lib API to ingest them
 * locally. The discovered file PATHS never leave the laptop (not even
 * to the server — only the synthesized KG state and the rent payload do).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const KB = 1024;
const MB = 1024 * 1024;

/**
 * Result row shape (JSDoc-only; .mjs has no interface keyword):
 *   {
 *     path:            string,    // absolute path on the laptop
 *     format:          "json" | "jsonl" | "text",
 *     kind:            "claude-code-session" | "claude-desktop" | "chatgpt-export"
 *                       | "chatgpt-export-archive" | "json-chat-heuristic" | "journal",
 *     label:           string,    // human-readable line shown during install
 *     sizeBytes:       number,
 *     recordEstimate:  number     // rough # of episodes the file might yield
 *   }
 */

/**
 * Run the full discovery sweep. Returns an array of candidates sorted by
 * "richness" (estimated useful signal). Each entry has:
 *   { path, format, label, kind, sizeBytes, recordEstimate }
 */
export function discoverDataSources({
  home = os.homedir(),
  includeMarkdown = true,
  includeRawDownloads = true,
  // Cap how many sources we hand to marble. Each source adds ~30-60s of
  // LLM-driven ingest, so 10-15 is a sensible default. Heavy Claude Code
  // users will have HUNDREDS of session files — we pick the richest.
  limit = 12,
} = {}) {
  const found = [];

  // 1. Claude Code session history
  scanClaudeCode(home, found);

  // 2. Claude desktop
  scanClaudeDesktop(home, found);

  // 3. ChatGPT exports
  scanChatGptExports(home, found);

  // 4. Generic chat-shape JSON in Downloads
  if (includeRawDownloads) scanDownloads(home, found);

  // 5. Markdown journals
  if (includeMarkdown) scanJournals(home, found);

  // Sort: prefer higher recordEstimate, then larger files.
  found.sort((a, b) => {
    const r = (b.recordEstimate ?? 0) - (a.recordEstimate ?? 0);
    if (r !== 0) return r;
    return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0);
  });

  return found.slice(0, limit);
}

// ---- scanners ------------------------------------------------------------

function scanClaudeCode(home, found) {
  const root = path.join(home, ".claude", "projects");
  if (!existsSync(root)) return;
  try {
    const projects = readdirSync(root);
    for (const proj of projects) {
      const projDir = path.join(root, proj);
      let stat;
      try { stat = statSync(projDir); } catch { continue; }
      if (!stat.isDirectory()) continue;
      const files = readdirSync(projDir).filter((f) => f.endsWith(".jsonl"));
      for (const f of files) {
        const p = path.join(projDir, f);
        const s = safeStat(p);
        if (!s || s.size < 1024) continue;
        // Conservative line-count estimate from size.
        const recordEstimate = Math.max(1, Math.floor(s.size / 4_000));
        found.push({
          path: p,
          format: "jsonl",
          kind: "claude-code-session",
          label: `Claude Code · ${prettyProject(proj)} · ${f.replace(/\.jsonl$/, "")}`,
          sizeBytes: s.size,
          recordEstimate,
        });
      }
    }
  } catch {
    // best-effort; skip silently
  }
}

function scanClaudeDesktop(home, found) {
  const candidates = [
    path.join(home, "Library", "Application Support", "Anthropic"),
    path.join(home, "Library", "Application Support", "Claude"),
    path.join(home, ".config", "Anthropic"),
    path.join(home, ".config", "Claude"),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    walkShallow(dir, 3, (p, s) => {
      const base = path.basename(p).toLowerCase();
      if (!base.endsWith(".json") && !base.endsWith(".jsonl")) return;
      if (s.size < 1024) return;
      if (!/conv|chat|message|session/.test(base)) return;
      found.push({
        path: p,
        format: base.endsWith(".jsonl") ? "jsonl" : "json",
        kind: "claude-desktop",
        label: `Claude desktop · ${path.relative(home, p)}`,
        sizeBytes: s.size,
        recordEstimate: Math.floor(s.size / 6_000),
      });
    });
  }
}

function scanChatGptExports(home, found) {
  const downloads = path.join(home, "Downloads");
  if (!existsSync(downloads)) return;
  try {
    const entries = readdirSync(downloads);
    for (const f of entries) {
      const lower = f.toLowerCase();
      // STRICT: only .json / .jsonl. Installers (.dmg) and archives (.zip)
      // would be matched by older logic — exclude them outright.
      if (!lower.endsWith(".json") && !lower.endsWith(".jsonl")) continue;
      const isChatGpt =
        lower === "conversations.json" ||
        lower.startsWith("conversations.") ||
        lower.startsWith("conversations-") ||
        lower.startsWith("chatgpt-") ||
        lower.startsWith("chatgpt_") ||
        /^chat[._-]?gpt.*\.jsonl?$/.test(lower);
      if (!isChatGpt) continue;
      const p = path.join(downloads, f);
      const s = safeStat(p);
      if (!s || !s.isFile() || s.size < 1024) continue;
      found.push({
        path: p,
        format: lower.endsWith(".jsonl") ? "jsonl" : "json",
        kind: "chatgpt-export",
        label: `ChatGPT export · ${f}`,
        sizeBytes: s.size,
        recordEstimate: Math.floor(s.size / 8_000),
      });
    }
    // Also look inside extracted ChatGPT-export folders.
    for (const f of entries) {
      const sub = path.join(downloads, f);
      let stat;
      try { stat = statSync(sub); } catch { continue; }
      if (!stat.isDirectory()) continue;
      if (!/chatgpt|conversations/i.test(f)) continue;
      const inner = path.join(sub, "conversations.json");
      if (existsSync(inner)) {
        const s = safeStat(inner);
        if (s && s.size > 1024) {
          found.push({
            path: inner,
            format: "json",
            kind: "chatgpt-export-archive",
            label: `ChatGPT export · ${f}/conversations.json`,
            sizeBytes: s.size,
            recordEstimate: Math.floor(s.size / 8_000),
          });
        }
      }
    }
  } catch {
    // ignore
  }
}

function scanDownloads(home, found) {
  const downloads = path.join(home, "Downloads");
  if (!existsSync(downloads)) return;
  try {
    const entries = readdirSync(downloads);
    for (const f of entries) {
      const lower = f.toLowerCase();
      if (!lower.endsWith(".json")) continue;
      // Skip marble-KG files themselves — those are OUTPUT, not input.
      if (/marble/i.test(lower) && /kg/i.test(lower)) continue;
      // Skip files we already added in other scanners.
      const p = path.join(downloads, f);
      if (found.some((x) => x.path === p)) continue;
      const s = safeStat(p);
      if (!s || !s.isFile()) continue;
      if (s.size < 4 * KB || s.size > 200 * MB) continue;
      // Peek for chat-message shape.
      if (!peekChatShape(p)) continue;
      found.push({
        path: p,
        format: "json",
        kind: "json-chat-heuristic",
        label: `JSON (chat-shape) · Downloads/${f}`,
        sizeBytes: s.size,
        recordEstimate: Math.floor(s.size / 10_000),
      });
    }
  } catch {
    // ignore
  }
}

function scanJournals(home, found) {
  const candidates = [
    path.join(home, "Documents", "Journal"),
    path.join(home, "Documents", "Notes"),
    path.join(home, "Documents", "Obsidian"),
    path.join(home, "Notes"),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    walkShallow(dir, 4, (p, s) => {
      const ext = path.extname(p).toLowerCase();
      if (![".md", ".txt", ".markdown"].includes(ext)) return;
      if (s.size < 256) return;
      found.push({
        path: p,
        format: "text",
        kind: "journal",
        label: `Journal · ${path.relative(home, p)}`,
        sizeBytes: s.size,
        recordEstimate: 1, // one episode per file
      });
    });
  }
}

// ---- helpers -------------------------------------------------------------

function safeStat(p) {
  try { return statSync(p); } catch { return null; }
}

/**
 * Look at the first 4 KB and check for chat-message shape:
 *   - has at least one of "role", "content", "message", "messages", "conversations"
 *   - looks like JSON (starts with { or [)
 */
function peekChatShape(p) {
  try {
    const fd = readFileSync(p, { encoding: "utf8" }).slice(0, 4096);
    const t = fd.trimStart();
    if (!t.startsWith("{") && !t.startsWith("[")) return false;
    const lower = fd.toLowerCase();
    return /"(role|content|messages|conversations|author|create_time)"\s*:/.test(lower);
  } catch {
    return false;
  }
}

function walkShallow(root, depth, visit) {
  if (depth < 0) return;
  let entries;
  try {
    entries = readdirSync(root);
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(root, e);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isFile()) {
      visit(p, s);
    } else if (s.isDirectory() && !e.startsWith(".")) {
      walkShallow(p, depth - 1, visit);
    }
  }
}

function prettyProject(slug) {
  // ".claude/projects" uses sanitized slugs like "-Users-skela-Documents-foo"
  return slug.replace(/^-/, "/").replace(/-/g, "/").split("/").pop() || slug;
}
