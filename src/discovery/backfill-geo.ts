/**
 * Backfill venue geocoordinates for events that lack them.
 *
 * Usage:
 *   bun run geocode --city <slug> [--limit <n>]
 *
 * Queries Nominatim at <=1 req/sec. Results are cached so re-runs are free.
 */

import { parseArgs } from "node:util";
import { applySchema, exec, queryAll } from "../db/index.ts";
import { getCityBySlug } from "../db/queries.ts";
import { geocodeVenue } from "../lib/geocode.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    limit: { type: "string", short: "l" },
  },
  allowPositionals: true,
});

if (!values.city) {
  console.error("Usage: bun run geocode --city <slug> [--limit <n>]");
  process.exit(2);
}

await applySchema();

const city = await getCityBySlug(values.city);
if (!city) {
  console.error(`City not found: ${values.city}`);
  process.exit(1);
}

const limitN = values.limit ? Number(values.limit) : 200;
if (!Number.isFinite(limitN) || limitN < 1) {
  console.error("--limit must be a positive integer");
  process.exit(2);
}

interface EventStub {
  id: string;
  venue_name: string;
}

const events = await queryAll<EventStub>(
  `SELECT id, venue_name
   FROM events
   WHERE city_id = (SELECT id FROM cities WHERE slug = ?)
     AND venue_lat IS NULL
     AND venue_name IS NOT NULL
     AND venue_name <> ''
   LIMIT ?`,
  [city.slug, limitN],
);

console.log(
  `[backfill-geo] ${events.length} events need geocoding in ${city.name}`,
);

const hint = `${city.name}, ${city.country_code}`;
const wallStart = Date.now();

let hits = 0;
let misses = 0;
const geocoded: Array<{ venue_name: string; lat: number; lng: number; display: string }> = [];

for (const event of events) {
  const result = await geocodeVenue(event.venue_name, city.slug, hint);

  if (result) {
    await exec(
      `UPDATE events
       SET venue_lat = ?, venue_lng = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [result.lat, result.lng, event.id],
    );

    hits++;
    geocoded.push({
      venue_name: event.venue_name,
      lat: result.lat,
      lng: result.lng,
      display: result.display,
    });
    console.log(`  [+] ${event.venue_name} → ${result.lat}, ${result.lng}`);
  } else {
    misses++;
    console.log(`  [-] ${event.venue_name} (not found)`);
  }
}

const wallMs = Date.now() - wallStart;

console.log("\n--- Summary ---");
console.log(`Processed : ${events.length}`);
console.log(`Geocoded  : ${hits}`);
console.log(`Not found : ${misses}`);
console.log(`Wall time : ${(wallMs / 1000).toFixed(1)}s`);

if (geocoded.length > 0) {
  console.log("\nTop geocoded venues:");
  geocoded.slice(0, 5).forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.venue_name}`);
    console.log(`     lat=${v.lat.toFixed(5)}, lng=${v.lng.toFixed(5)}`);
    console.log(`     ${v.display.slice(0, 80)}`);
  });
}
