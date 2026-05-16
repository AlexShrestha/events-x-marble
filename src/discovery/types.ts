export interface EventCandidate {
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_lat?: number | null;
  venue_lng?: number | null;
  url?: string | null;
  image_url?: string | null;
  category?: string | null;
  tags?: string[];
  rarity_score?: number;
  confidence?: number;
  raw_extract?: Record<string, unknown> | null;
}

export type SourceKind = "feed" | "api" | "scrape" | "web_search";
export type SourceStatus = "running" | "ok" | "rate_limited" | "error" | "skipped";

export interface SourceRecord {
  id: string;
  city_id: string;
  kind: SourceKind;
  name: string;
  url: string;
  config: string;
  tier: number;
  enabled: number;
}

export interface CityRecord {
  id: string;
  slug: string;
  name: string;
  country_code: string;
  timezone: string;
}

export interface FetchOpts {
  city: CityRecord;
  windowStartsAt: Date;
  windowEndsAt: Date;
}

export interface FetchOutcome {
  status: Exclude<SourceStatus, "running">;
  events: EventCandidate[];
  tokens_used?: number;
  cost_usd?: number;
  model_used?: string;
  error?: string;
}

export interface SourceConfigBase {
  format?: "ical" | "rss" | "json";
  rarity_score?: number;
  category?: string;
  default_venue?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
}

export interface JsonSourceConfig extends SourceConfigBase {
  format: "json";
  // dot-path into the response body to reach an array of items
  items_path: string;
  // mapping config — each key is a target field, value is a dot-path or template
  map: {
    title: string;
    starts_at: string;
    ends_at?: string;
    description?: string;
    venue_name?: string;
    venue_address?: string;
    url?: string;
    image_url?: string;
  };
  query?: Record<string, string>;
  headers?: Record<string, string>;
}
