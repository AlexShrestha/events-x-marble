/**
 * Public registration endpoint — called by the local `events-x-marble init`
 * CLI to create a fresh user + issue the first token.
 *
 * No auth: anyone can register. Mitigations:
 *   - Rate-limited to 1 registration per 5 min per IP (in-memory)
 *   - Token is opaque + 48 hex chars; not guessable
 *   - Display name validated, max 80 chars, no control chars
 *
 * Response shape includes both the raw token (for the CLI to store in
 * ~/.events-x-marble/config.json) and a one-click URL the CLI prints
 * for the user to open in their browser.
 */
import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { env } from "../env.ts";
import { exec, queryGet } from "../db/index.ts";
import { issueToken } from "../auth/tokens.ts";
import { ensureCityFromGeo, geoFromHeaders, slugify, type Geo } from "../lib/geo.ts";

export const registerApp = new Hono();

const Body = z
  .object({
    display_name: z
      .string()
      .max(80)
      // eslint-disable-next-line no-control-regex
      .regex(/^[^\x00-\x1f\x7f]*$/, "no control chars")
      .optional(),
    label: z.string().max(40).optional(),
    default_city_slug: z.string().min(1).max(64).optional(),
    // Optional browser handshake id (from /api/v1/connect/new). When set,
    // the new user is linked to the connect session so the browser tab can
    // auto-detect the registration via polling and redirect to /me without
    // the user pasting any URL.
    connect_session_id: z.string().min(8).max(64).optional(),
  })
  .strict();

const REGISTER_WINDOW_MS = 5 * 60 * 1000;
const lastRegisterByIp = new Map<string, number>();

registerApp.post("/", async (c) => {
  const ip = clientIp(c.req.raw.headers);
  const now = Date.now();
  const last = lastRegisterByIp.get(ip);
  if (last && now - last < REGISTER_WINDOW_MS) {
    return c.text("rate_limited", 429);
  }

  let body: unknown = {};
  try {
    const text = await c.req.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return c.text("invalid json body", 400);
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues.slice(0, 3) },
      400,
    );
  }
  const { display_name, label, default_city_slug, connect_session_id } = parsed.data;

  // Resolve the user's city by priority:
  //   1. explicit default_city_slug in the request body (CLI flag override)
  //   2. geo stored on the connect_session row (mintd from edge headers at /connect)
  //   3. geo derived from THIS request's edge headers (rare — CLI usually hits with no geo)
  //   4. legacy default 'barcelona'
  // The resolved city auto-bootstraps a `cities` row if missing so the system
  // supports any city the visitor's IP is in, never asking them to pick.
  let sessionGeo: Geo | null = null;
  if (connect_session_id) {
    const row = await queryGet<{
      geo_city: string | null;
      geo_country: string | null;
      geo_region: string | null;
      geo_lat: number | null;
      geo_lng: number | null;
      geo_timezone: string | null;
    }>(
      `SELECT geo_city, geo_country, geo_region, geo_lat, geo_lng, geo_timezone
         FROM connect_sessions WHERE id = ?`,
      [connect_session_id],
    );
    if (row?.geo_city) {
      sessionGeo = {
        city: row.geo_city,
        citySlug: slugify(row.geo_city),
        country: row.geo_country,
        region: row.geo_region,
        lat: row.geo_lat,
        lng: row.geo_lng,
        timezone: row.geo_timezone,
      };
    }
  }
  const requestGeo = geoFromHeaders(c.req.raw.headers);
  const effectiveCity =
    default_city_slug ??
    (sessionGeo?.citySlug
      ? await ensureCityFromGeo(sessionGeo)
      : requestGeo.citySlug
        ? await ensureCityFromGeo(requestGeo)
        : "barcelona");

  const userId = `usr_${randomBytes(10).toString("hex")}`;
  await exec(
    `INSERT INTO users (id, display_name, default_city_slug, is_admin) VALUES (?, ?, ?, 0)`,
    [userId, display_name ?? null, effectiveCity],
  );

  const { token, tokenId } = await issueToken(userId, label ?? "init");

  // Link the new user to the browser session (if any). The browser is polling
  // /api/v1/connect/status and will see 'connected' on its next tick.
  let connectLinked = false;
  if (connect_session_id) {
    const r = await exec(
      `UPDATE connect_sessions
          SET user_id = ?, status = 'connected', connected_at = datetime('now')
        WHERE id = ? AND status = 'pending' AND datetime(expires_at) > datetime('now')`,
      [userId, connect_session_id],
    );
    connectLinked = r.changes > 0;
  }

  lastRegisterByIp.set(ip, now);

  const baseUrl = env.SITE_URL.replace(/\/$/, "");
  const url = `${baseUrl}/me?token=${encodeURIComponent(token)}`;

  return c.json({
    ok: true,
    user_id: userId,
    token,
    token_id: tokenId,
    url,
    city: effectiveCity,
    connect_linked: connectLinked,
  });
});

function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}
