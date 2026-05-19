/**
 * Shared RFC 5545 ICS helpers — used by both the public /calendar.ics route
 * and the personalized /me/calendar.ics route.
 */

/** Escape special chars in TEXT values: \, ; , COMMA, \n */
export function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold lines at 75 octets (RFC 5545 §3.1). */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let remaining = line;
  let first = true;
  while (remaining.length > 0) {
    const maxContent = first ? 75 : 74;
    const prefix = first ? "" : " ";
    if (enc.encode(prefix + remaining).length <= maxContent) {
      parts.push(prefix + remaining);
      break;
    }
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
    if (lo === 0) lo = 1;
    parts.push(prefix + remaining.slice(0, lo));
    remaining = remaining.slice(lo);
    first = false;
  }
  return parts.join("\r\n");
}

/** Format a JS Date to ICS datetime string in UTC: 20060102T150405Z */
export function toIcsUtc(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  );
}

/** Convert UTC ISO string to ICS UTC-anchored value. */
export function toIcsLocal(isoUtc: string): string {
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return toIcsUtc(new Date());
  return toIcsUtc(d);
}

/** Emit a single ICS property line, folded */
export function prop(name: string, value: string, params = ""): string {
  const key = params ? `${name};${params}` : name;
  return foldLine(`${key}:${value}`);
}

/** VTIMEZONE blocks per city. Extend as the cities table grows. */
const VTIMEZONES: Record<string, string> = {
  "Europe/Madrid": [
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
  ].join("\r\n"),
};

/** City slug → IANA timezone. Falls back to Europe/Madrid (Barcelona default). */
const CITY_TZ: Record<string, string> = {
  barcelona: "Europe/Madrid",
  madrid: "Europe/Madrid",
};

export function tzForCity(citySlug: string): string {
  return CITY_TZ[citySlug.toLowerCase()] ?? "Europe/Madrid";
}

export function vtimezoneBlock(tzid: string): string {
  return VTIMEZONES[tzid] ?? VTIMEZONES["Europe/Madrid"]!;
}
