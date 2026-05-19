import { randomUUID } from "node:crypto";
import { execBatch } from "../db/index.ts";
import { dedupHash } from "../lib/dedup.ts";
import type { EventCandidate } from "./types.ts";

export interface UpsertResult {
  found: number;
  inserted: number;
}

const INSERT_SQL = `
  INSERT OR IGNORE INTO events (
    id, city_id, source_id, title, description, starts_at, ends_at,
    venue_name, venue_address, venue_lat, venue_lng, url, image_url,
    category, tags, rarity_score, confidence, dedup_hash, raw_extract
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export async function upsertEvents(
  cityId: string,
  sourceId: string,
  candidates: EventCandidate[],
): Promise<UpsertResult> {
  const stmts: Array<{ sql: string; args: Array<string | number | null> }> = [];
  for (const c of candidates) {
    if (!c.title || !c.starts_at) continue;
    const hash = dedupHash({
      title: c.title,
      starts_at: c.starts_at,
      venue_name: c.venue_name ?? null,
    });
    stmts.push({
      sql: INSERT_SQL,
      args: [
        randomUUID(),
        cityId,
        sourceId,
        c.title,
        c.description ?? null,
        c.starts_at,
        c.ends_at ?? null,
        c.venue_name ?? null,
        c.venue_address ?? null,
        c.venue_lat ?? null,
        c.venue_lng ?? null,
        c.url ?? null,
        c.image_url ?? null,
        c.category ?? null,
        JSON.stringify(c.tags ?? []),
        c.rarity_score ?? 0,
        c.confidence ?? 1,
        hash,
        c.raw_extract ? JSON.stringify(c.raw_extract) : null,
      ],
    });
  }

  const inserted = await execBatch(stmts);
  return { found: candidates.length, inserted };
}
