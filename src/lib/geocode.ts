/**
 * Free venue geocoding via Nominatim (OpenStreetMap).
 * Hard rate-limit: 1 request/second (module-level mutex).
 * Results (including not-found) are cached in geocode_cache to avoid re-querying.
 */

import { db } from "../db/index.ts";
import { getUserAgent } from "./user-agent.ts";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = getUserAgent();
const NOT_FOUND_SENTINEL = "not_found";

interface GeocodeResult {
  lat: number;
  lng: number;
  display: string;
}

interface NominatimHit {
  lat: string;
  lon: string;
  display_name: string;
}

// Module-level rate-limit mutex: track the timestamp of the last request.
let lastRequestAt = 0;

/** Enforce >= 1000 ms between requests. */
async function waitForSlot(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < 1000) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestAt = Date.now();
}

/** Normalise a cache key: lowercase, trim, collapse whitespace. */
function normaliseKey(venueName: string, citySlug: string): string {
  const v = venueName.toLowerCase().trim().replace(/\s+/g, " ");
  const c = citySlug.toLowerCase().trim();
  return `${c}::${v}`;
}

/**
 * Geocode a venue by name using Nominatim.
 *
 * @param venueName  The venue name as stored in the events table.
 * @param citySlug   City slug (e.g. "barcelona") — used as part of the cache key.
 * @param hint       Optional context appended to the query (e.g. "Barcelona, ES").
 * @returns Coordinates + display string, or null if the venue could not be found.
 */
export async function geocodeVenue(
  venueName: string,
  citySlug: string,
  hint?: string,
): Promise<GeocodeResult | null> {
  const key = normaliseKey(venueName, citySlug);

  // Check cache first (a null result is stored as display='not_found').
  const cached = db()
    .query<
      { lat: number | null; lng: number | null; display: string | null },
      [string]
    >("SELECT lat, lng, display FROM geocode_cache WHERE key = ?")
    .get(key);

  if (cached !== null) {
    if (cached.display === NOT_FOUND_SENTINEL) return null;
    if (cached.lat !== null && cached.lng !== null && cached.display !== null) {
      return { lat: cached.lat, lng: cached.lng, display: cached.display };
    }
    return null;
  }

  // Build query string: "Venue Name, Barcelona, ES" (if hint supplied).
  const queryParts = [venueName];
  if (hint) queryParts.push(hint);
  const q = encodeURIComponent(queryParts.join(", "));
  const url = `${NOMINATIM_BASE}?q=${q}&format=json&limit=1&accept-language=en,es,ca`;

  await waitForSlot();

  let result: GeocodeResult | null = null;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      console.error(`[geocode] HTTP ${res.status} for "${venueName}"`);
    } else {
      const hits = (await res.json()) as NominatimHit[];
      if (hits.length > 0) {
        const hit = hits[0];
        result = {
          lat: parseFloat(hit.lat),
          lng: parseFloat(hit.lon),
          display: hit.display_name,
        };
      }
    }
  } catch (err) {
    console.error(`[geocode] Network error for "${venueName}":`, err);
  }

  // Cache the result — including not-found — so we don't re-query.
  db()
    .query(
      `INSERT OR REPLACE INTO geocode_cache (key, lat, lng, display)
       VALUES (?, ?, ?, ?)`,
    )
    .run(
      key,
      result?.lat ?? null,
      result?.lng ?? null,
      result ? result.display : NOT_FOUND_SENTINEL,
    );

  return result;
}
