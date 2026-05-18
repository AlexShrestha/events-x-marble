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
  events: z.array(EventDtoSchema).max(200),
});

const MAX_INPUT_CHARS = 32_000;
const EXTRACTION_MAX_TOKENS = 2500;

/** Build the system prompt that demands exhaustive extraction. */
function buildSystemPrompt(today: string, cityName: string, timezone: string, windowFrom: string, windowTo: string): string {
  return [
    "You extract upcoming events from event-listing web pages.",
    `Today is ${today}. The reader is in city: ${cityName} (timezone: ${timezone}).`,
    `Only return events between ${windowFrom} and ${windowTo} (inclusive).`,
    "Resolve relative dates ('next Friday', 'tonight', 'sábado') using today's date and the city timezone.",
    "",
    "CRITICAL — EXHAUSTIVE ENUMERATION:",
    "List EVERY event visible in the page content. Do not summarize, do not pick favorites.",
    "If the page lists 40 events, return 40 objects. If it lists 60, return 60.",
    "Each event in the content with a date and title MUST appear in your output unless its date is outside the window.",
    "Do NOT merge similar events — each occurrence is its own object.",
    "Do NOT stop early. Work through the entire content before producing output.",
    "",
    "Output ONLY a JSON object, no prose, no markdown fences. Schema:",
    '{"events":[{"title":string,"description":string|null,"starts_at":ISO 8601 with timezone,"ends_at":ISO 8601 or null,"venue_name":string|null,"venue_address":string|null,"url":string|null,"category":string|null}]}',
    "If you find nothing, return {\"events\":[]}.",
    "Never invent dates. If the date is ambiguous or missing, skip that event.",
  ].join("\n");
}

/**
 * Telegram-channel-specific prompt. The content is a stream of recent posts; many won't be events.
 * Posts use heavy relative dating ("este sábado", "mañana", "el 25 a las 21h"), emoji, and often pack
 * multiple events in one message. Different shape than HTML event-listing pages.
 */
function buildTelegramSystemPrompt(today: string, cityName: string, timezone: string, windowFrom: string, windowTo: string): string {
  return [
    `You're reading recent posts from a public Telegram channel about events in ${cityName}.`,
    `Today is ${today} (timezone: ${timezone}).`,
    `Only return events between ${windowFrom} and ${windowTo} (inclusive).`,
    "",
    "The content is a chronological stream of channel posts. MOST posts are NOT events — they may be news, opinion, memes, promos, reposts. Extract ONLY messages describing concrete upcoming events.",
    "",
    "Rules:",
    "- A real event has: a date (absolute OR relative) + a venue/location + a title or activity description.",
    "- Resolve relative dates strictly using TODAY. 'este sábado' = next Saturday; 'mañana' = tomorrow; 'el 25' = the 25th of the current month (or next month if 25th has passed). Resolve to ISO 8601 with the city timezone.",
    "- A single message may announce multiple events (e.g. a weekend programme) — emit each as a separate object.",
    "- Strip emoji/markdown decoration from titles.",
    "- If a post links to an external event page (https://…), set `url` to that link, not the Telegram message URL.",
    "- SKIP posts that lack a concrete date OR lack a venue. SKIP recap/past-tense posts. SKIP news without event-action.",
    "- Languages may be Catalan, Spanish, English, Russian — handle all.",
    "",
    "Output ONLY a JSON object, no prose, no markdown fences. Schema:",
    '{"events":[{"title":string,"description":string|null,"starts_at":ISO 8601 with timezone,"ends_at":ISO 8601 or null,"venue_name":string|null,"venue_address":string|null,"url":string|null,"category":string|null}]}',
    "If you find nothing extractable, return {\"events\":[]}. Never invent dates or venues.",
  ].join("\n");
}

/** Detect that this source is a Telegram public-channel view. */
function isTelegramSource(url: string): boolean {
  return /(?:^|\/\/)t\.me\/s\//i.test(url);
}

/** Build user message for a given content slice. */
function buildUserMessage(sourceUrl: string, sourceName: string, content: string): string {
  return [
    `Source URL: ${sourceUrl}`,
    `Source name: ${sourceName}`,
    "",
    "Page content (already cleaned to markdown/text):",
    "---",
    content,
    "---",
  ].join("\n");
}

/** Normalise a title+date pair for dedup. */
function dedupeKey(title: string, startsAt: string): string {
  return `${title.toLowerCase().replace(/\s+/g, " ").trim()}|${startsAt.slice(0, 16)}`;
}

export async function scrapeViaLlm(
  source: SourceRecord,
  opts: FetchOpts & { deep?: boolean },
): Promise<FetchOutcome> {
  const cfg = parseConfig(source.config);
  const t0 = performance.now();

  const fetched = await fetchAsMarkdown(source.url);
  if (!fetched.ok) {
    return { status: "error", events: [], error: `fetch failed: ${fetched.error}` };
  }

  const today = new Date().toISOString().slice(0, 10);
  const windowFrom = opts.windowStartsAt.toISOString().slice(0, 10);
  const windowTo = opts.windowEndsAt.toISOString().slice(0, 10);

  const systemPrompt = isTelegramSource(source.url)
    ? buildTelegramSystemPrompt(today, opts.city.name, opts.city.timezone, windowFrom, windowTo)
    : buildSystemPrompt(today, opts.city.name, opts.city.timezone, windowFrom, windowTo);

  // Truncate to MAX_INPUT_CHARS for single-pass; if deep mode and content overflows, chunk it.
  const fullMarkdown = fetched.markdown;
  const inputChars = Math.min(fullMarkdown.length, MAX_INPUT_CHARS);
  const content = fullMarkdown.slice(0, MAX_INPUT_CHARS);

  let allDtos: z.infer<typeof EventDtoSchema>[] = [];
  let tokensUsed = 0;
  let costUsd = 0;
  let modelUsed: string | null = null;

  // ---- deep chunking: fullMarkdown > MAX_INPUT_CHARS ----
  if (opts.deep && fullMarkdown.length > MAX_INPUT_CHARS) {
    // Split into two halves (each ≤ MAX_INPUT_CHARS), call extractor independently, then dedup.
    const half = Math.ceil(fullMarkdown.length / 2);
    const chunks = [
      fullMarkdown.slice(0, half),
      fullMarkdown.slice(half),
    ];

    for (const chunk of chunks) {
      const chunkContent = chunk.slice(0, MAX_INPUT_CHARS);
      const userMessage = buildUserMessage(source.url, source.name, chunkContent);
      const result = await extractJson({
        systemPrompt,
        userMessage,
        schema: ResultSchema,
        maxTokens: EXTRACTION_MAX_TOKENS,
      });
      if (result.ok && result.parsed) {
        allDtos.push(...result.parsed.events);
        if (!modelUsed) modelUsed = result.model_used;
      }
      tokensUsed += result.tokens_used;
      costUsd += result.cost_usd;
    }

    // Dedup by normalised title+date
    const seen = new Set<string>();
    allDtos = allDtos.filter((dto) => {
      const key = dedupeKey(dto.title, dto.starts_at);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else {
    // Single pass — try full content (32K), then fall back to 16K if all models fail.
    const FALLBACK_CHARS = MAX_INPUT_CHARS / 2; // 16_000
    const contentSlices: string[] = [content];
    if (fullMarkdown.length > FALLBACK_CHARS) {
      contentSlices.push(fullMarkdown.slice(0, FALLBACK_CHARS));
    }

    let succeeded = false;
    let lastError = "no usable response from any free model";

    for (const slice of contentSlices) {
      const userMessage = buildUserMessage(source.url, source.name, slice);
      const result = await extractJson({
        systemPrompt,
        userMessage,
        schema: ResultSchema,
        maxTokens: EXTRACTION_MAX_TOKENS,
      });

      tokensUsed += result.tokens_used;
      costUsd += result.cost_usd;
      if (result.model_used) modelUsed = result.model_used;

      if (result.ok && result.parsed) {
        allDtos = result.parsed.events;
        succeeded = true;
        break;
      }
      lastError = result.error ?? lastError;
    }

    if (!succeeded) {
      const elapsed = (performance.now() - t0).toFixed(0);
      console.log(
        `[scrape-llm] ${source.name} | inputChars=${inputChars} outputEvents=0 model=${modelUsed ?? "none"} elapsed=${elapsed}ms`,
      );
      return {
        status: "rate_limited",
        events: [],
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        model_used: modelUsed ?? undefined,
        error: lastError,
      };
    }
  }

  const horizonStart = opts.windowStartsAt.getTime();
  const horizonEnd = opts.windowEndsAt.getTime();
  const events: EventCandidate[] = [];

  for (const dto of allDtos) {
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
      raw_extract: { via: fetched.via, model: modelUsed },
    });
  }

  const elapsed = (performance.now() - t0).toFixed(0);
  console.log(
    `[scrape-llm] ${source.name} | inputChars=${inputChars} outputEvents=${events.length} model=${modelUsed ?? "none"} elapsed=${elapsed}ms`,
  );

  return {
    status: "ok",
    events,
    tokens_used: tokensUsed,
    cost_usd: costUsd,
    model_used: modelUsed ?? undefined,
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
