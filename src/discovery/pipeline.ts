import { randomUUID } from "node:crypto";
import { db } from "../db/index.ts";
import { fetchIcal } from "./fetchers/ical.ts";
import { fetchJsonApi } from "./fetchers/json-api.ts";
import { scrapeViaLlm } from "./fetchers/scrape-llm.ts";
import { upsertEvents } from "./upsert.ts";
import type {
  CityRecord,
  FetchOpts,
  FetchOutcome,
  SourceConfigBase,
  SourceRecord,
} from "./types.ts";

export interface RunSummary {
  city: string;
  windowFrom: string;
  windowTo: string;
  sources: Array<{
    source_id: string;
    name: string;
    kind: string;
    tier: number;
    status: FetchOutcome["status"];
    found: number;
    inserted: number;
    cost_usd: number;
    model_used: string | null;
    error: string | null;
  }>;
  totals: {
    found: number;
    inserted: number;
    cost_usd: number;
  };
}

export interface RunPipelineOpts {
  citySlug: string;
  windowDays?: number;
  tier?: 0 | 1 | 2 | "all";
  sourceIds?: string[];
}

export async function runPipeline(opts: RunPipelineOpts): Promise<RunSummary> {
  const D = db();
  const city = D.query("SELECT * FROM cities WHERE slug = ?").get(opts.citySlug) as
    | CityRecord
    | null;
  if (!city) throw new Error(`unknown city slug: ${opts.citySlug}`);

  const windowDays = opts.windowDays ?? 14;
  const windowStartsAt = new Date();
  windowStartsAt.setHours(0, 0, 0, 0);
  const windowEndsAt = new Date(windowStartsAt);
  windowEndsAt.setDate(windowEndsAt.getDate() + windowDays);

  const sources = loadSources(city.id, opts);
  const fetchOpts: FetchOpts = { city, windowStartsAt, windowEndsAt };

  const summary: RunSummary = {
    city: city.slug,
    windowFrom: windowStartsAt.toISOString(),
    windowTo: windowEndsAt.toISOString(),
    sources: [],
    totals: { found: 0, inserted: 0, cost_usd: 0 },
  };

  for (const source of sources) {
    const runId = randomUUID();
    const startedAt = new Date().toISOString();
    D.run(
      `INSERT INTO source_runs (id, source_id, started_at, status) VALUES (?, ?, ?, 'running')`,
      [runId, source.id, startedAt],
    );

    const outcome = await runOneSource(source, fetchOpts);
    const upsertResult =
      outcome.status === "ok" && outcome.events.length > 0
        ? upsertEvents(city.id, source.id, outcome.events)
        : { found: outcome.events.length, inserted: 0 };

    const finishedAt = new Date().toISOString();
    D.run(
      `UPDATE source_runs
         SET finished_at = ?, events_found = ?, events_new = ?, tokens_used = ?,
             cost_usd = ?, model_used = ?, status = ?, error = ?
       WHERE id = ?`,
      [
        finishedAt,
        upsertResult.found,
        upsertResult.inserted,
        outcome.tokens_used ?? 0,
        outcome.cost_usd ?? 0,
        outcome.model_used ?? null,
        outcome.status,
        outcome.error ?? null,
        runId,
      ],
    );
    D.run(`UPDATE sources SET last_run_at = ?, last_status = ?, updated_at = ? WHERE id = ?`, [
      finishedAt,
      outcome.status,
      finishedAt,
      source.id,
    ]);

    summary.sources.push({
      source_id: source.id,
      name: source.name,
      kind: source.kind,
      tier: source.tier,
      status: outcome.status,
      found: upsertResult.found,
      inserted: upsertResult.inserted,
      cost_usd: outcome.cost_usd ?? 0,
      model_used: outcome.model_used ?? null,
      error: outcome.error ?? null,
    });
    summary.totals.found += upsertResult.found;
    summary.totals.inserted += upsertResult.inserted;
    summary.totals.cost_usd += outcome.cost_usd ?? 0;
  }

  return summary;
}

function loadSources(cityId: string, opts: RunPipelineOpts): SourceRecord[] {
  const D = db();
  const filters: string[] = ["city_id = ?", "enabled = 1"];
  const args: unknown[] = [cityId];

  if (opts.tier !== "all" && opts.tier !== undefined) {
    filters.push("tier = ?");
    args.push(opts.tier);
  }
  if (opts.sourceIds && opts.sourceIds.length > 0) {
    filters.push(`id IN (${opts.sourceIds.map(() => "?").join(",")})`);
    args.push(...opts.sourceIds);
  }

  return D.query(`SELECT * FROM sources WHERE ${filters.join(" AND ")} ORDER BY tier, name`).all(
    ...(args as never[]),
  ) as SourceRecord[];
}

async function runOneSource(source: SourceRecord, opts: FetchOpts): Promise<FetchOutcome> {
  let cfg: SourceConfigBase = {};
  try {
    cfg = source.config ? (JSON.parse(source.config) as SourceConfigBase) : {};
  } catch {
    // ignore — fetchers handle their own config parsing
  }

  if (source.kind === "feed" && cfg.format === "ical") {
    return decorateOutcome(await fetchIcal(source, opts), cfg);
  }
  if (source.kind === "api" || (source.kind === "feed" && cfg.format === "json")) {
    return decorateOutcome(await fetchJsonApi(source, opts), cfg);
  }
  if (source.kind === "scrape") {
    return decorateOutcome(await scrapeViaLlm(source, opts), cfg);
  }
  if (source.kind === "web_search") {
    return { status: "skipped", events: [], error: "tier 3 deep research is invoked manually" };
  }

  return { status: "error", events: [], error: `unsupported source kind/format: ${source.kind}` };
}

function decorateOutcome(outcome: FetchOutcome, cfg: SourceConfigBase): FetchOutcome {
  if (outcome.status !== "ok") return outcome;
  for (const e of outcome.events) {
    if (cfg.category && !e.category) e.category = cfg.category;
    if (typeof cfg.rarity_score === "number" && e.rarity_score == null) {
      e.rarity_score = cfg.rarity_score;
    }
    if (cfg.default_venue) {
      if (!e.venue_name && cfg.default_venue.name) e.venue_name = cfg.default_venue.name;
      if (!e.venue_address && cfg.default_venue.address) e.venue_address = cfg.default_venue.address;
      if (e.venue_lat == null && cfg.default_venue.lat != null) e.venue_lat = cfg.default_venue.lat;
      if (e.venue_lng == null && cfg.default_venue.lng != null) e.venue_lng = cfg.default_venue.lng;
    }
  }
  return outcome;
}
