/**
 * /api/v1/me/status — per-user onboarding state reporting.
 *
 *   POST /api/v1/me/status?token=tok_xxx
 *     Body: { state, message?, error_category?, client_info? }
 *     Auth: per-user token. Updates the user's onboarding_state columns and
 *     appends an entry to user_status_log. Server-side this is logged via
 *     console.log so Vercel logs surface every transition.
 *
 *   GET  /api/v1/me/status
 *     Auth: signed cookie OR per-user token via ?token=. Returns the latest
 *     state + the last 10 log entries for support / dashboard rendering.
 *
 * Browsers should use GET, the CLI should use POST.
 */
import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { exec, queryAll, queryGet } from "../db/index.ts";
import { resolveCallerUserId } from "./me-picks.ts";
import { verifyToken } from "../auth/tokens.ts";

export const meStatusApp = new Hono();

export const STATES = [
  "new",
  "key_missing",
  "kg_missing",
  "ingesting",
  "learning",
  "scoring",
  "pushing",
  "ready",
  "error",
] as const;

export const ERROR_CATEGORIES = [
  "key_invalid",
  "kg_load_failed",
  "kg_invalid",
  "ingest_failed",
  "learn_failed",
  "score_failed",
  "push_failed",
  "network",
  "unknown",
] as const;

const PostBody = z
  .object({
    state: z.enum(STATES),
    message: z.string().max(500).optional(),
    error_category: z.enum(ERROR_CATEGORIES).optional(),
    client_info: z.string().max(200).optional(),
  })
  .strict();

const QueryToken = z.object({ token: z.string().min(8) });

// ---- POST /api/v1/me/status ----------------------------------------------

meStatusApp.post("/", async (c) => {
  const q = QueryToken.safeParse(c.req.query());
  if (!q.success) return c.text("missing token", 400);
  const ip = clientIp(c.req.raw.headers);
  const v = await verifyToken(q.data.token, ip);
  if (!v) return c.text("unauthorized", 401);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.text("invalid json body", 400);
  }
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues.slice(0, 5) },
      400,
    );
  }
  const { state, message, error_category, client_info } = parsed.data;

  // Defense: if state is 'error', require an error_category for triage.
  if (state === "error" && !error_category) {
    return c.json({ ok: false, error: "error state requires error_category" }, 400);
  }

  await exec(
    `UPDATE users
        SET onboarding_state = ?,
            onboarding_message = ?,
            onboarding_error_category = ?,
            onboarding_updated_at = datetime('now')
      WHERE id = ?`,
    [state, message ?? null, error_category ?? null, v.userId],
  );

  const logId = `usl_${randomBytes(8).toString("hex")}`;
  await exec(
    `INSERT INTO user_status_log (id, user_id, state, message, error_category, client_info, remote_ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      logId,
      v.userId,
      state,
      message ?? null,
      error_category ?? null,
      client_info ?? null,
      ip,
    ],
  );

  // Surface every transition in Vercel logs for the maintainer to monitor.
  // No PII — only state, category, user_id.
  const errPart = error_category ? ` (category=${error_category})` : "";
  console.log(
    `[user-status] user=${v.userId} state=${state}${errPart} msg=${(message ?? "").slice(0, 80)}`,
  );

  return c.json({ ok: true, log_id: logId, state });
});

// ---- GET /api/v1/me/status -----------------------------------------------

meStatusApp.get("/", async (c) => {
  const userId = await resolveCallerUserId(c.req.raw.headers, c.req.query("token"));
  if (!userId) return c.text("unauthorized", 401);

  const user = await queryGet<{
    onboarding_state: string;
    onboarding_message: string | null;
    onboarding_error_category: string | null;
    onboarding_updated_at: string | null;
    display_name: string | null;
  }>(
    `SELECT onboarding_state, onboarding_message, onboarding_error_category, onboarding_updated_at, display_name
       FROM users WHERE id = ? AND deleted_at IS NULL`,
    [userId],
  );
  if (!user) return c.text("user not found", 404);

  // Last 10 log entries for support / debugging from the user's side.
  const log = await queryAll<{
    state: string;
    message: string | null;
    error_category: string | null;
    created_at: string;
  }>(
    `SELECT state, message, error_category, created_at
       FROM user_status_log
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
    [userId],
  );

  return c.json({
    ok: true,
    user_id: userId,
    display_name: user.display_name,
    state: user.onboarding_state,
    message: user.onboarding_message,
    error_category: user.onboarding_error_category,
    updated_at: user.onboarding_updated_at,
    log,
  });
});

function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
