/**
 * `events-x-marble disconnect` — revoke all tokens for this user on the server
 * and delete the local config (unless --keep-config).
 *
 * Does NOT delete the KG file. If you want a full wipe including the KG,
 * remove ~/.events-x-marble/ manually.
 */
import { existsSync, unlinkSync } from "node:fs";
import { CONFIG_FILE, loadConfig } from "./config.mjs";
import { disconnect as serverDisconnect } from "./server-client.mjs";
import { askYesNo, parseFlags } from "./prompt.mjs";

export async function run(args) {
  const flags = parseFlags(args);

  const cfg = loadConfig();
  process.stderr.write(
    `[disconnect] this will revoke all server-side tokens for user ${cfg.user_id}.\n`,
  );
  const confirm = await askYesNo("proceed?", { default: false });
  if (!confirm) {
    process.stderr.write("aborted.\n");
    return;
  }

  try {
    const result = await serverDisconnect({
      siteUrl: cfg.site_url,
      token: cfg.token,
    });
    process.stderr.write(
      `[disconnect] ✓ server confirmed: ${JSON.stringify(result)}\n`,
    );
  } catch (e) {
    process.stderr.write(
      `[disconnect] server call failed (${e.message}) — continuing with local cleanup.\n`,
    );
  }

  if (flags["keep-config"]) {
    process.stderr.write(`[disconnect] --keep-config: local config left in place at ${CONFIG_FILE}\n`);
    return;
  }

  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
    process.stderr.write(`[disconnect] ✓ deleted ${CONFIG_FILE}\n`);
  }
  process.stderr.write(
    "  (KG file at ~/.events-x-marble/marble-kg.json was NOT deleted — remove manually if you want a full wipe)\n",
  );
}
