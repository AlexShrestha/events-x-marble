/**
 * Database client — @libsql/client.
 *
 * Local dev:  uses `file:./data.db` (auto-derived from sqlite://./data.db).
 * Production: set TURSO_URL=libsql://...turso.io and TURSO_AUTH_TOKEN=eyJ...
 *
 * @libsql/client API is async. ALL query call sites in this codebase therefore
 * use `await db().execute(...)` or the helpers below.
 */
import { createClient, type Client, type InArgs } from "@libsql/client";
import { env } from "../env.ts";
// Schema is embedded as a string via the .sql text loader (esbuild + bunfig.toml).
// Disk reads via __dirname don't survive bundling for Vercel.
// Import attribute syntax `with { type: "text" }` removed — older Bun on Vercel CI
// trips on the combination; loader config in build-vercel.ts handles it.
import schemaSqlText from "./schema.sql";

let _client: Client | null = null;

interface LibsqlConfig {
  url: string;
  authToken?: string;
}

export function libsqlConfig(): LibsqlConfig {
  if (env.TURSO_URL) {
    return env.TURSO_AUTH_TOKEN
      ? { url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN }
      : { url: env.TURSO_URL };
  }
  // Translate legacy sqlite://./path.db → file:./path.db
  if (env.DATABASE_URL.startsWith("sqlite://")) {
    return { url: "file:" + env.DATABASE_URL.slice("sqlite://".length) };
  }
  return { url: env.DATABASE_URL };
}

export function db(): Client {
  if (_client) return _client;
  const cfg = libsqlConfig();
  _client = createClient(cfg);
  return _client;
}

export async function applySchema(): Promise<void> {
  await db().executeMultiple(schemaSqlText);
}

export function closeDb(): void {
  if (_client) {
    _client.close();
    _client = null;
  }
}

// ---- Convenience helpers used throughout the codebase ----

export async function queryAll<T = unknown>(sql: string, args: InArgs = []): Promise<T[]> {
  const r = await db().execute({ sql, args });
  return r.rows as unknown as T[];
}

export async function queryGet<T = unknown>(
  sql: string,
  args: InArgs = [],
): Promise<T | null> {
  const r = await db().execute({ sql, args });
  return (r.rows[0] as unknown as T) ?? null;
}

export interface ExecResult {
  changes: number;
  lastInsertRowid?: bigint;
}

export async function exec(sql: string, args: InArgs = []): Promise<ExecResult> {
  const r = await db().execute({ sql, args });
  return {
    changes: Number(r.rowsAffected),
    ...(r.lastInsertRowid !== undefined ? { lastInsertRowid: r.lastInsertRowid } : {}),
  };
}

/** Run a batch of INSERT/UPDATE statements in a single transaction. */
export async function execBatch(
  stmts: Array<{ sql: string; args?: InArgs }>,
): Promise<number> {
  if (stmts.length === 0) return 0;
  const tx = await db().transaction("write");
  let total = 0;
  try {
    for (const s of stmts) {
      const r = await tx.execute({ sql: s.sql, args: s.args ?? [] });
      total += Number(r.rowsAffected);
    }
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
  return total;
}
