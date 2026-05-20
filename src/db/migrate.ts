import { applySchema, closeDb, exec, libsqlConfig, queryAll } from "./index.ts";
import { seedLegacyUser } from "./seed-users.ts";

await applySchema();
console.log(`Schema applied via libsql to ${libsqlConfig().url}`);

// Idempotent ALTERs for columns added after the original CREATE TABLE shipped.
// SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we PRAGMA-check first.
await ensureColumn("me_picks", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");

// Index that depends on the user_id column we just ensured.
await exec(
  `CREATE INDEX IF NOT EXISTS idx_me_picks_user ON me_picks(user_id, city_slug, generated_at DESC)`,
);

// v4: per-user onboarding state columns. Each is nullable / has a default so
// existing 'alex' row passes through migration unchanged.
await ensureColumn("users", "onboarding_state", "TEXT NOT NULL DEFAULT 'new'");
await ensureColumn("users", "onboarding_message", "TEXT");
await ensureColumn("users", "onboarding_error_category", "TEXT");
await ensureColumn("users", "onboarding_updated_at", "TEXT");

// The legacy 'alex' user is fully provisioned — bump its state to 'ready' so
// /me doesn't show him an onboarding-in-progress screen.
await exec(
  `UPDATE users SET onboarding_state = 'ready', onboarding_updated_at = datetime('now')
    WHERE id = ? AND (onboarding_state IS NULL OR onboarding_state = 'new')`,
  ["alex"],
);

// Backfill the legacy 'alex' user_id onto any pre-v3 picks rows.
// Runs only after the column exists AND the user record was seeded.
const seedResult = await seedLegacyUser();
console.log(`[migrate] seed-users: ${seedResult.reason}`);

const backfill = await exec(
  `UPDATE me_picks SET user_id = ? WHERE user_id IS NULL`,
  ["alex"],
);
if (backfill.changes > 0) {
  console.log(`[migrate] backfilled ${backfill.changes} legacy me_picks rows with user_id='alex'`);
}

closeDb();

async function ensureColumn(table: string, column: string, columnDef: string): Promise<void> {
  const cols = await queryAll<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  if (cols.some((c) => c.name === column)) return;
  await exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${columnDef}`);
  console.log(`[migrate] added column ${table}.${column}`);
}
