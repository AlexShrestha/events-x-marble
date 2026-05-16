import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sqlitePath } from "../env.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _db: Database | null = null;

export function db(): Database {
  if (_db) return _db;
  const path = sqlitePath();
  const d = new Database(path, { create: true });
  d.exec("PRAGMA journal_mode = WAL;");
  d.exec("PRAGMA foreign_keys = ON;");
  d.exec("PRAGMA busy_timeout = 5000;");
  _db = d;
  return d;
}

export function applySchema(): void {
  const sql = readFileSync(resolve(__dirname, "schema.sql"), "utf8");
  db().exec(sql);
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
