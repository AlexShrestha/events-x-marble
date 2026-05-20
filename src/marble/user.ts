/**
 * User abstraction — the single bottleneck for "whose KG and API key is this?"
 *
 * **Design principle (v3 isolation):** No module elsewhere in the codebase
 * should read `env.MARBLE_KG_PATH` or `env.OPENCODE_API_KEY` directly for
 * personalization purposes. Everything routes through here.
 *
 * In Stage 0, this module is env-backed for the single legacy user
 * (`user_id='alex'`). Stage 1 switches the implementation to read from
 * `users` / `user_kgs` / `user_keys` Turso rows while keeping the same
 * exported signatures — call sites don't change.
 *
 * Legacy contract: when no `users` table exists yet, or when the requested
 * user is the configured default, env vars provide the data. This keeps
 * your existing cron + web flow working untouched during the refactor.
 */
import { env } from "../env.ts";
import { loadKg, type MarbleKg } from "./kg-loader.ts";

/** Single canonical legacy user id. Configurable via DEFAULT_USER_ID env var. */
export const DEFAULT_USER_ID = env.DEFAULT_USER_ID ?? "alex";

export interface User {
  id: string;
  email?: string;
  is_admin: boolean;
  default_city_slug?: string;
}

export type ApiProvider = "opencode" | "anthropic";

/**
 * Resolve a user record. Returns the legacy 'alex' record by default.
 *
 * In Stage 0 there is no `users` table — we synthesize the record from env.
 * Stage 1 will query the table when present.
 */
export async function resolveUserOrDefault(userId?: string): Promise<User> {
  const id = userId ?? DEFAULT_USER_ID;

  // Stage 0: legacy single-user path — no DB lookup.
  if (id === DEFAULT_USER_ID) {
    return {
      id,
      ...(env.CONTACT_EMAIL ? { email: env.CONTACT_EMAIL } : {}),
      is_admin: true,
      default_city_slug: "barcelona",
    };
  }

  // Stage 0 has no other users. Stage 1 replaces this branch with a
  // `SELECT * FROM users WHERE id = ? AND deleted_at IS NULL` query.
  throw new Error(
    `user '${id}' not found (Stage 0 only supports the legacy default '${DEFAULT_USER_ID}'). ` +
      "Stage 1 will add the users table + Turso lookup.",
  );
}

/**
 * Load a user's Marble KG. Read-only — same invariants as kg-loader.ts.
 *
 * Stage 0: file at env.MARBLE_KG_PATH (legacy single-user only).
 * Stage 1: ciphertext from `user_kgs` decrypted by the caller (we'll change
 *          the signature to accept a decryption helper, or the caller will
 *          decrypt browser-side and pass the plaintext JSON).
 */
export async function loadKgForUser(userId: string): Promise<MarbleKg> {
  if (userId === DEFAULT_USER_ID) {
    if (!env.MARBLE_KG_PATH) {
      throw new Error(
        `loadKgForUser('${userId}'): MARBLE_KG_PATH not set. ` +
          "Point it at the local marble JSON file in .env.",
      );
    }
    const { kg } = await loadKg(env.MARBLE_KG_PATH);
    return kg;
  }

  throw new Error(
    `loadKgForUser('${userId}'): only the legacy default '${DEFAULT_USER_ID}' is supported in Stage 0.`,
  );
}

/**
 * Resolve the API key used to call the LLM gateway *as this user*.
 *
 * Stage 0: returns env.OPENCODE_API_KEY for the legacy user (only provider
 * supported is 'opencode').
 * Stage 1: returns the user's encrypted-at-rest key decrypted by the caller.
 */
export async function getApiKeyForUser(
  userId: string,
  provider: ApiProvider = "opencode",
): Promise<string> {
  if (userId === DEFAULT_USER_ID) {
    if (provider !== "opencode") {
      throw new Error(
        `getApiKeyForUser('${userId}', '${provider}'): only 'opencode' is supported in Stage 0.`,
      );
    }
    if (!env.OPENCODE_API_KEY) {
      throw new Error(`getApiKeyForUser('${userId}'): OPENCODE_API_KEY not set.`);
    }
    return env.OPENCODE_API_KEY;
  }

  throw new Error(
    `getApiKeyForUser('${userId}'): only the legacy default '${DEFAULT_USER_ID}' is supported in Stage 0.`,
  );
}

/**
 * Resolve which city this user defaults to when one isn't specified on the CLI.
 * Stage 0: hardcoded to 'barcelona' for the legacy user.
 * Stage 1: read from users.default_city_slug.
 */
export async function getDefaultCityForUser(userId: string): Promise<string> {
  const user = await resolveUserOrDefault(userId);
  return user.default_city_slug ?? "barcelona";
}
