import type {
  EventCandidate,
  FetchOpts,
  FetchOutcome,
  SourceRecord,
} from "../types.ts";

import { getUserAgent } from "../../lib/user-agent.ts";
const USER_AGENT = getUserAgent();
const FETCH_TIMEOUT_MS = 30_000;
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 5; // 5 × 50 = 250 events per run

interface GraphqlSourceConfig {
  format: "graphql";
  provider: "ra"; // only RA supported in v1
  area_id?: number;
  page_size?: number;
  max_pages?: number;
  rarity_score?: number;
  category?: string;
}

interface RaEventListingResponse {
  data?: {
    eventListings?: {
      totalResults?: number;
      data?: Array<{
        event?: {
          id?: string;
          title?: string | null;
          date?: string | null;
          startTime?: string | null;
          endTime?: string | null;
          venue?: { name?: string | null; address?: string | null } | null;
          contentUrl?: string | null;
          images?: Array<{ filename?: string | null }> | null;
        };
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
}

/**
 * GraphQL fetcher — currently specialized for Resident Advisor (ra.co/graphql).
 * RA's API is unauthenticated; just needs Content-Type, Referer, and User-Agent.
 */
export async function fetchGraphqlApi(
  source: SourceRecord,
  opts: FetchOpts,
): Promise<FetchOutcome> {
  let cfg: GraphqlSourceConfig;
  try {
    cfg = JSON.parse(source.config) as GraphqlSourceConfig;
  } catch (e) {
    return {
      status: "error",
      events: [],
      error: `bad config json: ${errMsg(e)}`,
    };
  }

  if (cfg.format !== "graphql" || cfg.provider !== "ra") {
    return {
      status: "error",
      events: [],
      error: `unsupported graphql provider: ${cfg.provider ?? "unset"}`,
    };
  }
  if (typeof cfg.area_id !== "number") {
    return { status: "error", events: [], error: "missing area_id in config" };
  }

  const pageSize = cfg.page_size ?? DEFAULT_PAGE_SIZE;
  const maxPages = cfg.max_pages ?? DEFAULT_MAX_PAGES;
  const fromDate = opts.windowStartsAt.toISOString().slice(0, 10);
  const toDate = opts.windowEndsAt.toISOString().slice(0, 10);

  const allEvents: EventCandidate[] = [];
  let totalResults = 0;

  for (let page = 1; page <= maxPages; page++) {
    const body = JSON.stringify({
      query: `{
        eventListings(filters: {areas: {eq: ${cfg.area_id}}, listingDate: {gte: "${fromDate}", lte: "${toDate}"}},
                      pageSize: ${pageSize}, page: ${page}) {
          totalResults
          data {
            event {
              id title date startTime endTime
              venue { name address }
              contentUrl
              images { filename }
            }
          }
        }
      }`,
    });

    let res: Response;
    try {
      res = await fetch(source.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://ra.co/",
          "User-Agent": USER_AGENT,
        },
        body,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (e) {
      return { status: "error", events: allEvents, error: `network: ${errMsg(e)}` };
    }

    if (!res.ok) {
      return {
        status: "error",
        events: allEvents,
        error: `HTTP ${res.status} on page ${page}`,
      };
    }

    let json: RaEventListingResponse;
    try {
      json = (await res.json()) as RaEventListingResponse;
    } catch (e) {
      return { status: "error", events: allEvents, error: `parse: ${errMsg(e)}` };
    }

    if (json.errors && json.errors.length > 0) {
      return {
        status: "error",
        events: allEvents,
        error: `graphql errors: ${json.errors.map((e) => e.message).join("; ")}`,
      };
    }

    const listings = json.data?.eventListings?.data ?? [];
    totalResults = json.data?.eventListings?.totalResults ?? totalResults;

    for (const wrapper of listings) {
      const ev = wrapper.event;
      if (!ev || !ev.id || !ev.title) continue;
      const startMs = parseRaTimestamp(ev.startTime ?? ev.date);
      if (!Number.isFinite(startMs)) continue;
      if (startMs < opts.windowStartsAt.getTime() || startMs > opts.windowEndsAt.getTime()) continue;
      const endMs = ev.endTime ? parseRaTimestamp(ev.endTime) : NaN;
      allEvents.push({
        title: ev.title.trim(),
        starts_at: new Date(startMs).toISOString(),
        ends_at: Number.isFinite(endMs) ? new Date(endMs).toISOString() : null,
        venue_name: ev.venue?.name ?? null,
        venue_address: ev.venue?.address ?? null,
        url: ev.contentUrl ? `https://ra.co${ev.contentUrl}` : null,
        image_url: ev.images?.[0]?.filename ?? null,
        category: cfg.category ?? "nightlife",
        rarity_score: cfg.rarity_score ?? 0.3,
        confidence: 1,
        raw_extract: { ra_event_id: ev.id, ra_date_raw: ev.date ?? null },
      });
    }

    // Stop early if we've fetched all available events.
    if (listings.length < pageSize) break;
    if (page * pageSize >= totalResults) break;
  }

  return {
    status: "ok",
    events: allEvents,
    tokens_used: 0,
    cost_usd: 0,
    model_used: "ra-graphql",
  };
}

/** RA returns ISO-ish strings with millis but NO timezone suffix (treat as venue-local). */
function parseRaTimestamp(s: string | null | undefined): number {
  if (!s) return NaN;
  // Append Z if no tz info, so Date.parse treats it as UTC. (RA's times are local-naive;
  // for v1 we don't correct; the city-tz display in the UI will handle conversion display.)
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/.test(s);
  return Date.parse(hasTz ? s : `${s}Z`);
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
