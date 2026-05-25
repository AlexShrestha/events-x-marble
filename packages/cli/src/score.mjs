/**
 * Score upcoming events against the user's marble KG using their LLM key.
 *
 * Mirrors src/marble/scorer.ts (scoreEventsWithKg primitive) but simpler:
 *   - No weather forecast (Pass A; add in Pass B if useful)
 *   - No model cascade (one model call; the user's key, one shot)
 *
 * Privacy: the KG profile is sent to the LLM provider (same wire as today's
 * single-user flow). Nothing else.
 */
import { profileSnapshot, renderProfileForPrompt } from "./profile.mjs";
import { callForJson } from "./llm-call.mjs";

const MAX_CANDIDATES = 80;
const DEFAULT_THRESHOLD = 0.85;

export async function scoreEvents({
  events,
  kg,
  cityName,
  cityTimezone,
  notes,
  threshold = DEFAULT_THRESHOLD,
  // LLM client config — see llm-providers.mjs PROVIDERS for valid combos.
  provider,
  apiKey,
  model,
  baseUrl,
}) {
  // Pre-filter by rarity_score so the LLM call stays bounded.
  const candidates =
    events.length > MAX_CANDIDATES
      ? [...events]
          .sort((a, b) => (b.rarity_score ?? 0) - (a.rarity_score ?? 0))
          .slice(0, MAX_CANDIDATES)
      : events;

  const today = new Date().toISOString().slice(0, 10);
  const profile = profileSnapshot(kg.user);
  const profileText = renderProfileForPrompt(profile);

  const systemPrompt = [
    "You score upcoming events for one specific person using their Marble knowledge-graph profile.",
    "",
    `Today is ${today}. The person is in ${cityName} (timezone ${cityTimezone}).`,
    "",
    "An event surfaces if EITHER of these is true:",
    "  (A) PERSONAL FIT — clear hypothesis for why THIS person, given their profile, would feel compelled to go",
    "  (B) HYPERLOCAL MAGIC — once-a-year or rarer city-wide cultural moment (festes de barri, heritage open-days,",
    "      hyperlocal traditions, neighborhood-association events, anniversary fests). These are the kind of events",
    "      anyone LIVING in this city would feel they shouldn't miss, even if not directly in their profile.",
    "",
    "SCORING SCALE (0–1) — take the MAX of (A) personal-fit and (B) hyperlocal-magic:",
    "  0.95–1.00  IRRESISTIBLE. Bullseye on profile, OR a true once-a-year city moment.",
    "  0.85–0.94  STRONG. Either solid personal hook OR clearly hyperlocal/rare event (festes major, parish opening,",
    "             tradition with multi-year cycle, casal/ateneu anniversary, neighborhood premiere).",
    "  0.65–0.84  PLAUSIBLE. Topic match without strong hook, OR notable-but-not-rare cultural event.",
    "  0.30–0.64  NEUTRAL. Generic interest match, or mainstream event with no rarity.",
    "  0.00–0.29  POOR. Off-profile AND mainstream/repeatable.",
    "",
    "INPUT HINTS:",
    "  Each event has a `rarity_score` field (0–1) set at ingestion: ≥0.7 means our crawler tagged it as a",
    "  hyperlocal/heritage/once-a-year event. Use this as STRONG evidence for axis (B) but don't blindly trust it —",
    "  cross-check against title/source. A Cors Muts cercavila or Festa Major castell with rarity_score=0.85 should",
    "  land in the 0.85+ band regardless of whether the person's profile mentions Catalan traditions.",
    "",
    "RULES:",
    "  - Default lower when uncertain. Most events should still land below 0.85.",
    "  - The 'why' must cite either the specific profile element (axis A) OR the specific rarity hook (axis B).",
    "    Generic 'matches your interests' or 'looks interesting' is forbidden.",
    "  - Output ONLY a JSON object: {\"scored\":[{\"event_id\":string,\"score\":0-1,\"why\":\"one sentence\"}]}",
    "  - Score EVERY event in the input list.",
  ].join("\n");

  const userMessage = [
    "USER PROFILE (from Marble KG — confidential):",
    profileText || "(empty profile)",
    "",
    notes ? `USER STATE NOTES:\n  ${notes}\n` : "",
    `EVENT CANDIDATES (${candidates.length}):`,
    JSON.stringify(
      candidates.map((e) => ({
        event_id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        venue: e.venue_name ?? null,
        category: e.category ?? null,
        rarity_score: e.rarity_score,
        source: e.source_name ?? e.source ?? null,
        url: e.url ?? null,
        snippet: typeof e.description === "string" ? e.description.slice(0, 200) : null,
      })),
      null,
      0,
    ),
  ].join("\n");

  const result = await callForJson({
    provider,
    baseUrl,
    apiKey,
    model,
    systemPrompt,
    userMessage,
    maxTokens: 8000,
  });

  const parsedScores = result.parsed?.scored;
  if (!Array.isArray(parsedScores)) {
    throw new Error(
      `LLM returned no 'scored' array. First 200 chars of response: ${result.rawText.slice(0, 200)}`,
    );
  }

  const byId = new Map(events.map((e) => [e.id, e]));
  const scored = [];
  for (const r of parsedScores) {
    const e = byId.get(r.event_id);
    if (!e) continue;
    const numericScore = typeof r.score === "number" ? r.score : Number(r.score);
    if (!Number.isFinite(numericScore)) continue;
    scored.push({
      ...e,
      marble_score: numericScore,
      why: typeof r.why === "string" ? r.why : "",
    });
  }
  scored.sort((a, b) => b.marble_score - a.marble_score);
  const surfaced = scored.filter((e) => e.marble_score >= threshold);

  return {
    scored,
    surfaced,
    meta: {
      threshold,
      model_used: result.modelUsed,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
    },
  };
}
