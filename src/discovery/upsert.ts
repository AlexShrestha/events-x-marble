import { randomUUID } from "node:crypto";
import { db } from "../db/index.ts";
import { dedupHash } from "../lib/dedup.ts";
import type { EventCandidate } from "./types.ts";

export interface UpsertResult {
  found: number;
  inserted: number;
}

export function upsertEvents(
  cityId: string,
  sourceId: string,
  candidates: EventCandidate[],
): UpsertResult {
  const D = db();
  const insert = D.prepare(`
    INSERT OR IGNORE INTO events (
      id, city_id, source_id, title, description, starts_at, ends_at,
      venue_name, venue_address, venue_lat, venue_lng, url, image_url,
      category, tags, rarity_score, confidence, dedup_hash, raw_extract
    ) VALUES ($id, $city_id, $source_id, $title, $description, $starts_at, $ends_at,
      $venue_name, $venue_address, $venue_lat, $venue_lng, $url, $image_url,
      $category, $tags, $rarity_score, $confidence, $dedup_hash, $raw_extract)
  `);

  let inserted = 0;
  const tx = D.transaction((rows: EventCandidate[]) => {
    for (const c of rows) {
      if (!c.title || !c.starts_at) continue;
      const hash = dedupHash({
        title: c.title,
        starts_at: c.starts_at,
        venue_name: c.venue_name ?? null,
      });
      const result = insert.run({
        $id: randomUUID(),
        $city_id: cityId,
        $source_id: sourceId,
        $title: c.title,
        $description: c.description ?? null,
        $starts_at: c.starts_at,
        $ends_at: c.ends_at ?? null,
        $venue_name: c.venue_name ?? null,
        $venue_address: c.venue_address ?? null,
        $venue_lat: c.venue_lat ?? null,
        $venue_lng: c.venue_lng ?? null,
        $url: c.url ?? null,
        $image_url: c.image_url ?? null,
        $category: c.category ?? null,
        $tags: JSON.stringify(c.tags ?? []),
        $rarity_score: c.rarity_score ?? 0,
        $confidence: c.confidence ?? 1,
        $dedup_hash: hash,
        $raw_extract: c.raw_extract ? JSON.stringify(c.raw_extract) : null,
      });
      if (result.changes > 0) inserted++;
    }
  });
  tx(candidates);

  return { found: candidates.length, inserted };
}
