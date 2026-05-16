import { Hono } from "hono";
import { z } from "zod";
import { listEvents, type EventRow } from "../db/queries.ts";

export const icsApp = new Hono();

// RFC 5545 helpers -----------------------------------------------------------

/** Escape special chars in TEXT values: \, ; , COMMA, \n */
function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold lines at 75 octets (RFC 5545 §3.1).
 *  First segment: max 75 bytes. Continuation segments: max 74 bytes of content
 *  (plus 1-byte leading SPACE = 75 bytes on the wire).
 */
function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const maxContent = first ? 75 : 74;
    const prefix = first ? "" : " ";
    if (enc.encode(prefix + remaining).length <= maxContent + (first ? 0 : 0)) {
      // fits entirely
      parts.push(prefix + remaining);
      break;
    }
    // Binary-search the largest char-count that fits within maxContent bytes
    let lo = 0;
    let hi = remaining.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (enc.encode(prefix + remaining.slice(0, mid)).length <= maxContent) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    if (lo === 0) lo = 1; // always advance at least one char
    parts.push(prefix + remaining.slice(0, lo));
    remaining = remaining.slice(lo);
    first = false;
  }
  return parts.join("\r\n");
}

/** Format a JS Date to ICS datetime string in UTC: 20060102T150405Z */
function toIcsUtc(date: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  );
}

/** Emit a single ICS property line, folded */
function prop(name: string, value: string, params = ""): string {
  const key = params ? `${name};${params}` : name;
  return foldLine(`${key}:${value}`);
}

// VTIMEZONE for Europe/Madrid (CET/CEST, stable rules since 1996) ------------
const VTIMEZONE_MADRID = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Madrid",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
].join("\r\n");

// City → IANA timezone mapping (expand as needed) ----------------------------
const CITY_TZ: Record<string, string> = {
  barcelona: "Europe/Madrid",
  madrid: "Europe/Madrid",
};
const DEFAULT_TZ = "Europe/Madrid";

function tzForCity(citySlug: string): string {
  return CITY_TZ[citySlug.toLowerCase()] ?? DEFAULT_TZ;
}

/** Convert UTC ISO string to localised ICS datetime: 20060102T150405 */
function toIcsLocal(isoUtc: string, _tzid: string): string {
  // We store starts_at as ISO UTC; format as floating local using TZID param
  // The date is already stored without timezone offset in the DB —
  // treat it as a wall-clock time and emit with TZID.
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return toIcsUtc(new Date());
  // Emit as UTC-anchored value — simplest correct approach
  return toIcsUtc(d);
}

function buildVEvent(ev: EventRow, tzid: string): string {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(prop("UID", `${ev.id}@events-x-marble`));

  const startsAt = new Date(ev.starts_at);
  lines.push(prop("DTSTART", toIcsLocal(ev.starts_at, tzid)));

  if (ev.ends_at) {
    lines.push(prop("DTEND", toIcsLocal(ev.ends_at, tzid)));
  } else {
    lines.push(prop("DURATION", "PT2H"));
  }

  const summaryPrefix = ev.rarity_score >= 0.7 ? "[rare] " : "";
  lines.push(prop("SUMMARY", icsEscape(summaryPrefix + ev.title)));

  // DESCRIPTION
  const descParts: string[] = [];
  if (ev.description) descParts.push(ev.description);
  descParts.push(`Source: ${ev.source_name}`);
  descParts.push(`Rarity: ${ev.rarity_score.toFixed(2)}`);
  lines.push(prop("DESCRIPTION", icsEscape(descParts.join("\n"))));

  // LOCATION
  const locParts = [ev.venue_name, ev.venue_address].filter(Boolean) as string[];
  if (locParts.length > 0) {
    lines.push(prop("LOCATION", icsEscape(locParts.join(", "))));
  }

  if (ev.url) {
    lines.push(prop("URL", ev.url));
  }

  if (ev.category) {
    lines.push(prop("CATEGORIES", icsEscape(ev.category)));
  }

  if (ev.venue_lat != null && ev.venue_lng != null) {
    lines.push(prop("GEO", `${ev.venue_lat};${ev.venue_lng}`));
  }

  lines.push(prop("DTSTAMP", toIcsUtc(new Date())));
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

// Query schema mirrors /api/v1/events -----------------------------------------
const IcsQuerySchema = z.object({
  city: z.string().min(1).default("barcelona"),
  from: z.string().optional(),
  to: z.string().optional(),
  days: z.coerce.number().int().positive().max(365).default(30),
  category: z.string().optional(),
  min_rarity: z.coerce.number().min(0).max(1).optional(),
  bbox: z.string().optional(),
});

icsApp.get("/", (c) => {
  const parsed = IcsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.text("invalid query: " + JSON.stringify(parsed.error.flatten()), 400);
  }
  const q = parsed.data;

  // Date window
  const now = new Date();
  const fromDate = q.from ? new Date(`${q.from}T00:00:00.000Z`) : now;
  const toDate = q.to
    ? new Date(`${q.to}T23:59:59.999Z`)
    : new Date(fromDate.getTime() + q.days * 86_400_000);

  const from = fromDate.toISOString();
  const to = toDate.toISOString();

  let bbox: [number, number, number, number] | undefined;
  if (q.bbox) {
    const parts = q.bbox.split(",").map(Number);
    if (parts.length === 4 && !parts.some(Number.isNaN)) {
      bbox = parts as [number, number, number, number];
    }
  }

  const rows = listEvents({
    citySlug: q.city,
    from,
    to,
    categories: q.category?.split(",").map((s) => s.trim()).filter(Boolean),
    minRarity: q.min_rarity,
    bbox,
    limit: 2000,
    offset: 0,
  });

  const tzid = tzForCity(q.city);

  const vevents = rows.map((ev) => buildVEvent(ev, tzid));

  const cal = [
    "BEGIN:VCALENDAR",
    prop("VERSION", "2.0"),
    prop("PRODID", "-//events-x-marble//EN"),
    prop("CALSCALE", "GREGORIAN"),
    prop("METHOD", "PUBLISH"),
    prop("X-WR-CALNAME", `Events · ${q.city}`),
    prop("X-WR-TIMEZONE", tzid),
    VTIMEZONE_MADRID,
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return c.text(cal, 200, {
    "Content-Type": "text/calendar; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
});
