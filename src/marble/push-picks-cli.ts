/**
 * CLI: `bun run push-picks --city barcelona [--threshold 0.85] [--days 14] [--dry]`
 *
 * Run weekly by scripts/weekly-digest.sh AFTER the email digest is sent. The local
 * cron is the source of truth for the rent payload:
 *
 *   1. Load the local Marble KG (read-only, fs.readFile + structuredClone).
 *   2. Score upcoming events with scoreEventsForUser (LLM call — same as today's
 *      recommend/deliver flow; the profile snapshot already touches the LLM wire).
 *   3. Derive a sanitized MePicksPayload v1 (no raw beliefs/identities/preferences).
 *   4. POST to ${SITE_URL}/api/v1/me/picks?token=${ME_TOKEN}.
 *
 * The site falls back to public mode if this push didn't run, so failures here
 * never break the public engine.
 */
import { parseArgs } from "node:util";
import { applySchema, closeDb, queryAll, queryGet } from "../db/index.ts";
import { env } from "../env.ts";
import { derivePayload, MePicksPayloadSchema } from "./derive-payload.ts";
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
    threshold: { type: "string", short: "t" },
    days: { type: "string", short: "d" },
    dry: { type: "boolean" },
  },
});

if (!values.city) {
  console.error("Usage: bun run push-picks --city <slug> [--user <id>] [--threshold 0.85] [--days 14] [--dry]");
  process.exit(2);
}
if (!env.ME_TOKEN) {
  console.error("ME_TOKEN not set in .env — required to authenticate the push.");
  process.exit(2);
}
if (!env.SITE_URL) {
  console.error("SITE_URL not set in .env — defaults to https://events.timesmarble.com.");
  process.exit(2);
}

// Resolve the user (Stage 0: defaults to 'alex'; Stage 1: real Turso user record).
const user = await resolveUserOrDefault(values.user);
const userApiKey = await getApiKeyForUser(user.id, "opencode");
console.log(`[push-picks] user: ${user.id}`);

await applySchema();

const days = values.days ? Number(values.days) : 14;
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

console.log(`[push-picks] ${rows.length} upcoming events for ${city.name} (${days}d window).`);
if (rows.length === 0) {
  console.log("[push-picks] nothing to score; exiting (this is fine — site falls back to public).");
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

// Load KG once (read-only). The resolved user determines where it comes from;
// for the legacy user it's still env.MARBLE_KG_PATH.
const kg = await loadKgForUser(user.id);

console.log(`[push-picks] scoring against KG (threshold ${threshold})…`);
const result = await scoreEventsWithKg(
  events,
  kg,
  {
    city: { name: city.name, centroid, timezone: city.timezone },
    threshold,
  },
  { apiKeyOverride: userApiKey },
);

console.log(
  `[push-picks] scored ${result.scored.length}, surfaced ${result.surfaced.length} (≥${threshold}).`,
);

const payload = derivePayload({
  citySlug: city.slug,
  scoreResult: result,
  user: kg.user,
});

// Belt-and-braces — re-parse with the strict schema.
MePicksPayloadSchema.parse(payload);

if (values.dry) {
  console.log("[push-picks] --dry: payload preview (NOT pushed):");
  console.log(JSON.stringify(payload, null, 2));
  closeDb();
  process.exit(0);
}

const endpoint = `${env.SITE_URL.replace(/\/$/, "")}/api/v1/me/picks?token=${encodeURIComponent(env.ME_TOKEN)}`;
console.log(`[push-picks] POST → ${endpoint.replace(/token=[^&]+/, "token=…")}`);

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

const responseText = await res.text();
if (!res.ok) {
  console.error(`[push-picks] FAILED ${res.status}: ${responseText.slice(0, 400)}`);
  closeDb();
  process.exit(1);
}

console.log(`[push-picks] ok: ${responseText.slice(0, 200)}`);
console.log(
  `[push-picks] payload summary: ${payload.picks.length} picks, ${payload.interest_palette.length} interests, ` +
    `${Object.keys(payload.category_weights).length} categories, palette ${payload.accent_palette.primary}, ` +
    `kg fingerprint ${payload.kg_fingerprint}, expires ${payload.expires_at.slice(0, 10)}.`,
);

closeDb();
