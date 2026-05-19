/**
 * Database client — @libsql/client.
 *
 * Local dev:  uses `file:./data.db` (auto-derived from sqlite://./data.db).
 * Production: set TURSO_URL=libsql://...turso.io and TURSO_AUTH_TOKEN=eyJ...
 *
 * @libsql/client API is async. ALL query call sites in this codebase therefore
 * use `await db().execute(...)` or the helpers below.
 */
// Use the web entry — pure JS, fetch-based, no native bindings.
// Works on Vercel's Linux x64 runtime AND in Bun local dev (against Turso HTTPS).
// Tradeoff: no `file:./data.db` local mode. Local dev now uses TURSO_URL too.
import { createClient, type Client, type InArgs } from "@libsql/client/web";
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
  if (!env.TURSO_URL) {
    throw new Error(
      "TURSO_URL not set. The web client requires a libsql:// or https:// URL " +
        "(file:./data.db mode is not supported by @libsql/client/web).",
    );
  }
  // @libsql/client/web requires https://, not libsql:// scheme.
  const url = env.TURSO_URL.replace(/^libsql:/i, "https:");
  return env.TURSO_AUTH_TOKEN ? { url, authToken: env.TURSO_AUTH_TOKEN } : { url };
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
