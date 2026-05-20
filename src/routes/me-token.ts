/**
 * Token management for authenticated users:
 *   POST /api/v1/me/token/rotate   — issue new, revoke the one used to call this
 *   POST /api/v1/me/disconnect     — revoke all tokens (clears cookie too)
 *
 * Auth: either a valid per-user token in `?token=` query OR the `mb_user`
 * signed cookie set by /api/v1/me/session. See me-picks.ts authorized() for
 * the cookie verification.
 *
 * These routes are explicitly NOT for the legacy `alex` user with ME_TOKEN —
 * that path keeps using the existing /api/v1/me/session flow without rotation
 * (since ME_TOKEN is in your .env, you rotate it manually there).
 */
import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { z } from "zod";
import { exec } from "../db/index.ts";
import {
  issueToken,
  revokeAllTokensForUser,
  revokeToken,
  verifyToken,
} from "../auth/tokens.ts";
import { verifyUserCookie } from "../auth/session.ts";

export const meTokenApp = new Hono();

const RotateQuery = z.object({
  token: z.string().optional(),
  label: z.string().max(40).optional(),
});

meTokenApp.post("/rotate", async (c) => {
  const q = RotateQuery.safeParse(c.req.query());
  if (!q.success) return c.text("invalid query", 400);

  // Rotation MUST be called with the current token (not just the cookie) —
  // we need the tokenId to revoke. Cookie-only callers should disconnect
  // and re-init the CLI instead.
  const v = await verifyToken(q.data.token, clientIp(c.req.raw.headers));
  if (!v) return c.text("unauthorized", 401);

  const { token: newToken, tokenId: newTokenId } = await issueToken(v.userId, q.data.label ?? "rotated");
  await revokeToken(v.tokenId);

  return c.json({
    ok: true,
    token: newToken,
    token_id: newTokenId,
    revoked_token_id: v.tokenId,
  });
});

meTokenApp.post("/disconnect", async (c) => {
  const queryToken = c.req.query("token");

  // Resolve the calling user — by token or cookie.
  let userId: string | null = null;
  if (queryToken) {
    const v = await verifyToken(queryToken, clientIp(c.req.raw.headers));
    if (v) userId = v.userId;
  }
  if (!userId) {
    const cookieUser = verifyUserCookie(c.req.raw.headers);
    if (cookieUser) userId = cookieUser;
  }
  if (!userId) return c.text("unauthorized", 401);

  // Refuse to revoke the legacy alex tokens via this endpoint — protects
  // the maintainer's flow from accidental disconnect.
  if (userId === "alex") {
    return c.text("legacy 'alex' user cannot be disconnected via this endpoint", 403);
  }

  const r = await revokeAllTokensForUser(userId);
  deleteCookie(c, "mb_user", { path: "/" });
  return c.json({ ok: true, revoked_count: r.revoked });
});

/** Admin-ish endpoint — hard-delete the user record and cascade their data. */
meTokenApp.post("/delete-account", async (c) => {
  const queryToken = c.req.query("token");
  const v = queryToken ? await verifyToken(queryToken, clientIp(c.req.raw.headers)) : null;
  const userId = v?.userId ?? verifyUserCookie(c.req.raw.headers);
  if (!userId) return c.text("unauthorized", 401);
  if (userId === "alex") {
    return c.text("legacy 'alex' user cannot be deleted via this endpoint", 403);
  }

  // CASCADE on users.id handles user_tokens + me_picks user_id rows.
  await exec(`DELETE FROM users WHERE id = ?`, [userId]);
  deleteCookie(c, "mb_user", { path: "/" });
  return c.json({ ok: true, deleted_user_id: userId });
});

function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
