import type {
  EventCandidate,
  FetchOpts,
  FetchOutcome,
  JsonSourceConfig,
  SourceRecord,
} from "../types.ts";

const USER_AGENT = "events-x-marble/0.1 (+contact: alex.shrestha88@gmail.com)";
const FETCH_TIMEOUT_MS = 30_000;

export async function fetchJsonApi(
  source: SourceRecord,
  opts: FetchOpts,
): Promise<FetchOutcome> {
  let cfg: JsonSourceConfig;
  try {
    cfg = JSON.parse(source.config) as JsonSourceConfig;
    if (cfg.format !== "json" || !cfg.items_path || !cfg.map) {
      return {
        status: "error",
        events: [],
        error: "json source config requires {format:'json', items_path, map}",
      };
    }
  } catch (e) {
    return { status: "error", events: [], error: `bad config json: ${errMessage(e)}` };
  }

  const url = buildUrlWithQuery(source.url, cfg.query);
  let body: unknown;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        ...(cfg.headers ?? {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { status: "error", events: [], error: `HTTP ${res.status} ${res.statusText}` };
    }
    body = await res.json();
  } catch (e) {
    return { status: "error", events: [], error: errMessage(e) };
  }

  const items = getPath(body, cfg.items_path);
  if (!Array.isArray(items)) {
    return {
      status: "error",
      events: [],
      error: `items_path '${cfg.items_path}' did not yield an array`,
    };
  }

  const horizonStart = opts.windowStartsAt.getTime();
  const horizonEnd = opts.windowEndsAt.getTime();
  const events: EventCandidate[] = [];

  for (const item of items) {
    const title = readMapped(item, cfg.map.title);
    const starts = readMapped(item, cfg.map.starts_at);
    if (!title || !starts) continue;
    const startMs = Date.parse(starts);
    if (!Number.isFinite(startMs)) continue;
    if (startMs < horizonStart || startMs > horizonEnd) continue;

    const endsRaw = cfg.map.ends_at ? readMapped(item, cfg.map.ends_at) : null;
    const candidate: EventCandidate = {
      title: title.trim(),
      starts_at: new Date(startMs).toISOString(),
      ends_at: endsRaw && Number.isFinite(Date.parse(endsRaw))
        ? new Date(Date.parse(endsRaw)).toISOString()
        : null,
      description: cfg.map.description ? readMapped(item, cfg.map.description) : null,
      venue_name:
        (cfg.map.venue_name ? readMapped(item, cfg.map.venue_name) : null) ??
        cfg.default_venue?.name ??
        null,
      venue_address:
        (cfg.map.venue_address ? readMapped(item, cfg.map.venue_address) : null) ??
        cfg.default_venue?.address ??
        null,
      venue_lat: cfg.default_venue?.lat ?? null,
      venue_lng: cfg.default_venue?.lng ?? null,
      url: cfg.map.url ? readMapped(item, cfg.map.url) : source.url,
      image_url: cfg.map.image_url ? readMapped(item, cfg.map.image_url) : null,
      category: cfg.category ?? null,
      rarity_score: cfg.rarity_score ?? 0.3,
      confidence: 1,
      raw_extract: null,
    };
    events.push(candidate);
  }

  return { status: "ok", events };
}

function buildUrlWithQuery(base: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return base;
  const u = new URL(base);
  for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
  return u.toString();
}

function getPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function readMapped(item: unknown, mapValue: string): string | null {
  const v = getPath(item, mapValue);
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
