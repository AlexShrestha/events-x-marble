#!/usr/bin/env node
/**
 * preinstall hook: keep the local marble checkout fresh.
 *
 * Runs before every `bun install` / `npm install`. If the user is Alex (or any
 * dev with a sibling `../GitHub/marble` clone), we fast-forward that checkout
 * to origin/main so the `file:`/`link:` dep — and any subsequent local edits —
 * are layered on top of the freshest committed marble.
 *
 * Silent in all other environments (CI, Vercel build, end-user laptops): if
 * `../GitHub/marble/.git` doesn't exist the script exits 0 and `npm install`
 * continues as if this hook didn't fire.
 *
 * Failures are logged to stderr but never block install — a flaky network,
 * an uncommitted local change, or a detached HEAD shouldn't make `bun install`
 * fail. The worst case is "marble stays at whatever commit you last had,"
 * which `bun run sync:marble` (or a manual `git pull`) can fix later.
 *
 * Resolution: walks up from process.cwd() looking for a sibling
 * `GitHub/marble` directory. This means both the root install AND the
 * packages/cli install share one script — they each find the same marble
 * checkout regardless of which workspace `npm install` was invoked from.
 */
import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const QUIET = process.env.EXM_PREINSTALL_QUIET === "1";

function log(msg) {
  if (!QUIET) process.stderr.write(`[preinstall-marble] ${msg}\n`);
}

/**
 * Walk upward from `start` looking for the first directory containing
 * `GitHub/marble/.git`. Stops at the filesystem root. Returns the absolute
 * marble path on hit, or null when nothing matches.
 *
 * We walk because the hook runs from `process.cwd()` which can be:
 *   - the events-x-marble root          → ../GitHub/marble
 *   - packages/cli (when nested install) → ../../../GitHub/marble
 *   - a temp dir that bun/npm chose       → walk until we find it
 */
function findMarbleCheckout(start) {
  let dir = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "..", "GitHub", "marble", ".git");
    try {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        return path.resolve(path.join(candidate, ".."));
      }
    } catch {
      // ignore — keep walking
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}

function main() {
  const marbleDir = findMarbleCheckout(process.cwd());
  if (!marbleDir) {
    // Not Alex's dev box — silent skip. CI/Vercel/user laptops land here.
    return;
  }

  // Refuse to operate on a dirty tree — Alex's uncommitted marble edits stay
  // untouched. A clean `git pull --ff-only` only ever fast-forwards.
  const statusBefore = git(["status", "--porcelain"], marbleDir);
  if (!statusBefore.ok) {
    log(`couldn't check git status in ${marbleDir} — skipping pull.`);
    return;
  }
  if (statusBefore.stdout.length > 0) {
    log(`local marble has uncommitted changes — skipping pull to preserve them.`);
    return;
  }

  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], marbleDir);
  if (!branch.ok || branch.stdout === "HEAD") {
    log(`marble is on a detached HEAD (or branch lookup failed) — skipping pull.`);
    return;
  }
  if (branch.stdout !== "main") {
    log(`marble is on branch '${branch.stdout}' (not main) — skipping pull.`);
    return;
  }

  const before = git(["rev-parse", "--short", "HEAD"], marbleDir).stdout;

  const fetch = git(["fetch", "--quiet", "origin", "main"], marbleDir);
  if (!fetch.ok) {
    log(`git fetch failed (network? auth?) — keeping marble at ${before}. ${fetch.stderr.slice(0, 200)}`);
    return;
  }

  const pull = git(["pull", "--ff-only", "--quiet", "origin", "main"], marbleDir);
  if (!pull.ok) {
    log(`git pull --ff-only failed (diverged history?) — keeping marble at ${before}.`);
    return;
  }

  const after = git(["rev-parse", "--short", "HEAD"], marbleDir).stdout;
  if (before === after) {
    log(`marble already at origin/main (${after}).`);
  } else {
    log(`marble ${before} → ${after} (pulled latest from origin/main).`);
  }
}

try {
  main();
} catch (e) {
  log(`unexpected error — skipping pull. ${(e?.message ?? e).toString().slice(0, 200)}`);
}
// Always exit 0 — preinstall must never block npm/bun install.
process.exit(0);
