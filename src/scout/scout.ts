import { z } from "zod";
import { extractJson, type ModelSpec } from "../lib/llm.ts";
import type { ScoutResult, SourceCandidate } from "./types.ts";

const CandidateSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum(["telegram", "website"]),
  url: z.string().url().max(500),
  language: z.string().max(8).default("en"),
  rationale: z.string().max(400),
  confidence: z.number().min(0).max(1),
});

const ResultSchema = z.object({
  candidates: z.array(CandidateSchema).max(30),
});

export interface ScoutOpts {
  cityName: string;
  countryCode: string;
  interest: string;
  excludePlatforms?: string[];
  /** Model cascade for the recall step. Defaults to free models, paid Sonnet at the tail. */
  models?: ModelSpec[];
}

const DEFAULT_SCOUT_MODELS: ModelSpec[] = [
  // Free reasoning models — generous max_tokens budget since we ask for a structured list.
  { id: "minimax-m2.5-free", reasoning: true, pricing: [0, 0] },
  { id: "deepseek-v4-flash-free", reasoning: true, pricing: [0, 0] },
  // Tail: cheap paid fallback if all free models choke.
  { id: "gemini-3-flash", reasoning: false, pricing: [0.5, 3] },
];

export async function scoutSources(opts: ScoutOpts): Promise<ScoutResult> {
  const t0 = performance.now();
  const { systemPrompt, userMessage } = buildPrompts(opts);

  const result = await extractJson({
    systemPrompt,
    userMessage,
    schema: ResultSchema,
    models: opts.models ?? DEFAULT_SCOUT_MODELS,
    maxTokens: 2500,
  });

  const elapsed_ms = Math.round(performance.now() - t0);

  if (!result.ok || !result.parsed) {
    return {
      ok: false,
      candidates: [],
      raw_output: result.raw_text,
      elapsed_ms,
      error: result.error ?? "no usable response",
    };
  }

  return {
    ok: true,
    candidates: result.parsed.candidates,
    raw_output: result.raw_text,
    elapsed_ms,
  };
}

function buildPrompts(opts: ScoutOpts): { systemPrompt: string; userMessage: string } {
  const excluded = (opts.excludePlatforms ?? [
    "Eventbrite",
    "Meetup",
    "Luma",
    "Lu.ma",
    "Ticketmaster",
    "Facebook",
    "Instagram",
    "Songkick",
    "Bandsintown",
  ]).join(", ");

  const systemPrompt = [
    "You are a hyperlocal event-source scout. Your job is to recall niche, real, working sources for one city.",
    "",
    `Excluded mass-market platforms (do NOT include): ${excluded}.`,
    "",
    "Each candidate must be:",
    "- A real, public source you have specific knowledge of from training data — NOT a guess by analogy",
    "- A public Telegram channel (https://t.me/HANDLE) OR a niche website with event content (no logins needed)",
    "- Local-language preferred (e.g. Spanish/Catalan for Spain) over English aggregators",
    "- Long-tail: parish/heritage sites, neighborhood community centres, indie venues, city cultural agendas, hyperlocal news event sections",
    "",
    "Be conservative — if you are not sure a Telegram handle exists, set confidence < 0.5. Prefer fewer good candidates over many fabricated ones.",
    "",
    "Output ONLY a JSON object, no prose, no markdown:",
    '{"candidates": [',
    '  {"name": "...", "kind": "telegram" | "website", "url": "https://...", "language": "es"|"ca"|"en"|...,',
    '   "rationale": "1-2 sentences on why this is niche/relevant", "confidence": 0.0-1.0},',
    "  ...",
    "]}",
    "Return at most 15 candidates total.",
  ].join("\n");

  const userMessage = [
    `City: ${opts.cityName} (${opts.countryCode})`,
    `Interest focus: ${opts.interest}`,
    "",
    "Recall the best niche source candidates you know of. Confidence should reflect how sure you are the URL/handle currently exists.",
  ].join("\n");

  return { systemPrompt, userMessage };
}

export type { SourceCandidate };
