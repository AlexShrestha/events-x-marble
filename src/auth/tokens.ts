/**
 * Per-user token lifecycle: issue, verify, revoke.
 *
 * **Invariant:** the plaintext token only ever exists at issue-time. The server
 * stores sha256(token) only. There is no path to recover a forgotten token
 * (only to rotate the user record to a new one).
 *
 * Tokens are opaque random strings (24 random bytes → 48 hex chars, prefixed
 * with `tok_`). High entropy; constant-time concerns are sidestepped because
 * all verification is via hash lookup.
 *
 * Storage row (`user_tokens`):
 *   id, user_id, token_hash, label, created_at, revoked_at, last_seen_at, last_seen_ip
 */
import { createHash, randomBytes } from "node:crypto";
import { exec, queryGet } from "../db/index.ts";

export const TOKEN_PREFIX = "tok_";

export interface IssueResult {
  /** Plaintext token. Caller MUST give this to the user and never log/store it. */
  token: string;
  /** Database row id. Safe to log; not a credential. */
  tokenId: string;
}

export interface VerifyResult {
  userId: string;
  tokenId: string;
}

/**
 * Issue a new token bound to userId. The returned plaintext is the ONLY copy
 * that ever exists outside the user's machine.
 */
export async function issueToken(
  userId: string,
  label?: string,
): Promise<IssueResult> {
  const plaintext = `${TOKEN_PREFIX}${randomBytes(24).toString("hex")}`;
  const hash = sha256Hex(plaintext);
  const tokenId = `tkn_${randomBytes(8).toString("hex")}`;
  await exec(
    `INSERT INTO user_tokens (id, user_id, token_hash, label) VALUES (?, ?, ?, ?)`,
    [tokenId, userId, hash, label ?? null],
  );
  return { token: plaintext, tokenId };
}

/**
 * Verify a plaintext token. Returns the userId + tokenId on success, null on
 * failure (unknown, revoked, or expired). Updates last_seen_at + last_seen_ip
 * on every successful verification so the user can see their recent activity.
 */
export async function verifyToken(
  plaintext: string | undefined,
  remoteIp?: string,
): Promise<VerifyResult | null> {
  if (!plaintext || typeof plaintext !== "string") return null;
  if (!plaintext.startsWith(TOKEN_PREFIX)) return null;
  const hash = sha256Hex(plaintext);
  const row = await queryGet<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM user_tokens
      WHERE token_hash = ? AND revoked_at IS NULL`,
    [hash],
  );
  if (!row) return null;

  // Best-effort touch; failure here doesn't block the request.
  try {
    await exec(
      `UPDATE user_tokens SET last_seen_at = datetime('now'), last_seen_ip = ? WHERE id = ?`,
      [remoteIp ?? null, row.id],
    );
  } catch {
    // ignore — verification still succeeds
  }

  return { userId: row.user_id, tokenId: row.id };
}

/**
 * Revoke a single token by id. Idempotent. Future calls to verifyToken with
 * the matching plaintext will return null.
 */
export async function revokeToken(tokenId: string): Promise<{ revoked: boolean }> {
  const r = await exec(
    `UPDATE user_tokens SET revoked_at = datetime('now')
      WHERE id = ? AND revoked_at IS NULL`,
    [tokenId],
  );
  return { revoked: r.changes > 0 };
}

/**
 * Revoke ALL active tokens for a user. Used by `events-x-marble disconnect`
 * when called via cookie auth (no specific token in hand).
 */
export async function revokeAllTokensForUser(userId: string): Promise<{ revoked: number }> {
  const r = await exec(
    `UPDATE user_tokens SET revoked_at = datetime('now')
      WHERE user_id = ? AND revoked_at IS NULL`,
    [userId],
  );
  return { revoked: r.changes };
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}
