/**
 * Edge geo detection. Vercel auto-populates these headers on every request:
 *
 *   x-vercel-ip-country        → "US" / "ES" / etc.
 *   x-vercel-ip-country-region → "CA" / "MD" / etc.
 *   x-vercel-ip-city           → "Barcelona" (URL-encoded if non-ASCII)
 *   x-vercel-ip-latitude       → "41.3851"
 *   x-vercel-ip-longitude      → "2.1734"
 *   x-vercel-ip-timezone       → "Europe/Madrid"
 *
 * For dev/non-Vercel hosts these are absent; we degrade to {city: null}.
 *
 * The "elegant multi-city" UX hinges on this: a fresh visitor's city comes
 * from the edge headers without us asking. /connect just shows the result
 * and lets them confirm / edit.
 */

import { queryGet, exec } from "../db/index.ts";

export interface Geo {
  city: string | null;
  citySlug: string | null;
  country: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string | null;
}

export function geoFromHeaders(headers: Headers): Geo {
  const decode = (k: string): string | null => {
    const v = headers.get(k);
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };

  const city = decode("x-vercel-ip-city");
  const country = headers.get("x-vercel-ip-country");
  const region = headers.get("x-vercel-ip-country-region");
  const latStr = headers.get("x-vercel-ip-latitude");
  const lngStr = headers.get("x-vercel-ip-longitude");
  const timezone = decode("x-vercel-ip-timezone");

  const lat = latStr ? Number(latStr) : null;
  const lng = lngStr ? Number(lngStr) : null;

  return {
    city: city || null,
    citySlug: city ? slugify(city) : null,
    country: country || null,
    region: region || null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    timezone: timezone || null,
  };
}

/** ASCII-normalize + lowercase a city name for use as a URL slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Ensure a city row exists for the given geo. Returns the city slug to use.
 *
 * If a row with the slug already exists, returns it. Otherwise INSERTs a new
 * row with the centroid + timezone from the geo data, then returns the slug.
 *
 * If the geo data has no city (edge headers absent in dev / non-Vercel env),
 * falls back to "barcelona" — the seed city this codebase shipped with.
 */
export async function ensureCityFromGeo(geo: Geo): Promise<string> {
  if (!geo.citySlug) return "barcelona";

  const existing = await queryGet<{ id: string; slug: string }>(
    "SELECT id, slug FROM cities WHERE slug = ?",
    [geo.citySlug],
  );
  if (existing) return existing.slug;

  // Auto-bootstrap a fresh city row. Use the geo's centroid + timezone; bbox
  // we don't have so we leave null. The discovery pipeline can backfill bbox
  // later if needed (it's only used for PostGIS-style filtering which we don't
  // do on SQLite anyway).
  const id = `cty_${cryptoRandomHex(8)}`;
  const name = geo.city ?? geo.citySlug;
  const country = geo.country ?? "??";
  const timezone = geo.timezone ?? guessTimezone(geo.country);
  await exec(
    `INSERT INTO cities (id, slug, name, country_code, timezone, centroid_lng, centroid_lat)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, geo.citySlug, name, country.slice(0, 2), timezone, geo.lng, geo.lat],
  );
  return geo.citySlug;
}

/** Very rough fallback timezone from country code. Not authoritative —
 *  Vercel's x-vercel-ip-timezone is much better; this only kicks in if absent. */
function guessTimezone(country: string | null): string {
  if (!country) return "UTC";
  const map: Record<string, string> = {
    ES: "Europe/Madrid", DE: "Europe/Berlin", FR: "Europe/Paris",
    GB: "Europe/London", IT: "Europe/Rome", NL: "Europe/Amsterdam",
    PT: "Europe/Lisbon", IE: "Europe/Dublin", CH: "Europe/Zurich",
    BE: "Europe/Brussels", AT: "Europe/Vienna", SE: "Europe/Stockholm",
    NO: "Europe/Oslo", DK: "Europe/Copenhagen", FI: "Europe/Helsinki",
    PL: "Europe/Warsaw", US: "America/New_York", CA: "America/Toronto",
    MX: "America/Mexico_City", BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires",
    JP: "Asia/Tokyo", KR: "Asia/Seoul", CN: "Asia/Shanghai",
    HK: "Asia/Hong_Kong", SG: "Asia/Singapore", IN: "Asia/Kolkata",
    AU: "Australia/Sydney", NZ: "Pacific/Auckland",
  };
  return map[country.toUpperCase()] ?? "UTC";
}

function cryptoRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
