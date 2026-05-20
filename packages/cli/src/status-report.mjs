/**
 * Tiny client for /api/v1/me/status. Every meaningful step in the CLI calls
 * one of the helpers below so the website can render a live picture of the
 * user's onboarding and surface failures with category + email-support link.
 *
 * All reports are best-effort — a failing status POST never blocks the local
 * pipeline. We log the error locally and continue.
 *
 * Vendored client info (`exm v0.1.0 / hostname`) is intentionally sparse — no
 * file paths or KG details ever leave the laptop in this surface.
 */
import os from "node:os";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));

const CLIENT_INFO = `exm v${PKG.version} / ${safeHostname()}`;

export async function report({ cfg, state, message, errorCategory }) {
  if (!cfg || !cfg.site_url || !cfg.token) {
    // Not yet initialized — nothing we can send. The init flow does its own
    // reporting *after* config is saved.
    return;
  }
  const url = `${cfg.site_url.replace(/\/$/, "")}/api/v1/me/status?token=${encodeURIComponent(cfg.token)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        state,
        ...(message ? { message } : {}),
        ...(errorCategory ? { error_category: errorCategory } : {}),
        client_info: CLIENT_INFO,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      process.stderr.write(
        `[status-report] server returned ${res.status} (state=${state}): ${text.slice(0, 200)}\n`,
      );
    }
  } catch (e) {
    process.stderr.write(`[status-report] could not reach server (state=${state}): ${e.message}\n`);
  }
}

/**
 * Wrap an async function so failures are reported as state='error' with the
 * given category, plus a message extracted from the thrown error. Re-throws
 * after reporting so callers see the same error they would have seen.
 */
export async function withErrorReport(cfg, errorCategory, fn) {
  try {
    return await fn();
  } catch (e) {
    const msg = (e?.message ?? String(e)).slice(0, 480);
    await report({ cfg, state: "error", message: msg, errorCategory });
    throw e;
  }
}

function safeHostname() {
  try {
    return os.hostname()?.replace(/[^A-Za-z0-9._-]/g, "")?.slice(0, 60) || "unknown";
  } catch {
    return "unknown";
  }
}
