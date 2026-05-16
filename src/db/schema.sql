-- Events x Marble — local SQLite schema.
-- Mirrors the Postgres schema in the plan; geography types swapped for plain lat/lng REAL columns.
-- When migrating to Supabase, recreate with PostGIS geography(point, 4326) on venue_location.

CREATE TABLE IF NOT EXISTS cities (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  country_code  TEXT NOT NULL,
  timezone      TEXT NOT NULL,
  bbox_min_lng  REAL,
  bbox_min_lat  REAL,
  bbox_max_lng  REAL,
  bbox_max_lat  REAL,
  centroid_lng  REAL,
  centroid_lat  REAL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id             TEXT PRIMARY KEY,
  city_id        TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('feed', 'api', 'scrape', 'web_search')),
  name           TEXT NOT NULL,
  url            TEXT NOT NULL,
  config         TEXT NOT NULL DEFAULT '{}',   -- JSON
  enabled        INTEGER NOT NULL DEFAULT 1,
  tier           INTEGER NOT NULL DEFAULT 0 CHECK (tier IN (0, 1, 2)),
  last_run_at    TEXT,
  last_status    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sources_city_enabled ON sources(city_id, enabled);

CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,
  city_id         TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  source_id       TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  starts_at       TEXT NOT NULL,  -- ISO 8601 with timezone
  ends_at         TEXT,
  venue_name      TEXT,
  venue_address   TEXT,
  venue_lat       REAL,
  venue_lng       REAL,
  url             TEXT,
  image_url       TEXT,
  category        TEXT,
  tags            TEXT NOT NULL DEFAULT '[]',  -- JSON array
  rarity_score    REAL NOT NULL DEFAULT 0,
  confidence      REAL NOT NULL DEFAULT 1,
  dedup_hash      TEXT NOT NULL,
  raw_extract     TEXT,                         -- JSON
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(city_id, dedup_hash)
);
CREATE INDEX IF NOT EXISTS idx_events_city_starts ON events(city_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_city_rarity ON events(city_id, rarity_score)
  WHERE rarity_score > 0.5;

CREATE TABLE IF NOT EXISTS source_runs (
  id            TEXT PRIMARY KEY,
  source_id     TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at   TEXT,
  events_found  INTEGER NOT NULL DEFAULT 0,
  events_new    INTEGER NOT NULL DEFAULT 0,
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  cost_usd      REAL NOT NULL DEFAULT 0,
  model_used    TEXT,
  status        TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'ok', 'rate_limited', 'error', 'skipped')),
  error         TEXT
);
CREATE INDEX IF NOT EXISTS idx_source_runs_source ON source_runs(source_id, started_at DESC);

CREATE TABLE IF NOT EXISTS cost_ledger (
  id                  TEXT PRIMARY KEY,
  run_id              TEXT REFERENCES source_runs(id) ON DELETE SET NULL,
  model               TEXT NOT NULL,
  prompt_tokens       INTEGER NOT NULL DEFAULT 0,
  completion_tokens   INTEGER NOT NULL DEFAULT 0,
  cost_usd            REAL NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cost_ledger_created ON cost_ledger(created_at);
