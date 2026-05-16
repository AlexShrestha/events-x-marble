import ICAL from "ical.js";
import type { EventCandidate, FetchOpts, FetchOutcome, SourceRecord } from "../types.ts";

const USER_AGENT = "events-x-marble/0.1 (+contact: alex.shrestha88@gmail.com)";
const FETCH_TIMEOUT_MS = 30_000;

export async function fetchIcal(
  source: SourceRecord,
  opts: FetchOpts,
): Promise<FetchOutcome> {
  let text: string;
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/calendar, */*;q=0.5" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { status: "error", events: [], error: `HTTP ${res.status} ${res.statusText}` };
    }
    text = await res.text();
  } catch (e) {
    return { status: "error", events: [], error: errMessage(e) };
  }

  let jcal: ConstructorParameters<typeof ICAL.Component>[0];
  try {
    jcal = ICAL.parse(text) as ConstructorParameters<typeof ICAL.Component>[0];
  } catch (e) {
    return { status: "error", events: [], error: `iCal parse failed: ${errMessage(e)}` };
  }

  const events: EventCandidate[] = [];
  try {
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");
    const horizonStart = opts.windowStartsAt.getTime();
    const horizonEnd = opts.windowEndsAt.getTime();

    for (const ve of vevents) {
      const event = new ICAL.Event(ve);
      if (!event.startDate) continue;

      if (event.isRecurring()) {
        const iterator = event.iterator();
        // Hard cap on recurrence expansions per source to keep cost bounded.
        for (let i = 0; i < 200; i++) {
          const next = iterator.next();
          if (!next) break;
          const startMs = next.toJSDate().getTime();
          if (startMs > horizonEnd) break;
          if (startMs < horizonStart) continue;
          try {
            const occ = event.getOccurrenceDetails(next);
            events.push(mapIcalEvent(event, occ.startDate, occ.endDate, source.url));
          } catch {
            // skip occurrence that fails to expand
          }
        }
      } else {
        const startMs = event.startDate.toJSDate().getTime();
        if (startMs < horizonStart || startMs > horizonEnd) continue;
        events.push(mapIcalEvent(event, event.startDate, event.endDate, source.url));
      }
    }
  } catch (e) {
    return { status: "error", events, error: `iCal walk failed: ${errMessage(e)}` };
  }

  return { status: "ok", events };
}

function mapIcalEvent(
  event: any,
  start: { toJSDate(): Date },
  end: { toJSDate(): Date } | null | undefined,
  sourceUrl: string,
): EventCandidate {
  const title = (event.summary ?? "Untitled").toString().trim();
  return {
    title: title || "Untitled",
    description: event.description ? String(event.description).trim() : null,
    starts_at: start.toJSDate().toISOString(),
    ends_at: end ? end.toJSDate().toISOString() : null,
    venue_name: event.location ? String(event.location).trim() : null,
    url: sourceUrl,
    confidence: 1,
  };
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
