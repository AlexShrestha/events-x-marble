/**
 * CLI: `bun run recommend --city barcelona [--days 7] [--notes "..."] [--threshold 0.85]`
 *
 * Pulls upcoming events for the city from data.db, scores each with the
 * user's Marble KG (env: MARBLE_KG_PATH), prints the surfaced 1–3 above
 * threshold + the next 10 highest-scoring as the "could-be-interesting" tail.
 *
 * Does NOT write to data.db. Does NOT cache scores. Does NOT touch the KG file.
 */
import { parseArgs } from "node:util";
import { applySchema, closeDb, queryAll, queryGet } from "../db/index.ts";
import { scoreEventsWithKg, type EventForScoring } from "./scorer.ts";
import {
  getApiKeyForUser,
  loadKgForUser,
  resolveUserOrDefault,
} from "./user.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    user: { type: "string", short: "u" },
    days: { type: "string", short: "d" },
    notes: { type: "string", short: "n" },
    threshold: { type: "string", short: "t" },
    model: { type: "string", short: "m" },
  },
});

if (!values.city) {
  console.error('Usage: bun run recommend --city <slug> [--user <id>] [--days 7] [--notes "..."] [--threshold 0.85] [--model claude-haiku-4-5]');
  process.exit(2);
}

const user = await resolveUserOrDefault(values.user);
const userApiKey = await getApiKeyForUser(user.id, "opencode");
console.log(`[recommend] user: ${user.id}`);

await applySchema();

const days = values.days ? Number(values.days) : 7;
const threshold = values.threshold ? Number(values.threshold) : 0.85;

interface CityRow {
  slug: string;
  name: string;
  timezone: string;
  centroid_lng: number | null;
  centroid_lat: number | null;
}
const city = await queryGet<CityRow>(
  "SELECT slug, name, timezone, centroid_lng, centroid_lat FROM cities WHERE slug = ?",
  [values.city],
);
if (!city) {
  console.error(`Unknown city: ${values.city}`);
  process.exit(2);
}

const now = new Date();
const horizon = new Date(now);
horizon.setDate(horizon.getDate() + days);

interface EventDbRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  category: string | null;
  rarity_score: number;
  url: string | null;
  source_name: string;
}

const rows = await queryAll<EventDbRow>(
  `SELECT e.id, e.title, e.description, e.starts_at, e.ends_at,
          e.venue_name, e.venue_address, e.venue_lat, e.venue_lng,
          e.category, e.rarity_score, e.url,
          s.name AS source_name
   FROM events e JOIN sources s ON s.id = e.source_id
   WHERE e.city_id = (SELECT id FROM cities WHERE slug = ?)
     AND e.starts_at >= ? AND e.starts_at < ?
   ORDER BY e.starts_at ASC`,
  [city.slug, now.toISOString(), horizon.toISOString()],
);

console.log(
  `Loaded ${rows.length} upcoming events for ${city.name} (${days}-day window). Scoring with Marble KG…`,
);

if (rows.length === 0) {
  console.log("No events. Run `bun run pipeline --city barcelona` first.");
  closeDb();
  process.exit(0);
}

const events: EventForScoring[] = rows.map((r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  starts_at: r.starts_at,
  ends_at: r.ends_at,
  venue_name: r.venue_name,
  venue_address: r.venue_address,
  venue_lat: r.venue_lat,
  venue_lng: r.venue_lng,
  category: r.category,
  rarity_score: r.rarity_score,
  source: r.source_name,
  url: r.url,
}));

const centroid: [number, number] | null =
  city.centroid_lng != null && city.centroid_lat != null
    ? [city.centroid_lng, city.centroid_lat]
    : null;

const kg = await loadKgForUser(user.id);

const result = await scoreEventsWithKg(
  events,
  kg,
  {
    city: { name: city.name, centroid, timezone: city.timezone },
    ...(values.notes ? { notes: values.notes } : {}),
    threshold,
    ...(values.model ? { model: values.model } : {}),
  },
  { apiKeyOverride: userApiKey },
);

console.log("");
console.log(`KG loaded from: ${result.meta.kg_loaded_from}`);
console.log(
  `KG counts: ${JSON.stringify(result.meta.kg_counts)}  |  forecast: ${result.meta.forecast_days}d  |  model: ${result.meta.model_used}  |  tokens: ${result.meta.tokens_used}  |  cost: $${result.meta.cost_usd.toFixed(4)}`,
);
console.log(`Threshold: score ≥ ${result.meta.threshold}`);
console.log("");

if (result.surfaced.length === 0) {
  console.log("→ NOTHING crossed the irresistibility threshold this week. (This is a feature.)");
} else {
  console.log(`→ ${result.surfaced.length} event(s) crossed the threshold:`);
  console.log("");
  for (const e of result.surfaced) {
    console.log(`  🔥 ${e.marble_score.toFixed(2)} | ${e.starts_at.slice(0, 16)} | ${e.title}`);
    console.log(`         venue: ${e.venue_name ?? "—"}  ·  source: ${e.source}`);
    console.log(`         why  : ${e.why}`);
    if (e.url) console.log(`         link : ${e.url}`);
    console.log("");
  }
}

console.log("--- next 10 highest (below threshold) ---");
const tail = result.scored
  .filter((e) => e.marble_score < result.meta.threshold)
  .slice(0, 10);
for (const e of tail) {
  console.log(
    `   ${e.marble_score.toFixed(2)} | ${e.starts_at.slice(0, 10)} | ${e.title.slice(0, 60)}  (${e.why.slice(0, 80)})`,
  );
}

closeDb();
