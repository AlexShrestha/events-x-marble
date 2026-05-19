import { Hono } from "hono";
import { z } from "zod";
import { getEventById, listEvents, type EventRow } from "../db/queries.ts";

const QuerySchema = z.object({
  city: z.string().min(1),
  from: z.string().min(10),
  to: z.string().min(10),
  category: z.string().optional(),
  min_rarity: z.coerce.number().min(0).max(1).optional(),
  bbox: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  cursor: z.coerce.number().int().nonnegative().default(0),
});

export const events = new Hono();

events.get("/", async (c) => {
  const parsed = QuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid_query", details: parsed.error.flatten() }, 400);
  }
  const q = parsed.data;

  let bbox: [number, number, number, number] | undefined;
  if (q.bbox) {
    const parts = q.bbox.split(",").map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) {
      return c.json({ error: "invalid_bbox", message: "bbox=minLng,minLat,maxLng,maxLat" }, 400);
    }
    bbox = parts as [number, number, number, number];
  }

  const rows = await listEvents({
    citySlug: q.city,
    from: q.from,
    to: q.to,
    ...(q.category ? { categories: q.category.split(",").map((s) => s.trim()).filter(Boolean) } : {}),
    ...(q.min_rarity !== undefined ? { minRarity: q.min_rarity } : {}),
    ...(bbox ? { bbox } : {}),
    limit: q.limit + 1, // fetch one extra to detect next page
    offset: q.cursor,
  });

  const hasMore = rows.length > q.limit;
  const slice = hasMore ? rows.slice(0, q.limit) : rows;

  return c.json({
    events: slice.map(serializeEvent),
    next_cursor: hasMore ? q.cursor + q.limit : null,
  });
});

events.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row = await getEventById(id);
  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json({ event: serializeEvent(row) });
});

function serializeEvent(r: EventRow): Record<string, unknown> {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    venue: r.venue_name
      ? {
          name: r.venue_name,
          address: r.venue_address,
          location:
            r.venue_lat != null && r.venue_lng != null
              ? [r.venue_lng, r.venue_lat]
              : null,
        }
      : null,
    url: r.url,
    image_url: r.image_url,
    category: r.category,
    tags: safeJsonParse<string[]>(r.tags, []),
    rarity_score: r.rarity_score,
    confidence: r.confidence,
    source: r.source_name,
  };
}

function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
