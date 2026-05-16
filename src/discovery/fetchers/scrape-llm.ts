import { z } from "zod";
import { fetchAsMarkdown } from "../../lib/fetch.ts";
import { extractJson } from "../../lib/llm.ts";
import type {
  EventCandidate,
  FetchOpts,
  FetchOutcome,
  SourceConfigBase,
  SourceRecord,
} from "../types.ts";

// Schema that the LLM is asked to return. Keep strict.
const EventDtoSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  starts_at: z.string().min(10).max(40),
  ends_at: z.string().min(10).max(40).optional().nullable(),
  venue_name: z.string().max(200).optional().nullable(),
  venue_address: z.string().max(300).optional().nullable(),
  url: z.string().url().optional().nullable(),
  category: z.string().max(40).optional().nullable(),
});

const ResultSchema = z.object({
  events: z.array(EventDtoSchema).max(60),
});

const MAX_INPUT_CHARS = 16_000;

export async function scrapeViaLlm(
  source: SourceRecord,
  opts: FetchOpts,
): Promise<FetchOutcome> {
  const cfg = parseConfig(source.config);

  const fetched = await fetchAsMarkdown(source.url);
  if (!fetched.ok) {
    return { status: "error", events: [], error: `fetch failed: ${fetched.error}` };
  }

  const content = fetched.markdown.length > MAX_INPUT_CHARS
    ? fetched.markdown.slice(0, MAX_INPUT_CHARS)
    : fetched.markdown;

  const today = new Date().toISOString().slice(0, 10);
  const windowFrom = opts.windowStartsAt.toISOString().slice(0, 10);
  const windowTo = opts.windowEndsAt.toISOString().slice(0, 10);

  const systemPrompt = [
    "You extract upcoming events from event-listing web pages.",
    `Today is ${today}. The reader is in city: ${opts.city.name} (timezone: ${opts.city.timezone}).`,
    `Only return events between ${windowFrom} and ${windowTo} (inclusive).`,
    "Resolve relative dates ('next Friday', 'tonight', 'sábado') using today's date and the city timezone.",
    "Output ONLY a JSON object, no prose, no markdown fences. Schema:",
    '{"events":[{"title":string,"description":string|null,"starts_at":ISO 8601 with timezone,"ends_at":ISO 8601 or null,"venue_name":string|null,"venue_address":string|null,"url":string|null,"category":string|null}]}',
    "If you find nothing, return {\"events\":[]}.",
    "Never invent dates. If the date is ambiguous or missing, skip that event.",
  ].join("\n");

  const userMessage = [
    `Source URL: ${source.url}`,
    `Source name: ${source.name}`,
    "",
    "Page content (already cleaned to markdown/text):",
    "---",
    content,
    "---",
  ].join("\n");

  const result = await extractJson({
    systemPrompt,
    userMessage,
    schema: ResultSchema,
    maxTokens: 1200,
  });

  if (!result.ok || !result.parsed) {
    return {
      status: "rate_limited",
      events: [],
      tokens_used: result.tokens_used,
      cost_usd: result.cost_usd,
      model_used: result.model_used ?? undefined,
      error: result.error ?? "no usable response from any free model",
    };
  }

  const horizonStart = opts.windowStartsAt.getTime();
  const horizonEnd = opts.windowEndsAt.getTime();
  const events: EventCandidate[] = [];

  for (const dto of result.parsed.events) {
    const startMs = Date.parse(dto.starts_at);
    if (!Number.isFinite(startMs)) continue;
    if (startMs < horizonStart || startMs > horizonEnd) continue;
    const endMs = dto.ends_at ? Date.parse(dto.ends_at) : NaN;
    events.push({
      title: dto.title.trim(),
      description: dto.description ?? null,
      starts_at: new Date(startMs).toISOString(),
      ends_at: Number.isFinite(endMs) ? new Date(endMs).toISOString() : null,
      venue_name: dto.venue_name ?? cfg.default_venue?.name ?? null,
      venue_address: dto.venue_address ?? cfg.default_venue?.address ?? null,
      venue_lat: cfg.default_venue?.lat ?? null,
      venue_lng: cfg.default_venue?.lng ?? null,
      url: dto.url ?? source.url,
      category: dto.category ?? cfg.category ?? null,
      rarity_score: cfg.rarity_score ?? 0.4,
      confidence: 0.75,
      raw_extract: { via: fetched.via, model: result.model_used },
    });
  }

  return {
    status: "ok",
    events,
    tokens_used: result.tokens_used,
    cost_usd: result.cost_usd,
    model_used: result.model_used ?? undefined,
  };
}

function parseConfig(raw: string): SourceConfigBase {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SourceConfigBase;
  } catch {
    return {};
  }
}
