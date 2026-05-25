/**
 * Persist deep-research outputs from /tmp/deep-research-barcelona-{sources,events}.json
 * into the live Turso DB.
 *
 *   - sources with confidence >= 0.7 → enabled=1
 *   - sources with confidence < 0.7 → enabled=0 (pending manual review)
 *   - all 24 events upserted by dedup_hash (title + start_hour + venue)
 *   - events get a synthetic source row keyed by the source_url so the events
 *     join cleanly back when /api/v1/events surfaces them
 *
 * This is a one-shot for THIS session. The persistent build (task #13) wraps
 * the same logic in `src/research/deep.ts` as a recurring CLI.
 */
import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const c = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const cityRow = await c.execute({
  sql: "SELECT id FROM cities WHERE slug = ?",
  args: ["barcelona"],
});
const cityId = cityRow.rows[0]?.id as string;
if (!cityId) throw new Error("barcelona city not in db");

// --- 1. Sources --------------------------------------------------------------

interface ResearchSource {
  name: string;
  url: string;
  kind?: "scrape" | "feed" | "api" | "web_search" | "telegram" | "website";
  tier?: 0 | 1 | 2;
  category_hint?: string;
  language?: string;
  rarity_hint?: number;
  rationale?: string;
  confidence: number;
  expected_events_per_week?: number;
}

const sourcesFile = JSON.parse(
  readFileSync("/tmp/deep-research-barcelona-sources.json", "utf8"),
) as { sources: ResearchSource[] };

let sourcesInserted = 0;
let sourcesUpdated = 0;
let sourcesEnabled = 0;
for (const s of sourcesFile.sources) {
  // Skip if URL already present under same city — keeps dedup tight.
  const existing = await c.execute({
    sql: "SELECT id, enabled FROM sources WHERE city_id = ? AND url = ?",
    args: [cityId, s.url],
  });

  const shouldEnable = s.confidence >= 0.7 ? 1 : 0;
  // Schema constraint: kind IN ('feed', 'api', 'scrape', 'web_search').
  // Map the agent's free-form hints into the closest enum slot.
  const VALID_KINDS = new Set(["feed", "api", "scrape", "web_search"]);
  const rawKind = (s.kind ?? "").toString().toLowerCase();
  const kind = VALID_KINDS.has(rawKind)
    ? rawKind
    : rawKind === "rss" || rawKind === "ical" || rawKind === "json"
      ? "feed"
      : "scrape";
  // schema constraint: tier IN (0, 1, 2). Clamp anything else (the agent
  // returned a few tier=3 for "deep research" candidates).
  const rawTier = typeof s.tier === "number" ? s.tier : 1;
  const tier = rawTier <= 0 ? 0 : rawTier >= 2 ? 2 : 1;

  const config = {
    discovered_via: "deep-research-2026-05-25",
    kind_hint: s.kind ?? "website",
    language: s.language ?? "ca",
    category_hint: s.category_hint ?? "neighborhood-cultural",
    rationale: s.rationale ?? "",
    confidence: s.confidence,
    rarity_score: s.rarity_hint ?? 0.5,
    expected_events_per_week: s.expected_events_per_week ?? null,
    scouted_at: new Date().toISOString(),
  };

  if (existing.rows[0]) {
    // Only flip enabled UP, never down — don't disable something Alex manually enabled
    const wasEnabled = (existing.rows[0].enabled as number) === 1;
    const newEnabled = wasEnabled || shouldEnable === 1 ? 1 : 0;
    await c.execute({
      sql: `UPDATE sources SET enabled = ?, config = ? WHERE id = ?`,
      args: [newEnabled, JSON.stringify(config), existing.rows[0].id as string],
    });
    sourcesUpdated++;
    if (!wasEnabled && newEnabled) sourcesEnabled++;
  } else {
    const id = randomUUID();
    await c.execute({
      sql: `INSERT INTO sources (id, city_id, kind, name, url, tier, enabled, config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, cityId, kind, s.name, s.url, tier, shouldEnable, JSON.stringify(config)],
    });
    sourcesInserted++;
    if (shouldEnable) sourcesEnabled++;
  }
}

console.log(
  `sources: ${sourcesInserted} new · ${sourcesUpdated} updated · ${sourcesEnabled} ended up enabled (confidence ≥ 0.7)`,
);

// --- 2. Events ---------------------------------------------------------------

interface ResearchEvent {
  title: string;
  url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  category?: string | null;
  description?: string | null;
  rarity_score?: number;
  source_url?: string | null;
  rarity_reason?: string | null;
}

const eventsFile = JSON.parse(
  readFileSync("/tmp/deep-research-barcelona-events.json", "utf8"),
) as { events: ResearchEvent[] };

// Make sure we have a sentinel source row to attribute events that didn't come
// from any of the persisted sources above (the agent might have found events
// via cross-referencing rather than a source crawl).
const sentinelName = "Deep Research (manual finds, 2026-05-25)";
const sentinelExisting = await c.execute({
  sql: "SELECT id FROM sources WHERE city_id = ? AND name = ?",
  args: [cityId, sentinelName],
});
let sentinelId: string;
if (sentinelExisting.rows[0]) {
  sentinelId = sentinelExisting.rows[0].id as string;
} else {
  sentinelId = randomUUID();
  await c.execute({
    sql: `INSERT INTO sources (id, city_id, kind, name, url, tier, enabled, config)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      sentinelId,
      cityId,
      "web_search",
      sentinelName,
      "https://internal/deep-research/2026-05-25",
      2,
      1,
      JSON.stringify({ note: "events curated by a deep-research agent run on 2026-05-25" }),
    ],
  });
}

let eventsInserted = 0;
let eventsUpdated = 0;
let eventsSkipped = 0;
for (const e of eventsFile.events) {
  if (!e.title || !e.starts_at) {
    eventsSkipped++;
    continue;
  }

  // Try to attribute the event to the source row whose URL matches its source_url,
  // falling back to the sentinel.
  let sourceId = sentinelId;
  if (e.source_url) {
    const srcRow = await c.execute({
      sql: "SELECT id FROM sources WHERE city_id = ? AND (url = ? OR ? LIKE url || '%') ORDER BY length(url) DESC LIMIT 1",
      args: [cityId, e.source_url, e.source_url],
    });
    if (srcRow.rows[0]) sourceId = srcRow.rows[0].id as string;
  }

  const normTitle = e.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const startHour = e.starts_at.slice(0, 13);
  const venueKey = (e.venue_name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const dedupHash = createHash("sha256")
    .update(`${normTitle}|${startHour}|${venueKey}`)
    .digest("hex");

  const existing = await c.execute({
    sql: "SELECT id FROM events WHERE city_id = ? AND dedup_hash = ?",
    args: [cityId, dedupHash],
  });

  const rarity = typeof e.rarity_score === "number" ? e.rarity_score : 0.7;
  const rawExtract = JSON.stringify({
    discovered_via: "deep-research-2026-05-25",
    rarity_reason: e.rarity_reason ?? null,
    original_source_url: e.source_url ?? null,
  });

  if (existing.rows[0]) {
    // Refresh rarity / rationale / source attribution
    await c.execute({
      sql: `UPDATE events
            SET rarity_score = MAX(rarity_score, ?),
                description = COALESCE(description, ?),
                raw_extract = ?,
                source_id = COALESCE(source_id, ?),
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        rarity,
        e.description ?? null,
        rawExtract,
        sourceId,
        existing.rows[0].id as string,
      ],
    });
    eventsUpdated++;
  } else {
    const id = randomUUID();
    await c.execute({
      sql: `INSERT INTO events (
              id, city_id, source_id, title, description,
              starts_at, ends_at,
              venue_name, venue_address, venue_lat, venue_lng,
              url, image_url,
              category, tags,
              rarity_score, confidence,
              dedup_hash, raw_extract,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        id,
        cityId,
        sourceId,
        e.title,
        e.description ?? null,
        e.starts_at,
        e.ends_at ?? null,
        e.venue_name ?? null,
        e.venue_address ?? null,
        null,
        null,
        e.url ?? e.source_url ?? null,
        null,
        e.category ?? "barri-festival",
        JSON.stringify([]),
        rarity,
        0.85,
        dedupHash,
        rawExtract,
      ],
    });
    eventsInserted++;
  }
}

console.log(
  `events: ${eventsInserted} new · ${eventsUpdated} updated · ${eventsSkipped} skipped (missing required fields)`,
);
