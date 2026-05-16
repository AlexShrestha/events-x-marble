import { db } from "./index.ts";

export interface City {
  id: string;
  slug: string;
  name: string;
  country_code: string;
  timezone: string;
  bbox_min_lng: number | null;
  bbox_min_lat: number | null;
  bbox_max_lng: number | null;
  bbox_max_lat: number | null;
  centroid_lng: number | null;
  centroid_lat: number | null;
}

export interface EventRow {
  id: string;
  city_id: string;
  source_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  url: string | null;
  image_url: string | null;
  category: string | null;
  tags: string;
  rarity_score: number;
  confidence: number;
  dedup_hash: string;
  source_name: string;
}

export function listCities(): City[] {
  return db().query("SELECT * FROM cities ORDER BY name").all() as City[];
}

export function getCityBySlug(slug: string): City | null {
  return (db()
    .query("SELECT * FROM cities WHERE slug = ?")
    .get(slug) ?? null) as City | null;
}

export interface ListEventsParams {
  citySlug: string;
  from: string;
  to: string;
  categories?: string[];
  minRarity?: number;
  bbox?: [number, number, number, number]; // minLng, minLat, maxLng, maxLat
  limit: number;
  offset: number;
}

export function listEvents(params: ListEventsParams): EventRow[] {
  const where: string[] = ["c.slug = ?", "e.starts_at >= ?", "e.starts_at < ?"];
  const args: unknown[] = [params.citySlug, params.from, params.to];

  if (params.categories && params.categories.length > 0) {
    const placeholders = params.categories.map(() => "?").join(",");
    where.push(`e.category IN (${placeholders})`);
    args.push(...params.categories);
  }
  if (typeof params.minRarity === "number") {
    where.push("e.rarity_score >= ?");
    args.push(params.minRarity);
  }
  if (params.bbox) {
    where.push("e.venue_lng >= ? AND e.venue_lat >= ? AND e.venue_lng <= ? AND e.venue_lat <= ?");
    args.push(...params.bbox);
  }

  const sql = `
    SELECT e.*, s.name AS source_name
    FROM events e
    JOIN cities c ON c.id = e.city_id
    JOIN sources s ON s.id = e.source_id
    WHERE ${where.join(" AND ")}
    ORDER BY e.starts_at ASC
    LIMIT ? OFFSET ?
  `;
  args.push(params.limit, params.offset);
  return db().query(sql).all(...(args as never[])) as EventRow[];
}

export function getEventById(id: string): EventRow | null {
  const sql = `
    SELECT e.*, s.name AS source_name
    FROM events e
    JOIN sources s ON s.id = e.source_id
    WHERE e.id = ?
  `;
  return (db().query(sql).get(id) ?? null) as EventRow | null;
}
