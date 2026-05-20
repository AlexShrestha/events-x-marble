/**
 * Browser onboarding handshake — lets /connect auto-detect when the user
 * has run `events-x-marble init` from their terminal, without them pasting
 * any URL back into the browser.
 *
 * Flow:
 *   1. Browser hits POST /api/v1/connect/new → server mints `cnx_<id>` row
 *      with status='pending', returns the id. Browser stores in localStorage
 *      and polls /api/v1/connect/status?session=<id>.
 *   2. The user copies the install command from /connect. The command includes
 *      the session id: curl …/install?session=cnx_<id> | bash
 *   3. The install script runs `events-x-marble init --connect-session cnx_<id>`.
 *      The CLI POSTs to /api/v1/register with `connect_session_id=cnx_<id>`.
 *      register.ts updates the connect_sessions row → status='connected', sets
 *      user_id, and includes the per-user mb_user signed cookie in the redirect URL.
 *   4. The browser's poll sees status='connected' + a one-time signed cookie
 *      payload → the browser is redirected to /me with the cookie set. Done.
 *
 * Sessions expire 30 minutes after creation.
 */
import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { exec, queryGet } from "../db/index.ts";
import { signUserCookie } from "../auth/session.ts";
import { geoFromHeaders } from "../lib/geo.ts";

export const connectApp = new Hono();

const SESSION_TTL_MS = 30 * 60 * 1000;

// ---- POST /api/v1/connect/new --------------------------------------------

connectApp.post("/new", async (c) => {
  const id = `cnx_${randomBytes(12).toString("hex")}`;
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();

  const userAgent = c.req.raw.headers.get("user-agent")?.slice(0, 200) ?? null;
  const ip = clientIp(c.req.raw.headers);
  const geo = geoFromHeaders(c.req.raw.headers);

  await exec(
    `INSERT INTO connect_sessions
       (id, status, user_agent, origin_ip, expires_at,
        geo_city, geo_country, geo_region, geo_lat, geo_lng, geo_timezone)
     VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userAgent, ip, expiresAt,
     geo.city, geo.country, geo.region, geo.lat, geo.lng, geo.timezone],
  );

  return c.json({
    ok: true,
    session_id: id,
    expires_at: expiresAt,
    geo: {
      city: geo.city,
      city_slug: geo.citySlug,
      country: geo.country,
      timezone: geo.timezone,
    },
  });
});

// ---- GET /api/v1/connect/status?session=cnx_xxx --------------------------

const StatusQuery = z.object({
  session: z.string().min(8).max(64),
});

connectApp.get("/status", async (c) => {
  const q = StatusQuery.safeParse(c.req.query());
  if (!q.success) return c.json({ ok: false, error: "invalid_session_id" }, 400);

  const row = await queryGet<{
    status: string;
    user_id: string | null;
    expires_at: string;
  }>(
    `SELECT status, user_id, expires_at FROM connect_sessions WHERE id = ?`,
    [q.data.session],
  );

  if (!row) return c.json({ ok: false, error: "session_not_found" }, 404);

  const now = Date.now();
  if (Date.parse(row.expires_at) < now) {
    return c.json({ ok: false, error: "session_expired" }, 410);
  }

  if (row.status !== "connected" || !row.user_id) {
    return c.json({ ok: true, status: "pending" });
  }

  // Connected! Look up the user's CURRENT onboarding state so the /connect
  // polling page can tell the user what their laptop is doing (or has done,
  // or has failed at) — not just "connected" → "redirected". This is the
  // critical UX gate: we never tell the user "you're in" until their laptop
  // has reported `ready`, and we surface error states with the email link.
  const userState = await queryGet<{
    onboarding_state: string;
    onboarding_message: string | null;
    onboarding_error_category: string | null;
    onboarding_updated_at: string | null;
  }>(
    `SELECT onboarding_state, onboarding_message, onboarding_error_category, onboarding_updated_at
       FROM users WHERE id = ?`,
    [row.user_id],
  );

  const state = userState?.onboarding_state ?? "new";
  const updatedAt = userState?.onboarding_updated_at ?? null;

  // Only redirect the browser away from /connect when the user is fully READY
  // (i.e. has at least one pick payload). For all intermediate states we keep
  // them on /connect with a live status display.
  if (state === "ready") {
    return c.json({
      ok: true,
      status: "ready",
      user_id: row.user_id,
      updated_at: updatedAt,
      redirect: `/api/v1/connect/redeem?session=${encodeURIComponent(q.data.session)}`,
    });
  }

  if (state === "error") {
    return c.json({
      ok: true,
      status: "error",
      user_id: row.user_id,
      error_category: userState?.onboarding_error_category ?? "unknown",
      message: userState?.onboarding_message ?? "",
      updated_at: updatedAt,
    });
  }

  // 'new', 'key_missing', 'kg_missing', 'ingesting', 'learning', 'scoring', 'pushing'
  return c.json({
    ok: true,
    status: "working",
    sub_state: state,
    message: userState?.onboarding_message ?? null,
    updated_at: updatedAt,
  });
});

// ---- GET /api/v1/connect/redeem?session=cnx_xxx --------------------------

connectApp.get("/redeem", async (c) => {
  const q = StatusQuery.safeParse(c.req.query());
  if (!q.success) return c.text("invalid session", 400);

  const row = await queryGet<{ status: string; user_id: string | null; expires_at: string }>(
    `SELECT status, user_id, expires_at FROM connect_sessions WHERE id = ?`,
    [q.data.session],
  );
  if (!row || row.status !== "connected" || !row.user_id) return c.text("not ready", 404);
  if (Date.parse(row.expires_at) < Date.now()) return c.text("expired", 410);

  // Set the mb_user signed cookie + redirect to /me.
  const sig = signUserCookie(row.user_id);
  c.header(
    "Set-Cookie",
    `mb_user=${encodeURIComponent(sig)}; Max-Age=${30 * 86_400}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );
  // Single-use: once redeemed, mark the session done so polling stops.
  await exec(
    `UPDATE connect_sessions SET status = 'redeemed' WHERE id = ?`,
    [q.data.session],
  );
  return c.redirect("/me?welcome=1", 302);
});

function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
