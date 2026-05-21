/**
 * `events-x-marble update` — refresh the laptop install.
 *
 * Pulls the latest events-x-marble code from GitHub AND re-runs npm install,
 * which transitively refreshes marble (since marble is a git-URL dep in
 * packages/cli/package.json — npm pulls main on reinstall).
 *
 * Use this when:
 *   - marble core ships a new version (better extraction, faster learn, etc.)
 *   - events-x-marble CLI gets a fix or a feature
 *   - your local clone has gotten out of sync somehow
 *
 * Does NOT:
 *   - re-run init (your token / config / KG stay put)
 *   - re-build your KG (use `events-x-marble run` after update if you want
 *     to re-score with the new marble version)
 *   - rotate your token
 *
 * Flags:
 *   --skip-deps    Skip the `npm install` step (just git fetch + reset).
 *                  Useful for tiny CLI-only changes that don't touch
 *                  package.json.
 *   --quiet        Less output. Errors still surface.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseFlags } from "./prompt.mjs";
import { CONFIG_DIR } from "./config.mjs";

const REPO_DIR = path.join(CONFIG_DIR, "repo");
const CLI_DIR = path.join(REPO_DIR, "packages", "cli");

export async function run(args) {
  const flags = parseFlags(args);
  const quiet = Boolean(flags.quiet);

  if (!existsSync(REPO_DIR)) {
    process.stderr.write(
      `✗ events × marble install not found at ${REPO_DIR}. Run the install command from /connect first.\n`,
    );
    process.exit(1);
  }
  if (!existsSync(path.join(REPO_DIR, ".git"))) {
    process.stderr.write(
      `✗ ${REPO_DIR} exists but isn't a git checkout. Something's off — re-run the install command from /connect to repair.\n`,
    );
    process.exit(1);
  }

  // Record the commit we're updating FROM, so we can show what changed.
  const beforeSha = gitOutput(REPO_DIR, ["rev-parse", "HEAD"]) ?? "(unknown)";
  const beforeShort = beforeSha.slice(0, 7);

  log(quiet, "▸ fetching latest from github.com/AlexShrestha/events-x-marble…");
  if (!gitOk(REPO_DIR, ["fetch", "--quiet", "origin"])) {
    process.stderr.write(
      `\n✗ couldn't reach github.com — check your connection and re-run.\n`,
    );
    process.exit(1);
  }

  const afterSha = gitOutput(REPO_DIR, ["rev-parse", "origin/HEAD"]) ?? beforeSha;
  if (afterSha === beforeSha) {
    log(quiet, `✓ already up to date (HEAD ${beforeShort}).`);
    process.exit(0);
  }
  const afterShort = afterSha.slice(0, 7);

  log(quiet, `▸ updating ${beforeShort} → ${afterShort}`);

  // Show what's changing — first 10 commits between old and new HEAD.
  const log10 = gitOutput(REPO_DIR, [
    "log",
    "--oneline",
    "--no-decorate",
    `${beforeSha}..${afterSha}`,
  ]);
  if (log10 && !quiet) {
    const lines = log10.split("\n").filter(Boolean).slice(0, 10);
    process.stderr.write("\n  what's new:\n");
    for (const line of lines) process.stderr.write(`    ${line}\n`);
    if (log10.split("\n").filter(Boolean).length > 10) {
      process.stderr.write(`    …and more — see github.com/AlexShrestha/events-x-marble/commits\n`);
    }
    process.stderr.write("\n");
  }

  // Hard reset to origin/HEAD. We don't care about local edits in this dir —
  // it's a CLI install, not a working tree.
  if (!gitOk(REPO_DIR, ["reset", "--quiet", "--hard", afterSha])) {
    process.stderr.write(`\n✗ git reset failed.\n`);
    process.exit(1);
  }
  log(quiet, "✓ code updated");

  if (flags["skip-deps"]) {
    log(quiet, "  --skip-deps: not refreshing dependencies");
  } else {
    log(quiet, "▸ refreshing dependencies (this also pulls the latest marble)…");
    if (!npmOk(CLI_DIR)) {
      process.stderr.write(
        `\n✗ npm install failed. Your CLI may be in a half-updated state.\n` +
          `  Try: cd ${CLI_DIR} && npm install --omit=dev\n`,
      );
      process.exit(1);
    }
    log(quiet, "✓ dependencies refreshed");
  }

  // Show the new marble version we just pulled, if available.
  try {
    const marblePkg = JSON.parse(
      readFileSync(path.join(CLI_DIR, "node_modules", "marble", "package.json"), "utf8"),
    );
    log(quiet, `\n✓ done. CLI ${afterShort} · marble ${marblePkg.version ?? "?"}`);
  } catch {
    log(quiet, `\n✓ done. CLI now at ${afterShort}.`);
  }
  process.stderr.write(
    "  Re-run `events-x-marble run` to score this week against your KG with the new marble.\n",
  );
}

// ---- helpers ----

function log(quiet, msg) {
  if (!quiet) process.stderr.write(`${msg}\n`);
}

function gitOk(cwd, args) {
  const r = spawnSync("git", args, { cwd, stdio: "inherit" });
  return r.status === 0;
}

function gitOutput(cwd, args) {
  const r = spawnSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] });
  if (r.status !== 0) return null;
  return r.stdout.toString().trim();
}

function npmOk(cwd) {
  const r = spawnSync(
    "npm",
    ["install", "--omit=dev", "--no-audit", "--no-fund", "--silent"],
    { cwd, stdio: "inherit" },
  );
  return r.status === 0;
}
