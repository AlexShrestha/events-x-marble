/**
 * One-shot Luma ingest for Barcelona.
 *
 * Fetches https://lu.ma/discover?location=barcelona, parses the embedded
 * __NEXT_DATA__ Next.js hydration blob, and upserts every event into the
 * `events` table under source_name = "Luma — Barcelona (discover)".
 *
 * This is a temporary patch — proper fix is to add a `scrape-nextjs` fetcher
 * to src/discovery/fetchers/ and register Luma as a Tier 0 source. For now
 * the user's /me dashboard needs tech events RIGHT NOW, and Luma is where
 * Barcelona's AI/builder/founder events actually live (per their curated
 * list: AI Engineers BCN, Tech Founder Hang, Apache Iceberg, etc.).
 *
 * Run via:
 *   bun scripts/ingest-luma-bcn.ts
 */
import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";

const c = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// --- 1. Fetch + parse Luma's Barcelona discover page
console.log("fetching lu.ma/discover?location=barcelona…");
const res = await fetch("https://lu.ma/discover?location=barcelona", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    Accept: "text/html",
  },
});
if (!res.ok) {
  throw new Error(`lu.ma HTTP ${res.status}`);
}
const html = await res.text();
const m = /<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s.exec(html);
if (!m) {
  throw new Error("no __NEXT_DATA__ script tag in Luma response");
}
const data = JSON.parse(m[1]);
const events = data?.props?.pageProps?.initialData?.featured_place?.events;
if (!Array.isArray(events)) {
  throw new Error(`couldn't find events array in __NEXT_DATA__`);
}
console.log(`found ${events.length} featured events on lu.ma`);

// --- 2. Look up city_id, ensure source exists
const cityRow = await c.execute({
  sql: "SELECT id FROM cities WHERE slug = ?",
  args: ["barcelona"],
});
const cityId = cityRow.rows[0]?.id as string;
if (!cityId) throw new Error("barcelona city row missing");

const sourceName = "Luma — Barcelona (discover)";
const sourceUrl = "https://lu.ma/discover?location=barcelona";
const existingSrc = await c.execute({
  sql: "SELECT id FROM sources WHERE city_id = ? AND name = ?",
  args: [cityId, sourceName],
});
let sourceId: string;
if (existingSrc.rows[0]) {
  sourceId = existingSrc.rows[0].id as string;
  await c.execute({
    sql: "UPDATE sources SET enabled = 1, last_status = ?, last_run_at = datetime('now') WHERE id = ?",
    args: ["ok", sourceId],
  });
} else {
  sourceId = randomUUID();
  await c.execute({
    sql: `INSERT INTO sources (id, city_id, kind, name, url, tier, enabled, config, last_status, last_run_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      sourceId,
      cityId,
      "scrape",
      sourceName,
      sourceUrl,
      0,
      1,
      JSON.stringify({
        format: "nextjs-scrape",
        items_path: "props.pageProps.initialData.featured_place.events",
        rarity_score: 0.7,
        note: "high-quality tech/founder/builder events curated by Luma",
      }),
      "ok",
    ],
  });
}
console.log(`source registered: ${sourceName} (${sourceId})`);

// --- 3. Map Luma events → events table shape + upsert
//
// Each entry in featured_place.events has a wrapper:
//   { api_id, start_at, event: { name, url, geo_address_info, coordinate, ... },
//     cover_image, calendar, hosts, ... }
// So title/url/venue come from `e.event.*`, not `e.*` directly.
type LumaCoverImage = {
  url?: string | null;
};
type LumaEventInner = {
  name?: string;
  url?: string;
  end_at?: string | null;
  geo_address_info?: {
    city?: string;
    address?: string;
    full_address?: string;
    region?: string;
    country?: string;
  } | null;
  coordinate?: { latitude?: number; longitude?: number } | null;
  description_short?: string | null;
};
type LumaEntry = {
  api_id: string;
  start_at: string;
  event?: LumaEventInner | null;
  cover_image?: LumaCoverImage | null;
};

let inserted = 0;
let updated = 0;
let skipped = 0;
for (const e of events as LumaEntry[]) {
  const inner = e.event ?? null;
  if (!e.api_id || !inner?.name || !e.start_at) {
    skipped++;
    continue;
  }

  const venueName = inner.geo_address_info?.address ?? null;
  const venueAddress = inner.geo_address_info?.full_address ?? null;
  const venueLat = inner.coordinate?.latitude ?? null;
  const venueLng = inner.coordinate?.longitude ?? null;

  // Luma url field is just the slug ("yrb9j5tf"); the public URL is lu.ma/<slug>
  const slug = inner.url ?? "";
  const url = slug.startsWith("http") ? slug : `https://lu.ma/${slug}`;

  // Dedup hash: same shape src/lib/dedup.ts uses everywhere else — title
  // (normalized) + start hour bucket + venue.
  const normTitle = inner.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const startHour = e.start_at.slice(0, 13); // YYYY-MM-DDTHH
  const venueKey = (venueName ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const dedupHash = createHash("sha256")
    .update(`${normTitle}|${startHour}|${venueKey}`)
    .digest("hex");

  // Check existence by dedup_hash
  const existing = await c.execute({
    sql: "SELECT id FROM events WHERE city_id = ? AND dedup_hash = ?",
    args: [cityId, dedupHash],
  });

  const coverUrl = e.cover_image?.url ?? null;

  if (existing.rows[0]) {
    // Update — refresh metadata in case Luma changed something
    await c.execute({
      sql: `UPDATE events
            SET source_id = ?, url = ?, image_url = ?, updated_at = datetime('now')
            WHERE id = ?`,
      args: [sourceId, url, coverUrl, existing.rows[0].id as string],
    });
    updated++;
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
        inner.name,
        inner.description_short ?? null,
        e.start_at,
        inner.end_at ?? null,
        venueName,
        venueAddress,
        venueLat,
        venueLng,
        url,
        coverUrl,
        // Luma events default to a builder/tech-leaning category; scout/scoring
        // re-categorize via raw_extract.tags if more info shows up.
        "luma",
        JSON.stringify([]),
        0.7,
        0.9,
        dedupHash,
        JSON.stringify({ luma_api_id: e.api_id, source: "luma-discover" }),
      ],
    });
    inserted++;
  }
}

console.log(`✓ inserted=${inserted} updated=${updated} skipped=${skipped}`);

// Update source_runs
await c.execute({
  sql: `INSERT INTO source_runs (id, source_id, started_at, finished_at, events_found, events_new, status, cost_usd, model_used)
        VALUES (?, ?, datetime('now', '-30 seconds'), datetime('now'), ?, ?, 'ok', 0, 'nextjs-scrape')`,
  args: [randomUUID(), sourceId, events.length, inserted],
});
