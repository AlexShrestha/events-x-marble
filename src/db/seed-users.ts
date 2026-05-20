/**
 * Idempotent seed: ensures the legacy single-user record (`alex` by default)
 * exists in the `users` table once Stage 1 introduces it.
 *
 * Behavior:
 *  - If the `users` table does not exist yet (Stage 0), no-op silently.
 *  - If it does, INSERT OR IGNORE the legacy user record.
 *
 * Run automatically by `bun run migrate` (added to the migrate script) and
 * safely re-runnable anytime. Stage 1 expands this to also seed default
 * city, default provider, etc.
 */
import { env } from "../env.ts";
import { exec, queryGet } from "./index.ts";
// CONTACT_EMAIL is no longer stored in the users table (v3 schema dropped the
// email column — we don't do email-based auth). Kept the import path stable
// in case future stages want to log/expose it elsewhere.

const LEGACY_USER_ID = env.DEFAULT_USER_ID ?? "alex";

async function tableExists(name: string): Promise<boolean> {
  const row = await queryGet<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    [name],
  );
  return !!row;
}

export async function seedLegacyUser(): Promise<{ seeded: boolean; reason: string }> {
  if (!(await tableExists("users"))) {
    return { seeded: false, reason: "users table does not exist yet (Stage 1 will add it)" };
  }
  const existing = await queryGet<{ id: string }>(
    "SELECT id FROM users WHERE id = ?",
    [LEGACY_USER_ID],
  );
  if (existing) {
    return { seeded: false, reason: `legacy user '${LEGACY_USER_ID}' already exists` };
  }
  // v3 schema: users(id, display_name, default_city_slug, is_admin, created_at, deleted_at).
  // The legacy user inherits 'Alex' as display name (you can rename later via admin SQL).
  await exec(
    `INSERT INTO users (id, display_name, default_city_slug, is_admin) VALUES (?, ?, ?, 1)`,
    [LEGACY_USER_ID, "Alex", "barcelona"],
  );
  return { seeded: true, reason: `seeded legacy user '${LEGACY_USER_ID}'` };
}

// Allow invoking directly as a CLI: `bun src/db/seed-users.ts`
if (import.meta.main) {
  const r = await seedLegacyUser();
  console.log(`[seed-users] ${r.reason}`);
}
