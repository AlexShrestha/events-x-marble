/**
 * Config storage for events-x-marble.
 *
 * Location: ~/.events-x-marble/config.json
 *
 * Layout:
 *   {
 *     site_url:        "https://events.timesmarble.com",
 *     user_id:         "usr_xxx",
 *     token:           "tok_xxx",          // plaintext — chmod 600 on the file
 *     llm_provider:    "anthropic" | "openai" | "opencode",
 *     llm_api_key_env: "ANTHROPIC_API_KEY", // env var name where the key lives
 *     city_slug:       "barcelona",
 *     kg_path:         "~/.events-x-marble/marble-kg.json",
 *     created_at:      ISO timestamp,
 *     last_push_at:    ISO timestamp | null
 *   }
 *
 * The plaintext token only exists here and in the user's browser cookie
 * after they visit the connect URL. Server stores sha256 only.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const CONFIG_DIR = path.join(os.homedir(), ".events-x-marble");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const DEFAULT_KG_PATH = path.join(CONFIG_DIR, "marble-kg.json");

export const DEFAULT_SITE_URL = "https://events.timesmarble.com";

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig() {
  if (!existsSync(CONFIG_FILE)) {
    throw new Error(
      `not initialized — run \`events-x-marble init\` first (no config at ${CONFIG_FILE})`,
    );
  }
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch (e) {
    throw new Error(`config file corrupt: ${e.message ?? e}`);
  }
}

export function saveConfig(cfg) {
  ensureConfigDir();
  const merged = {
    ...(existsSync(CONFIG_FILE) ? safeRead() : {}),
    ...cfg,
  };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + "\n", "utf8");
  try {
    chmodSync(CONFIG_FILE, 0o600);
  } catch {
    // Best-effort; e.g. fails on Windows. The file is at least written.
  }
  return merged;
}

export function deleteConfig() {
  if (!existsSync(CONFIG_FILE)) return false;
  // Don't delete the dir — user might want to keep the KG file separately.
  // The KG path (if inside CONFIG_DIR) is preserved unless --purge is used.
  try {
    writeFileSync(CONFIG_FILE, "{}", "utf8");
  } catch {
    // ignore
  }
  return true;
}

function safeRead() {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

/** Expand "~" to the home directory at use-time (we store the raw path). */
export function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~/") || p === "~") {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

/** Resolve the API key from env, given the configured provider/env-name. */
export function resolveApiKey(cfg) {
  const envName = cfg.llm_api_key_env;
  if (!envName) {
    throw new Error("llm_api_key_env not set in config — re-run `init`");
  }
  const value = process.env[envName];
  if (!value) {
    throw new Error(
      `env var ${envName} not set — export it before running, e.g.\n  export ${envName}=sk-...`,
    );
  }
  return value;
}
