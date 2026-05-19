/**
 * One-shot sync: read every row from the local file:./data.db and INSERT OR REPLACE
 * into the Turso (libsql://) target, table by table.
 *
 * Run AFTER `bun run migrate` has applied the schema to Turso. Idempotent —
 * re-running just overwrites identical rows.
 *
 * Usage:
 *   TURSO_URL=libsql://… TURSO_AUTH_TOKEN=eyJ… bun scripts/sync-local-to-turso.ts
 *   (or just: bun scripts/sync-local-to-turso.ts  with .env populated)
 */
import { createClient } from "@libsql/client";
import { env } from "../src/env.ts";

if (!env.TURSO_URL || !env.TURSO_AUTH_TOKEN) {
  console.error("TURSO_URL and TURSO_AUTH_TOKEN must be set in .env");
  process.exit(2);
}

const local = createClient({ url: "file:./data.db" });
const remote = createClient({ url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN });

// Order matters: parent tables before children (FK).
const tables = [
  "cities",
  "sources",
  "events",
  "source_runs",
  "cost_ledger",
  "geocode_cache",
] as const;

let totalRows = 0;
const t0 = Date.now();

for (const table of tables) {
  const result = await local.execute(`SELECT * FROM ${table}`);
  const rows = result.rows;
  if (rows.length === 0) {
    console.log(`  · ${table.padEnd(16)} empty (skipping)`);
    continue;
  }

  const cols = result.columns;
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;

  // Build batch — keep under libsql's per-batch limit by chunking at 200.
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const stmts = slice.map((row) => ({
      sql,
      args: cols.map((c) => (row as Record<string, unknown>)[c] as never),
    }));
    await remote.batch(stmts, "write");
  }

  console.log(`  ✓ ${table.padEnd(16)} ${rows.length.toString().padStart(5)} rows`);
  totalRows += rows.length;
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nTotal: ${totalRows} rows in ${elapsed}s`);

local.close();
remote.close();
