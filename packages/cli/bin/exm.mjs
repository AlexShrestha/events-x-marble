#!/usr/bin/env node
/**
 * events-x-marble — personalized event discovery for marble users.
 *
 * Subcommands:
 *   init         One-time setup: register with the server + store config locally.
 *   run          Score events using your local marble KG and push picks.
 *   status       Show current config + last-push info.
 *   token rotate Issue a new token, revoke the current one.
 *   disconnect   Revoke the token + optionally delete config.
 *   cron-install Schedule the weekly run via macOS launchd / Linux systemd.
 *
 * The marble lifecycle (init/ingest/learn) runs in-process via marble's library
 * API; the `marble` binary is intentionally NOT exposed to your PATH. KG file
 * lives at ~/.events-x-marble/marble-kg.json (private).
 *
 * Auth: a per-user token issued by events.timesmarble.com on first `init`.
 * Stored in ~/.events-x-marble/config.json (chmod 600).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));

const argv = process.argv.slice(2);
const cmd = argv[0];

const HELP = `events-x-marble v${PKG.version}

Usage:
  events-x-marble init [--site-url URL] [--dry-run]
  events-x-marble run [--city SLUG] [--threshold 0.85] [--days 14] [--dry-run]
  events-x-marble status
  events-x-marble token rotate
  events-x-marble disconnect [--keep-config]
  events-x-marble cron-install [--uninstall]
  events-x-marble --help | --version

Configuration lives at ~/.events-x-marble/config.json after \`init\`.
Run \`events-x-marble <command> --help\` for command-specific options.
`;

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
  process.stdout.write(HELP);
  process.exit(0);
}
if (cmd === "--version" || cmd === "-v") {
  process.stdout.write(`${PKG.version}\n`);
  process.exit(0);
}

const subcommands = {
  init: () => import("../src/init.mjs"),
  run: () => import("../src/run.mjs"),
  status: () => import("../src/status.mjs"),
  token: () => import("../src/token.mjs"),
  disconnect: () => import("../src/disconnect.mjs"),
  "cron-install": () => import("../src/cron-install.mjs"),
};

const handler = subcommands[cmd];
if (!handler) {
  process.stderr.write(`unknown command: ${cmd}\n\n${HELP}`);
  process.exit(2);
}

try {
  const mod = await handler();
  if (typeof mod.run !== "function") {
    process.stderr.write(`internal: command '${cmd}' has no run() export\n`);
    process.exit(1);
  }
  await mod.run(argv.slice(1));
} catch (err) {
  process.stderr.write(`\n✗ ${cmd} failed: ${err.message ?? err}\n`);
  if (process.env.EXM_DEBUG) process.stderr.write(err.stack + "\n");
  process.exit(1);
}
