/**
 * /api/v1/me/picks — sanitized "rent payload" surface for personalized rendering.
 *
 * THREE endpoints:
 *   POST /api/v1/me/picks?token=ME_TOKEN
 *     Body: MePicksPayload v1 (Zod-validated, strict — unknown keys rejected).
 *     Pushed by the local cron after weekly scoring. Server inserts one row per push.
 *
 *   GET  /api/v1/me/picks?city=<slug>
 *     Auth: signed cookie `mb_sig` (set by /session below) OR ?token=ME_TOKEN.
 *     Returns the latest non-expired payload for the city.
 *
 *   POST /api/v1/me/session?token=ME_TOKEN
 *     Sets the HMAC-signed `mb_sig` cookie for 30 days. Rotating ME_TOKEN
 *     invalidates all live cookies (the HMAC key changes).
 *
 * INTEGRATION POINTS:
 *   - Sanitizer + Zod schema: ../marble/derive-payload.ts (single source of truth)
 *   - Mounted in src/app.tsx as `app.route("/api/v1/me/picks", mePicksApp)` and
 *     `app.route("/api/v1/me/session", meSessionApp)`.
 */
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { env } from "../env.ts";
import { exec, queryGet } from "../db/index.ts";
import { MePicksPayloadSchema, type MePicksPayload } from "../marble/derive-payload.ts";
import { verifyToken } from "../auth/tokens.ts";
import {
  COOKIE_NAME as USER_COOKIE_NAME,
  COOKIE_TTL_DAYS as USER_COOKIE_TTL_DAYS,
  signUserCookie,
  verifyUserCookieValue,
} from "../auth/session.ts";

export const mePicksApp = new Hono();
export const meSessionApp = new Hono();

const COOKIE_NAME = "mb_sig";
const COOKIE_TTL_DAYS = 30;
const POST_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 1 push per 10 min per IP
const lastPostByIp = new Map<string, number>();

const GetQuerySchema = z.object({
  city: z.string().min(1).max(64).default("barcelona"),
  token: z.string().optional(),
});

const PostQuerySchema = z.object({
  token: z.string().min(1),
});

// ---- POST /api/v1/me/picks -------------------------------------------------

mePicksApp.post("/", async (c) => {
  const q = PostQuerySchema.safeParse(c.req.query());
  if (!q.success) return c.text("invalid query", 400);

  // Resolve the calling user. Two paths:
  //   1. Legacy ME_TOKEN  → user_id = 'alex' (your existing weekly cron)
  //   2. Per-user token   → user_id from user_tokens lookup (any registered user)
  const ip = clientIp(c.req.raw.headers);
  const caller = await resolveTokenCaller(q.data.token, ip);
  if (!caller) return c.text("unauthorized", 401);

  // Rate limit per IP. In-memory only — survives within a warm function, that's enough.
  const now = Date.now();
  const last = lastPostByIp.get(ip);
  if (last && now - last < POST_RATE_LIMIT_WINDOW_MS) {
    return c.text("rate_limited", 429);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.text("invalid json body", 400);
  }

  const parsed = MePicksPayloadSchema.safeParse(body);
  if (!parsed.success) {
    // Don't echo the offending payload back — could be attacker probing.
    return c.json({ ok: false, error: "schema_validation_failed", issues: parsed.error.issues.slice(0, 5) }, 400);
  }
  const payload: MePicksPayload = parsed.data;

  // Cross-check: expires_at must be in the future, generated_at in the past (5 min skew).
  const t = Date.now();
  const gen = Date.parse(payload.generated_at);
  const exp = Date.parse(payload.expires_at);
  if (!Number.isFinite(gen) || !Number.isFinite(exp)) return c.text("invalid timestamps", 400);
  if (exp <= t) return c.text("payload already expired", 400);
  if (gen > t + 5 * 60_000) return c.text("generated_at in the future", 400);

  const id = `mep_${cryptoRandomHex(12)}`;
  await exec(
    `INSERT INTO me_picks
       (id, city_slug, schema_version, payload, kg_fingerprint, generated_at, expires_at, last_push_ip, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.city_slug,
      payload.schema_version,
      JSON.stringify(payload),
      payload.kg_fingerprint,
      payload.generated_at,
      payload.expires_at,
      ip,
      caller.userId,
    ],
  );

  lastPostByIp.set(ip, now);
  return c.json({ ok: true, id, user_id: caller.userId });
});

// ---- GET /api/v1/me/picks --------------------------------------------------

mePicksApp.get("/", async (c) => {
  const q = GetQuerySchema.safeParse(c.req.query());
  if (!q.success) return c.text("invalid query", 400);

  // Resolve which user's picks to serve — by cookie (legacy mb_sig or v3 mb_user)
  // or by ?token= query (legacy ME_TOKEN or per-user token).
  const userId = await resolveCallerUserId(c.req.raw.headers, q.data.token);
  if (!userId) return c.text("unauthorized", 401);

  const row = await queryGet<{ payload: string; expires_at: string }>(
    `SELECT payload, expires_at
       FROM me_picks
      WHERE user_id = ? AND city_slug = ? AND datetime(expires_at) > datetime('now')
      ORDER BY datetime(generated_at) DESC
      LIMIT 1`,
    [userId, q.data.city],
  );
  if (!row) return c.json({ ok: false, error: "no_picks_for_city" }, 404);

  // Re-parse + re-validate before serving — defense against future schema drift
  // or someone smuggling old payloads into Turso out-of-band.
  let parsed: MePicksPayload;
  try {
    parsed = MePicksPayloadSchema.parse(JSON.parse(row.payload));
  } catch {
    return c.json({ ok: false, error: "stored_payload_invalid" }, 500);
  }

  c.header("Cache-Control", "private, max-age=300");
  return c.json({ ok: true, payload: parsed });
});

// ---- POST /api/v1/me/session ----------------------------------------------

// Stage 1: session endpoints accept BOTH legacy ME_TOKEN AND per-user tokens.
// - Legacy ME_TOKEN  → sets mb_sig cookie (HMAC of ME_TOKEN), serves user 'alex'
// - Per-user token   → sets mb_user cookie (HMAC of userId), serves that user

type SessionMint =
  | { kind: "legacy"; cookie: string }
  | { kind: "user"; userId: string; cookie: string }
  | { kind: "unauthorized" };

async function mintSession(token: string, ip: string): Promise<SessionMint> {
  if (env.ME_TOKEN && constantTimeEqualsHex(token, env.ME_TOKEN)) {
    return { kind: "legacy", cookie: signSession(env.ME_TOKEN, COOKIE_TTL_DAYS) };
  }
  const v = await verifyToken(token, ip);
  if (v) {
    return { kind: "user", userId: v.userId, cookie: signUserCookie(v.userId, USER_COOKIE_TTL_DAYS) };
  }
  return { kind: "unauthorized" };
}

meSessionApp.post("/", async (c) => {
  const q = PostQuerySchema.safeParse(c.req.query());
  if (!q.success) return c.text("invalid query", 400);
  const minted = await mintSession(q.data.token, clientIp(c.req.raw.headers));
  if (minted.kind === "unauthorized") return c.text("unauthorized", 401);
  if (minted.kind === "legacy") {
    setCookie(c, COOKIE_NAME, minted.cookie, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: COOKIE_TTL_DAYS * 86_400 });
    return c.json({ ok: true, user_id: "alex", expires_in_days: COOKIE_TTL_DAYS });
  }
  setCookie(c, USER_COOKIE_NAME, minted.cookie, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: USER_COOKIE_TTL_DAYS * 86_400 });
  return c.json({ ok: true, user_id: minted.userId, expires_in_days: USER_COOKIE_TTL_DAYS });
});

// Convenience GET so the user can click the URL the CLI prints.
meSessionApp.get("/", async (c) => {
  const q = PostQuerySchema.safeParse(c.req.query());
  if (!q.success) return c.text("invalid query", 400);
  const minted = await mintSession(q.data.token, clientIp(c.req.raw.headers));
  if (minted.kind === "unauthorized") return c.text("unauthorized", 401);
  if (minted.kind === "legacy") {
    setCookie(c, COOKIE_NAME, minted.cookie, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: COOKIE_TTL_DAYS * 86_400 });
  } else {
    setCookie(c, USER_COOKIE_NAME, minted.cookie, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: USER_COOKIE_TTL_DAYS * 86_400 });
  }
  return c.redirect("/?me=1", 302);
});

// ---- caller resolution helpers (exported for app.tsx & POST handler) ------

interface TokenCaller {
  userId: string;
  /** 'legacy' means ME_TOKEN match (user 'alex'); 'user' means a `user_tokens` row hit. */
  kind: "legacy" | "user";
}

/**
 * Resolve a POST caller from a query-string token only (no cookies — POSTs come
 * from the laptop CLI, not the browser). Returns null on failure.
 */
export async function resolveTokenCaller(token: string, ip: string): Promise<TokenCaller | null> {
  if (env.ME_TOKEN && constantTimeEqualsHex(token, env.ME_TOKEN)) {
    return { userId: "alex", kind: "legacy" };
  }
  const v = await verifyToken(token, ip);
  if (v) return { userId: v.userId, kind: "user" };
  return null;
}

/**
 * Resolve a GET caller's userId from any auth source — query token OR legacy
 * mb_sig cookie OR v3 mb_user cookie. Returns userId or null.
 */
export async function resolveCallerUserId(
  headers: Headers,
  queryToken: string | undefined,
): Promise<string | null> {
  // 1. Explicit ?token= takes priority (CLI-initiated calls).
  if (queryToken) {
    const c = await resolveTokenCaller(queryToken, clientIp(headers));
    if (c) return c.userId;
  }
  // 2. Legacy mb_sig cookie → 'alex'.
  if (env.ME_TOKEN) {
    const raw = cookieFromHeaders(headers, COOKIE_NAME);
    if (raw && verifySession(env.ME_TOKEN, raw)) return "alex";
  }
  // 3. v3 mb_user cookie → embedded userId.
  const userCookieValue = cookieFromHeaders(headers, USER_COOKIE_NAME);
  if (userCookieValue) {
    const uid = verifyUserCookieValue(userCookieValue);
    if (uid) return uid;
  }
  return null;
}

/**
 * Legacy boolean helper kept for backward compatibility (existing `/` handler
 * in src/app.tsx imports this). Returns true if EITHER cookie verifies.
 */
export function meAuthorizedFromCookie(headers: Headers): boolean {
  if (env.ME_TOKEN) {
    const raw = cookieFromHeaders(headers, COOKIE_NAME);
    if (raw && verifySession(env.ME_TOKEN, raw)) return true;
  }
  const userCookieValue = cookieFromHeaders(headers, USER_COOKIE_NAME);
  if (userCookieValue && verifyUserCookieValue(userCookieValue)) return true;
  return false;
}

// ---- crypto + cookie internals --------------------------------------------

function signSession(key: string, ttlDays: number): string {
  const expiresAt = Date.now() + ttlDays * 86_400_000;
  const payload = `v1|${expiresAt}`;
  const mac = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}|${mac}`;
}

function verifySession(key: string, raw: string): boolean {
  const parts = raw.split("|");
  if (parts.length !== 3) return false;
  const [version, expStr, mac] = parts;
  if (version !== "v1" || !expStr || !mac) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = createHmac("sha256", key).update(`v1|${expStr}`).digest("hex");
  return constantTimeEqualsHex(mac, expected);
}

function constantTimeEqualsHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function cookieFromHeaders(headers: Headers, name: string): string | undefined {
  const raw = headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [k, ...vrest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(vrest.join("="));
  }
  return undefined;
}

void getCookie; // exported by hono/cookie; kept as future-proof import marker

function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")
    || "0.0.0.0"
  );
}

function cryptoRandomHex(bytes: number): string {
  // Use Node's webcrypto where available (Vercel + Bun both have it).
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
