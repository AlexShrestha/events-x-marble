/**
 * Public seed: schema migration + one example city + minimal Tier 0 source.
 *
 * Intentionally minimal — does NOT insert any sample events. A fresh checkout
 * runs this once, then populates real events via `bun run pipeline`.
 *
 * For deployment-specific sample data (your own taste-flavored fixtures),
 * create a `scripts/seed-local.ts` (gitignored under `*.local.ts`).
 */

import { randomUUID } from "node:crypto";
import { applySchema, closeDb, db } from "./index.ts";

applySchema();

const D = db();

const cityId = upsertCity({
  slug: "barcelona",
  name: "Barcelona",
  country_code: "ES",
  timezone: "Europe/Madrid",
  bbox: [2.052, 41.32, 2.228, 41.469],
  centroid: [2.154, 41.39],
});

// One generic Tier 0 source as a smoke-test target: Spanish national holidays.
upsertSource({
  city_id: cityId,
  kind: "feed",
  name: "Spain national holidays (Google iCal)",
  url: "https://calendar.google.com/calendar/ical/es.spain%23holiday%40group.v.calendar.google.com/public/basic.ics",
  tier: 0,
  config: { format: "ical", category: "holiday", rarity_score: 0.4 },
});

console.log("Seeded city=barcelona + one Tier 0 holidays source. Run `bun run pipeline --city barcelona --tier 0` to ingest.");
closeDb();

// --- helpers (exported so local/opt-in seed scripts can reuse) ---

export function upsertCity(input: {
  slug: string;
  name: string;
  country_code: string;
  timezone: string;
  bbox: [number, number, number, number];
  centroid: [number, number];
}): string {
  const existing = D.query("SELECT id FROM cities WHERE slug = ?").get(input.slug) as
    | { id: string }
    | null;
  if (existing) return existing.id;
  const id = randomUUID();
  D.run(
    `INSERT INTO cities (id, slug, name, country_code, timezone,
      bbox_min_lng, bbox_min_lat, bbox_max_lng, bbox_max_lat,
      centroid_lng, centroid_lat)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.slug,
      input.name,
      input.country_code,
      input.timezone,
      input.bbox[0],
      input.bbox[1],
      input.bbox[2],
      input.bbox[3],
      input.centroid[0],
      input.centroid[1],
    ],
  );
  return id;
}

export function upsertSource(input: {
  city_id: string;
  kind: "feed" | "api" | "scrape" | "web_search";
  name: string;
  url: string;
  tier: 0 | 1 | 2;
  enabled?: boolean;
  config?: Record<string, unknown>;
}): string {
  const existing = D.query("SELECT id FROM sources WHERE city_id = ? AND name = ?").get(
    input.city_id,
    input.name,
  ) as { id: string } | null;
  if (existing) return existing.id;
  const id = randomUUID();
  D.run(
    `INSERT INTO sources (id, city_id, kind, name, url, tier, enabled, config)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.city_id,
      input.kind,
      input.name,
      input.url,
      input.tier,
      input.enabled === false ? 0 : 1,
      JSON.stringify(input.config ?? {}),
    ],
  );
  return id;
}
