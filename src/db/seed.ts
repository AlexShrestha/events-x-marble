import { randomUUID } from "node:crypto";
import { applySchema, closeDb, db } from "./index.ts";
import { dedupHash } from "../lib/dedup.ts";

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

const sampleSourceId = upsertSource({
  city_id: cityId,
  kind: "api",
  name: "sample (seed)",
  url: "internal://seed",
  tier: 0,
});

// Real Tier 0 sources — iCal feeds that are public and structured.
upsertSource({
  city_id: cityId,
  kind: "feed",
  name: "Spain national holidays (Google iCal)",
  url: "https://calendar.google.com/calendar/ical/es.spain%23holiday%40group.v.calendar.google.com/public/basic.ics",
  tier: 0,
  config: {
    format: "ical",
    category: "holiday",
    rarity_score: 0.4,
  },
});

upsertSource({
  city_id: cityId,
  kind: "feed",
  name: "Catalan public holidays (Google iCal)",
  url: "https://calendar.google.com/calendar/ical/en.catalonian%23holiday%40group.v.calendar.google.com/public/basic.ics",
  tier: 0,
  config: {
    format: "ical",
    category: "holiday",
    rarity_score: 0.5,
  },
});

// Tier 1 placeholder — disabled until Phase 3 turns it on. Edit in DB or via admin route.
upsertSource({
  city_id: cityId,
  kind: "scrape",
  name: "barcelona.com events (Tier 1 LLM scrape)",
  url: "https://www.barcelona.com/events",
  tier: 1,
  enabled: false,
  config: {
    category: null,
    rarity_score: 0.4,
  },
});

const now = new Date();
const baseDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0, 0);

const sampleEvents = [
  {
    title: "Sant Pau del Camp — open day",
    description: "Rare opening of the oldest Romanesque church in Barcelona. Free entry, guided tour available.",
    offsetDays: 0,
    hour: 11,
    venue_name: "Sant Pau del Camp",
    venue_address: "Carrer de Sant Pau, 101, El Raval",
    venue_lat: 41.376,
    venue_lng: 2.169,
    url: "https://example.com/sant-pau-open-day",
    category: "religious",
    rarity_score: 0.9,
  },
  {
    title: "Festa Major de Gràcia — opening night",
    description: "Street decorations, neighborhood orchestras, late-night vermouth.",
    offsetDays: 1,
    hour: 20,
    venue_name: "Plaça de la Vila de Gràcia",
    venue_address: "Plaça de la Vila de Gràcia, Gràcia",
    venue_lat: 41.4025,
    venue_lng: 2.1565,
    url: "https://example.com/festa-gracia",
    category: "community",
    rarity_score: 0.6,
  },
  {
    title: "Late-night jazz at Jamboree",
    description: "Resident quintet, two sets.",
    offsetDays: 2,
    hour: 22,
    venue_name: "Jamboree Jazz",
    venue_address: "Plaça Reial, 17",
    venue_lat: 41.3805,
    venue_lng: 2.1745,
    url: "https://example.com/jamboree",
    category: "music",
    rarity_score: 0.2,
  },
  {
    title: "Pedralbes monastery — twilight tour",
    description: "Audio-guided evening visit, includes the apothecary and cloister.",
    offsetDays: 3,
    hour: 19,
    venue_name: "Reial Monestir de Santa Maria de Pedralbes",
    venue_address: "Baixada del Monestir, 9",
    venue_lat: 41.395,
    venue_lng: 2.111,
    url: "https://example.com/pedralbes",
    category: "religious",
    rarity_score: 0.75,
  },
  {
    title: "CCCB — Joana Biarnés retrospective",
    description: "Last week of the photography exhibition.",
    offsetDays: 5,
    hour: 18,
    venue_name: "CCCB",
    venue_address: "Carrer de Montalegre, 5",
    venue_lat: 41.382,
    venue_lng: 2.169,
    url: "https://example.com/cccb-biarnes",
    category: "exhibition",
    rarity_score: 0.45,
  },
] as const;

let inserted = 0;
for (const e of sampleEvents) {
  const starts = new Date(baseDay);
  starts.setDate(starts.getDate() + e.offsetDays);
  starts.setHours(e.hour, 0, 0, 0);
  const startsIso = starts.toISOString();
  const ends = new Date(starts);
  ends.setHours(starts.getHours() + 2);

  const hash = dedupHash({
    title: e.title,
    starts_at: startsIso,
    venue_name: e.venue_name,
  });

  const result = D.run(
    `INSERT OR IGNORE INTO events (
      id, city_id, source_id, title, description, starts_at, ends_at,
      venue_name, venue_address, venue_lat, venue_lng, url, image_url,
      category, tags, rarity_score, confidence, dedup_hash, raw_extract
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      cityId,
      sampleSourceId,
      e.title,
      e.description,
      startsIso,
      ends.toISOString(),
      e.venue_name,
      e.venue_address,
      e.venue_lat,
      e.venue_lng,
      e.url,
      null,
      e.category,
      "[]",
      e.rarity_score,
      0.95,
      hash,
      null,
    ],
  );
  if (result.changes > 0) inserted++;
}

console.log(`Seeded city=barcelona; sample events inserted: ${inserted}`);
closeDb();

function upsertCity(input: {
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

function upsertSource(input: {
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
