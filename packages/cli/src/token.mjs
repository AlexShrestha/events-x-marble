/**
 * `events-x-marble token rotate` — issue a new token, revoke the current one.
 * The new token replaces the one in config.json. Existing browser cookies
 * stay valid (they're HMAC-signed with userId, not with token).
 */
import { loadConfig, saveConfig } from "./config.mjs";
import { rotateToken } from "./server-client.mjs";

export async function run(args) {
  const sub = args[0];
  if (sub !== "rotate") {
    process.stderr.write("Usage: events-x-marble token rotate\n");
    process.exit(2);
  }

  const cfg = loadConfig();
  process.stderr.write(`[token rotate] requesting new token for user ${cfg.user_id}…\n`);

  const result = await rotateToken({
    siteUrl: cfg.site_url,
    token: cfg.token,
    label: "rotated",
  });
  if (!result?.token) {
    throw new Error(`rotate returned no token: ${JSON.stringify(result)}`);
  }

  saveConfig({ token: result.token });
  process.stderr.write(`[token rotate] ✓ new token saved.\n`);
  process.stderr.write(`  new token id : ${result.token_id}\n`);
  process.stderr.write(`  revoked id   : ${result.revoked_token_id}\n`);
}
