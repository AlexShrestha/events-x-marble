/**
 * Per-user session cookie: `mb_user`.
 *
 * Stateless — the cookie value embeds the user_id + expiry + HMAC. No
 * database lookup needed to verify; rotating the HMAC key invalidates all
 * cookies at once (use for emergency global logout).
 *
 * Cookie value format: `v1|<userId>|<expiresAtMs>|<hmacHex>`
 *
 * HMAC key precedence:
 *   1. env.AUTH_SECRET (set this in production for rotation control)
 *   2. derived: sha256(ME_TOKEN + 'mb-user-v1') — fallback so the system
 *      works without an additional env var. Rotating ME_TOKEN ALSO rotates
 *      per-user sessions, which is usually what you want.
 *
 * This cookie is DIFFERENT from the legacy `mb_sig` (which authenticates
 * only the legacy 'alex' user). Both can coexist on the same browser; the
 * `/` handler reads either.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env.ts";

export const COOKIE_NAME = "mb_user";
export const COOKIE_TTL_DAYS = 30;

function deriveHmacKey(): string {
  if (env.AUTH_SECRET) return env.AUTH_SECRET;
  if (env.ME_TOKEN) {
    return createHash("sha256")
      .update(env.ME_TOKEN + "|mb-user-v1", "utf8")
      .digest("hex");
  }
  // No secret available — session signing is impossible. Caller should treat
  // any attempt to mint a cookie as failure rather than fall back to a known
  // value. (Returning an empty key would let an attacker forge cookies.)
  throw new Error(
    "session signing requires AUTH_SECRET or ME_TOKEN; neither is set in env",
  );
}

/** Build a fresh signed cookie value for the given user. Returns the string to put after `mb_user=`. */
export function signUserCookie(userId: string, ttlDays: number = COOKIE_TTL_DAYS): string {
  if (!userId || userId.includes("|")) {
    throw new Error("invalid userId for cookie signing");
  }
  const expiresAt = Date.now() + ttlDays * 86_400_000;
  const payload = `v1|${userId}|${expiresAt}`;
  const mac = createHmac("sha256", deriveHmacKey()).update(payload).digest("hex");
  return `${payload}|${mac}`;
}

/** Verify a cookie value. Returns userId on success, null on any failure. */
export function verifyUserCookieValue(raw: string | undefined): string | null {
  if (!raw) return null;
  const parts = raw.split("|");
  if (parts.length !== 4) return null;
  const [version, userId, expiresStr, mac] = parts;
  if (version !== "v1" || !userId || !expiresStr || !mac) return null;

  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  let expected: string;
  try {
    expected = createHmac("sha256", deriveHmacKey())
      .update(`v1|${userId}|${expiresStr}`)
      .digest("hex");
  } catch {
    return null;
  }
  if (!constantTimeEqualsHex(mac, expected)) return null;
  return userId;
}

/** Convenience: pull mb_user from a Headers' Cookie header and verify. */
export function verifyUserCookie(headers: Headers): string | null {
  const raw = cookieFromHeaders(headers, COOKIE_NAME);
  return verifyUserCookieValue(raw);
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
