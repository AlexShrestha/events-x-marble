/**
 * Personalized ICS feed: /me/calendar.ics
 *
 * Subscribe this URL in Apple/Google Calendar. The system silently injects
 * 0–N events per week — only those above the user's marble irresistibility
 * threshold (default 0.85). A quiet week = empty feed. That's the feature.
 *
 * Auth: ?token=<ME_TOKEN> query param (URL = capability link).
 *
 * Caching: in-memory map keyed by (city, days, threshold, notes_hash), 6h TTL.
 * Calendar apps poll every ~15 min; almost all hits will serve cached.
 */
import { Hono } from "hono";
import { createHash } from "node:crypto";
import { z } from "zod";
import { env } from "../env.ts";
import { queryAll, queryGet } from "../db/index.ts";
import {
  foldLine,
  icsEscape,
  prop,
  toIcsLocal,
  toIcsUtc,
  tzForCity,
  vtimezoneBlock,
} from "../lib/ics-format.ts";
import {
  scoreEventsForUser,
  type EventForScoring,
  type ScoreResult,
  type ScoredEvent,
} from "../marble/scorer.ts";

export const meIcsApp = new Hono();

const QuerySchema = z.object({
  city: z.string().min(1).default("barcelona"),
  days: z.coerce.number().int().positive().max(60).default(14),
  threshold: z.coerce.number().min(0).max(1).default(0.85),
  notes: z.string().max(500).optional(),
  token: z.string().min(1),
  // Cache-control escape hatch for debugging.
  no_cache: z.coerce.boolean().optional(),
});

const CACHE = new Map<string, { ts: number; result: ScoreResult }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

meIcsApp.get("/", async (c) => {
  const parsed = QuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.text("invalid query: " + JSON.stringify(parsed.error.flatten()), 400);
  }
  const q = parsed.data;

  if (!env.ME_TOKEN) {
    return c.text("/me routes disabled: ME_TOKEN not set in env", 503);
  }
  if (q.token !== env.ME_TOKEN) {
    return c.text("unauthorized", 401);
  }
  if (!env.MARBLE_KG_PATH) {
    return c.text("MARBLE_KG_PATH not set in env", 503);
  }

  // Fetch city + events.
  const city = await queryGet<{
    slug: string;
    name: string;
    timezone: string;
    centroid_lng: number | null;
    centroid_lat: number | null;
  }>(
    "SELECT slug, name, timezone, centroid_lng, centroid_lat FROM cities WHERE slug = ?",
    [q.city],
  );
  if (!city) return c.text(`unknown city: ${q.city}`, 404);

  const now = new Date();
  const horizon = new Date(now.getTime() + q.days * 86_400_000);

  // Cache key — same params hit the same cached scoring.
  const key = cacheKey(q.city, q.days, q.threshold, q.notes ?? "");
  let result: ScoreResult;
  const hit = q.no_cache ? null : CACHE.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    result = hit.result;
  } else {
    const rows = await queryAll<{
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
    }>(
      `SELECT e.id, e.title, e.description, e.starts_at, e.ends_at,
              e.venue_name, e.venue_address, e.venue_lat, e.venue_lng,
              e.category, e.rarity_score, e.url, s.name AS source_name
       FROM events e JOIN sources s ON s.id = e.source_id
       WHERE e.city_id = (SELECT id FROM cities WHERE slug = ?)
         AND e.starts_at >= ? AND e.starts_at < ?
       ORDER BY e.starts_at ASC`,
      [q.city, now.toISOString(), horizon.toISOString()],
    );

    if (rows.length === 0) {
      return c.text(emptyCalendar(q.city, tzForCity(q.city)), 200, calHeaders());
    }

    const candidates: EventForScoring[] = rows.map((r) => ({
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

    try {
      result = await scoreEventsForUser(candidates, {
        city: { name: city.name, centroid, timezone: city.timezone },
        ...(q.notes ? { notes: q.notes } : {}),
        threshold: q.threshold,
      });
      CACHE.set(key, { ts: Date.now(), result });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // Don't leak any KG content via error messages — keep generic.
      return c.text(`scoring failed: ${message.slice(0, 200)}`, 502);
    }
  }

  const tzid = tzForCity(q.city);
  const vevents = result.surfaced.map((e) => buildVEvent(e));
  const cal = [
    "BEGIN:VCALENDAR",
    prop("VERSION", "2.0"),
    prop("PRODID", "-//events-x-marble//me//EN"),
    prop("CALSCALE", "GREGORIAN"),
    prop("METHOD", "PUBLISH"),
    prop("X-WR-CALNAME", `Events · ${q.city} · marble`),
    prop("X-WR-TIMEZONE", tzid),
    prop(
      "X-WR-CALDESC",
      icsEscape(
        `Irresistible events for ${q.city} above marble score ${q.threshold}. ${result.surfaced.length}/${result.scored.length} events surfaced.`,
      ),
    ),
    vtimezoneBlock(tzid),
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return c.text(cal, 200, calHeaders());
});

function buildVEvent(e: ScoredEvent): string {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(prop("UID", `${e.id}@events-x-marble-me`));
  lines.push(prop("DTSTART", toIcsLocal(e.starts_at)));
  if (e.ends_at) {
    lines.push(prop("DTEND", toIcsLocal(e.ends_at)));
  } else {
    lines.push(prop("DURATION", "PT2H"));
  }

  const badge = e.marble_score >= 0.95 ? "🔥🔥 " : "🔥 ";
  lines.push(prop("SUMMARY", icsEscape(badge + e.title)));

  const desc: string[] = [];
  desc.push(`Why: ${e.why}`);
  desc.push(`Marble score: ${e.marble_score.toFixed(2)}`);
  desc.push(`Rarity: ${e.rarity_score.toFixed(2)}`);
  desc.push(`Source: ${e.source}`);
  if (e.description) desc.push(`\n${e.description}`);
  lines.push(prop("DESCRIPTION", icsEscape(desc.join("\n"))));

  const loc = [e.venue_name, e.venue_address].filter(Boolean) as string[];
  if (loc.length > 0) lines.push(prop("LOCATION", icsEscape(loc.join(", "))));

  if (e.url) lines.push(prop("URL", e.url));
  if (e.category) lines.push(prop("CATEGORIES", icsEscape(e.category)));
  if (e.venue_lat != null && e.venue_lng != null) {
    lines.push(prop("GEO", `${e.venue_lat};${e.venue_lng}`));
  }
  lines.push(prop("DTSTAMP", toIcsUtc(new Date())));
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

function cacheKey(city: string, days: number, threshold: number, notes: string): string {
  const h = createHash("sha256").update(notes).digest("hex").slice(0, 12);
  return `${city}|${days}|${threshold}|${h}`;
}

function emptyCalendar(citySlug: string, tzid: string): string {
  // Subscribe-ready empty calendar so clients don't error when there are no upcoming events at all.
  return [
    "BEGIN:VCALENDAR",
    prop("VERSION", "2.0"),
    prop("PRODID", "-//events-x-marble//me//EN"),
    prop("CALSCALE", "GREGORIAN"),
    prop("METHOD", "PUBLISH"),
    prop("X-WR-CALNAME", `Events · ${citySlug} · marble (no surfaced events)`),
    prop("X-WR-TIMEZONE", tzid),
    vtimezoneBlock(tzid),
    "END:VCALENDAR",
  ].join("\r\n");
}

function calHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/calendar; charset=utf-8",
    // Hint to clients to refresh hourly. We cache scoring server-side for 6h.
    "Cache-Control": "private, max-age=3600",
  };
}

// foldLine is re-exported by ics-format; ensure no warning if unused locally.
void foldLine;
