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

CREATE TABLE IF NOT EXISTS geocode_cache (
  key         TEXT PRIMARY KEY,
  lat         REAL,
  lng         REAL,
  display     TEXT,
  queried_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- v2 — Personalization rent payload pushed by the local cron.
-- Stores ONLY derived/sanitized signals (picks + emoji palette + category weights
-- + ≤120-char rationales). Never raw beliefs/identities/preferences. See
-- src/marble/derive-payload.ts for the sanitizer that enforces this contract.
CREATE TABLE IF NOT EXISTS me_picks (
  id              TEXT PRIMARY KEY,
  city_slug       TEXT NOT NULL,
  schema_version  INTEGER NOT NULL DEFAULT 1,
  payload         TEXT NOT NULL,                 -- JSON: MePicksPayload v1
  kg_fingerprint  TEXT NOT NULL,                 -- sha256(snapshot)[:8], non-reversible
  generated_at    TEXT NOT NULL,
  expires_at      TEXT NOT NULL,
  last_push_ip    TEXT,
  user_id         TEXT,                          -- v3: per-user keying. NULL = legacy pre-migration.
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_me_picks_city_generated
  ON me_picks(city_slug, generated_at DESC);
-- Note: idx_me_picks_user is created in src/db/migrate.ts AFTER the ALTER TABLE
-- that adds the user_id column on already-existing me_picks tables.

-- v3 — Multi-user support. Marble KGs stay on the user's laptop; we only
-- store enough to (a) route their pushed picks to the right row and
-- (b) authenticate the laptop CLI that's pushing.
CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,                            -- 'alex' (legacy) or 'usr_<random>'
  display_name        TEXT,
  default_city_slug   TEXT NOT NULL DEFAULT 'barcelona',
  is_admin            INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at          TEXT
);

-- Per-user tokens. Plaintext token only ever exists on the user's laptop
-- (in ~/.events-x-marble/config.json) and in their browser cookie. The
-- server stores sha256(token) only. Rotate by issuing a fresh row + revoking
-- the old one; revoke by setting revoked_at.
CREATE TABLE IF NOT EXISTS user_tokens (
  id              TEXT PRIMARY KEY,                                -- 'tok_<random>'
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,                            -- sha256(plaintext)
  label           TEXT,                                            -- 'laptop', 'work-mbp', etc.
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at      TEXT,
  last_seen_at    TEXT,
  last_seen_ip    TEXT
);
CREATE INDEX IF NOT EXISTS idx_user_tokens_hash_active
  ON user_tokens(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_tokens_user
  ON user_tokens(user_id, revoked_at);

-- Per-user onboarding state — CLI posts status updates throughout init,
-- scoring, and pushing. The /me page reads these columns to render the right
-- view ('still ingesting', 'set your API key first', 'failed: contact us',
-- 'ready'). user_status_log stores the audit trail for diagnostics.
-- These columns are added idempotently by src/db/migrate.ts so existing rows
-- are upgraded without re-creating the table.

CREATE TABLE IF NOT EXISTS user_status_log (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state           TEXT NOT NULL,            -- 'new'|'key_missing'|'ingesting'|'learning'|'scoring'|'pushing'|'ready'|'error'
  message         TEXT,                     -- human-readable detail
  error_category  TEXT,                     -- 'key_invalid'|'kg_load_failed'|'ingest_failed'|'learn_failed'|'score_failed'|'push_failed'|'network'|'unknown'
  client_info     TEXT,                     -- e.g. CLI version, hostname (optional, redacted)
  remote_ip       TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_status_log_user
  ON user_status_log(user_id, created_at DESC);

-- Browser onboarding handshake. A visitor lands on /connect; we mint a
-- session id, the browser polls /api/v1/connect/status. The CLI's `init`
-- carries the session id back via POST /api/v1/register, which links
-- the new user to the session — so the browser can auto-redirect to /me
-- without the user pasting any URL.
CREATE TABLE IF NOT EXISTS connect_sessions (
  id            TEXT PRIMARY KEY,              -- 'cnx_<random>' (browser holds this; polled URL)
  user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'connected'
  user_agent    TEXT,                            -- of the browser that created it
  origin_ip     TEXT,
  -- Geo detected from Vercel edge headers when the session was minted.
  -- Used by /api/v1/register so the CLI inherits the user's city without prompts.
  geo_city      TEXT,
  geo_country   TEXT,
  geo_region    TEXT,
  geo_lat       REAL,
  geo_lng       REAL,
  geo_timezone  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at    TEXT NOT NULL,                   -- 30 min from creation
  connected_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_connect_sessions_status
  ON connect_sessions(status, expires_at);
