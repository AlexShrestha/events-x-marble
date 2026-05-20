/**
 * `events-x-marble status` — show config + the last successful push timestamp.
 * Token is redacted in the output. Use `cat ~/.events-x-marble/config.json` if
 * you actually need the plaintext (e.g. for debugging).
 */
import { existsSync } from "node:fs";
import { CONFIG_FILE, expandHome, loadConfig } from "./config.mjs";
import { kgCounts, loadKg } from "./kg-load.mjs";

export async function run() {
  const cfg = loadConfig();

  process.stdout.write(`events-x-marble status\n`);
  process.stdout.write(`  config       : ${CONFIG_FILE}\n`);
  process.stdout.write(`  user_id      : ${cfg.user_id}\n`);
  process.stdout.write(`  display_name : ${cfg.display_name ?? "(unset)"}\n`);
  process.stdout.write(`  site_url     : ${cfg.site_url}\n`);
  process.stdout.write(`  token        : ${redact(cfg.token)}\n`);
  process.stdout.write(`  city_slug    : ${cfg.city_slug}\n`);
  process.stdout.write(`  llm_provider : ${cfg.llm_provider}\n`);
  process.stdout.write(`  llm key env  : ${cfg.llm_api_key_env} (${process.env[cfg.llm_api_key_env] ? "present" : "MISSING — set it!"})\n`);
  process.stdout.write(`  created_at   : ${cfg.created_at}\n`);
  process.stdout.write(`  last_push_at : ${cfg.last_push_at ?? "(never)"}\n`);

  const kgPath = expandHome(cfg.kg_path);
  if (!existsSync(kgPath)) {
    process.stdout.write(`  kg_path      : ${kgPath}  (MISSING)\n`);
    return;
  }
  try {
    const { kg } = await loadKg(kgPath);
    const c = kgCounts(kg);
    process.stdout.write(`  kg_path      : ${kgPath}\n`);
    process.stdout.write(
      `  kg stats     : ${c.beliefs} beliefs · ${c.preferences} prefs · ${c.identities} ids · ${c.interests} interests · ${c.syntheses} traits\n`,
    );
  } catch (e) {
    process.stdout.write(`  kg_path      : ${kgPath}  (UNREADABLE: ${e.message})\n`);
  }
}

function redact(t) {
  if (!t || t.length < 12) return "(redacted)";
  return t.slice(0, 8) + "…" + t.slice(-4);
}
