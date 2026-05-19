/**
 * Marble-informed event scorer.
 *
 * Reads the user's Marble KG (READ-ONLY), assembles a profile snapshot + the
 * upcoming events corpus + ephemeral context (weather, free-text notes), asks
 * an LLM to score each event for *irresistibility for this specific person*,
 * and returns scored events sorted descending.
 *
 * KG DISCIPLINE:
 *   - We only call loadKg() (read-only fs.readFile + structuredClone).
 *   - We never write back to MARBLE_KG_PATH.
 *   - The profile snapshot is sent to the LLM gateway as part of the request,
 *     then discarded — we do NOT persist beliefs/preferences/identities/traits
 *     to data.db or any committed file.
 *   - Score outputs (event_id + score + why) are request-scoped; the caller
 *     decides whether to log them. By default the CLI just prints.
 */
import { z } from "zod";
import { env } from "../env.ts";
import { extractJson } from "../lib/llm.ts";
import { fetchDailyForecast, renderForecastForPrompt, type DailyWeather } from "../lib/weather.ts";
import { kgCounts, loadKg, type MarbleKg } from "./kg-loader.ts";
import { profileSnapshot, renderProfileForPrompt } from "./profile.ts";

const ScoredEventSchema = z.object({
  event_id: z.string().min(1),
  score: z.number().min(0).max(1),
  why: z.string().max(400),
});
const ResultSchema = z.object({
  scored: z.array(ScoredEventSchema).max(200),
});

export interface EventForScoring {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  venue_name?: string | null;
  category?: string | null;
  rarity_score: number;
  source: string;
  url?: string | null;
}

export interface ScoredEvent extends EventForScoring {
  marble_score: number;
  why: string;
}

export interface ScoreOpts {
  city: { name: string; centroid?: [number, number] | null; timezone: string };
  notes?: string;          // free-text "I have the kid this week, ankle injury, low energy"
  forecastDays?: number;   // how far ahead to fetch weather (default 7)
  model?: string;          // override default model (default: claude-haiku-4-5)
  threshold?: number;      // hard floor for surfacing (default 0.85)
  maxCandidates?: number;  // pre-filter top-N by rarity_score before scoring (default 80)
}

export interface ScoreResult {
  scored: ScoredEvent[];   // ALL events with their scores, descending
  surfaced: ScoredEvent[]; // subset above threshold
  meta: {
    kg_loaded_from: string;
    kg_counts: ReturnType<typeof kgCounts>;
    forecast_days: number;
    model_used: string;
    tokens_used: number;
    cost_usd: number;
    threshold: number;
  };
}

/** Convenience: load the KG from the env-configured path and score a batch of events. */
export async function scoreEventsForUser(
  events: EventForScoring[],
  opts: ScoreOpts,
): Promise<ScoreResult> {
  const kgPath = env.MARBLE_KG_PATH;
  if (!kgPath) throw new Error("MARBLE_KG_PATH is not set in env");
  return scoreEventsWithKgPath(events, kgPath, opts);
}

export async function scoreEventsWithKgPath(
  events: EventForScoring[],
  kgPath: string,
  opts: ScoreOpts,
): Promise<ScoreResult> {
  const { kg, loadedFrom } = await loadKg(kgPath);
  const counts = kgCounts(kg);
  const threshold = opts.threshold ?? 0.85;
  const forecastDays = opts.forecastDays ?? 7;
  const model = opts.model ?? "claude-haiku-4-5";
  const maxCandidates = opts.maxCandidates ?? 80;

  // Pre-filter to top-N by rarity_score so the LLM call stays bounded.
  // (Events below the top-N by rarity are extremely unlikely to be irresistible.)
  const candidates =
    events.length > maxCandidates
      ? [...events].sort((a, b) => (b.rarity_score ?? 0) - (a.rarity_score ?? 0)).slice(0, maxCandidates)
      : events;

  // Fetch weather forecast for the city centroid (if available).
  let forecast: DailyWeather[] = [];
  if (opts.city.centroid) {
    const f = await fetchDailyForecast(
      opts.city.centroid[1],
      opts.city.centroid[0],
      forecastDays,
      opts.city.timezone,
    );
    if (f) forecast = f;
  }

  // Build the prompt — profile + state + events.
  const { systemPrompt, userMessage } = buildPrompts({
    kg,
    cityName: opts.city.name,
    timezone: opts.city.timezone,
    forecast,
    notes: opts.notes,
    events: candidates,
  });

  const res = await extractJson({
    systemPrompt,
    userMessage,
    schema: ResultSchema,
    maxTokens: 8000,
    models: [{ id: model, reasoning: false, pricing: pricingFor(model) }],
  });

  if (!res.ok || !res.parsed) {
    throw new Error(`marble scorer failed: ${res.error ?? "no response"}`);
  }

  // Join scores back onto events.
  const byId = new Map<string, EventForScoring>(events.map((e) => [e.id, e]));
  const scored: ScoredEvent[] = [];
  for (const r of res.parsed.scored) {
    const e = byId.get(r.event_id);
    if (!e) continue;
    scored.push({ ...e, marble_score: r.score, why: r.why });
  }
  // Sort by score descending.
  scored.sort((a, b) => b.marble_score - a.marble_score);
  const surfaced = scored.filter((e) => e.marble_score >= threshold);

  return {
    scored,
    surfaced,
    meta: {
      kg_loaded_from: loadedFrom,
      kg_counts: counts,
      forecast_days: forecast.length,
      model_used: res.model_used ?? model,
      tokens_used: res.tokens_used,
      cost_usd: res.cost_usd,
      threshold,
    },
  };
}

interface PromptBuildOpts {
  kg: MarbleKg;
  cityName: string;
  timezone: string;
  forecast: DailyWeather[];
  notes?: string;
  events: EventForScoring[];
}

function buildPrompts(o: PromptBuildOpts): { systemPrompt: string; userMessage: string } {
  const today = new Date().toISOString().slice(0, 10);
  const profile = profileSnapshot(o.kg.user);
  const profileText = renderProfileForPrompt(profile);
  const forecastText = renderForecastForPrompt(o.forecast);

  const systemPrompt = [
    "You score upcoming events for one specific person using their Marble knowledge-graph profile.",
    "",
    `Today is ${today}. The person is in ${o.cityName} (timezone ${o.timezone}).`,
    "",
    "SCORING SCALE (0–1):",
    "  0.95–1.00  IRRESISTIBLE. Specific, clear hypothesis for WHY THIS PERSON would feel compelled to go.",
    "             E.g. a researcher they cite is giving a one-night talk; their favorite obscure band visits.",
    "  0.85–0.94  STRONG. Multiple signals from the profile align AND nothing in the state blocks.",
    "  0.65–0.84  PLAUSIBLE. Topic match, but no strong personal hook OR some friction.",
    "  0.30–0.64  NEUTRAL. Generic interest match.",
    "  0.00–0.29  POOR. Off-profile, blocked by state, or low rarity.",
    "",
    "CRITICAL RULES:",
    "  - Be conservative. Default to a lower score when uncertain. Most events should land below 0.85.",
    "  - Score considers BOTH affinity (does the profile point at it?) AND friction (does the state block it?).",
    "  - State-blocking factors include: weather (outdoor + heavy rain forecast), implicit constraints suggested by the profile (an injury implied by recent context, a kid-week, travel).",
    "  - Reject conjecture: if the profile doesn't actually support \"this person would love it\", don't pad the score.",
    "  - The 'why' MUST cite the specific profile element OR state factor driving the score. Generic 'matches your interests' is forbidden; say WHICH interest, WHICH belief, WHICH trait.",
    "  - Output ONLY a JSON object, no prose, no markdown fences:",
    '    {"scored":[{"event_id":string,"score":0-1,"why":"one sentence citing profile or state"}]}',
    "  - Score EVERY event in the input list, even if many score low.",
  ].join("\n");

  const userMessage = [
    "USER PROFILE (from Marble KG — confidential):",
    profileText || "(empty profile)",
    "",
    forecastText,
    o.notes ? `\nUSER STATE NOTES (free-form):\n  ${o.notes}` : "",
    "",
    `EVENT CANDIDATES (${o.events.length}):`,
    JSON.stringify(
      o.events.map((e) => ({
        event_id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        venue: e.venue_name ?? null,
        category: e.category ?? null,
        rarity_score: e.rarity_score,
        source: e.source,
        url: e.url ?? null,
        snippet: e.description?.slice(0, 200) ?? null,
      })),
      null,
      0,
    ),
  ].join("\n");

  return { systemPrompt, userMessage };
}

function pricingFor(model: string): [number, number] {
  // OpenCode Zen advertised pricing as of integration. Keep conservative defaults.
  if (model.startsWith("claude-haiku")) return [1, 5];
  if (model.startsWith("claude-sonnet")) return [5, 25];
  if (model.startsWith("claude-opus")) return [5, 25];
  if (model === "gemini-3-flash") return [0.5, 3];
  if (model === "gemini-3.1-pro") return [3, 15];
  return [0, 0];
}
