import { env } from "../env.ts";

export interface LlmResult<T = unknown> {
  ok: boolean;
  model_used: string | null;
  parsed: T | null;
  raw_text: string;
  tokens_used: number;
  cost_usd: number;
  error?: string;
}

export interface ExtractOpts<T> {
  systemPrompt: string;
  userMessage: string;
  schema?: { safeParse(input: unknown): { success: true; data: T } | { success: false } };
  /** Override model order. Default: free-first cascade. */
  models?: ModelSpec[];
  maxTokens?: number;
  /**
   * Per-call OpenCode/Anthropic API key. When set, overrides env.OPENCODE_API_KEY
   * for this call only. Required for multi-user scoring (each user's request uses
   * their own key, never the server's default). Falls back to env when unset.
   */
  apiKey?: string;
}

export interface ModelSpec {
  id: string;
  /** Reasoning models need much more max_tokens for the answer after the thinking pass. */
  reasoning?: boolean;
  /** Per-1M-token cost in USD ([input, output]). 0 for free models. */
  pricing?: [number, number];
}

export const DEFAULT_FREE_MODELS: ModelSpec[] = [
  { id: "nemotron-3-super-free", reasoning: false, pricing: [0, 0] },
  { id: "deepseek-v4-flash-free", reasoning: true, pricing: [0, 0] },
  { id: "minimax-m2.5-free", reasoning: true, pricing: [0, 0] },
];

export const HAIKU_FALLBACK: ModelSpec = {
  id: "claude-haiku-4-5",
  reasoning: false,
  pricing: [1, 5],
};

const OPENCODE_BASE = () => env.OPENCODE_BASE_URL.replace(/\/$/, "");

/**
 * Free-first JSON extraction.
 * Iterates DEFAULT_FREE_MODELS until one returns parseable JSON; if all fail returns ok=false.
 * No paid fallback — the plan says "skip and retry next week" on failure.
 */
export async function extractJson<T>(opts: ExtractOpts<T>): Promise<LlmResult<T>> {
  const key = opts.apiKey ?? env.OPENCODE_API_KEY;
  if (!key) {
    return emptyResult({ error: "OPENCODE_API_KEY missing (no per-call apiKey override either)" });
  }
  const models = opts.models ?? DEFAULT_FREE_MODELS;
  let lastError = "no models tried";

  for (const model of models) {
    const baseTokens = opts.maxTokens ?? 800;
    const maxTokens = model.reasoning ? Math.max(4000, baseTokens * 5) : baseTokens;
    const t0 = performance.now();
    const result = await callChatCompletion({
      apiKey: key,
      model: model.id,
      maxTokens,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userMessage },
      ],
    });
    const elapsed = (performance.now() - t0).toFixed(0);

    if (!result.ok) {
      lastError = `${model.id}: ${result.error}`;
      continue;
    }

    const parsed = extractJsonFromText(result.text);
    if (!parsed.ok) {
      lastError = `${model.id}: no parseable JSON (${parsed.reason})`;
      console.warn(`[llm] ${model.id} ${elapsed}ms — no JSON: ${parsed.reason}`);
      continue;
    }

    if (opts.schema) {
      const validated = opts.schema.safeParse(parsed.value);
      if (!validated.success) {
        lastError = `${model.id}: schema validation failed`;
        console.warn(`[llm] ${model.id} ${elapsed}ms — schema failed`);
        continue;
      }
      return {
        ok: true,
        model_used: model.id,
        parsed: validated.data,
        raw_text: result.text,
        tokens_used: result.usage.total,
        cost_usd: priceFor(model, result.usage),
      };
    }

    return {
      ok: true,
      model_used: model.id,
      parsed: parsed.value as T,
      raw_text: result.text,
      tokens_used: result.usage.total,
      cost_usd: priceFor(model, result.usage),
    };
  }

  return emptyResult({ error: lastError });
}

interface ChatCallArgs {
  apiKey: string;
  model: string;
  maxTokens: number;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}

interface ChatCallResult {
  ok: boolean;
  text: string;
  usage: { input: number; output: number; total: number };
  error?: string;
}

async function callChatCompletion(args: ChatCallArgs): Promise<ChatCallResult> {
  try {
    const res = await fetch(`${OPENCODE_BASE()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: 0,
        max_tokens: args.maxTokens,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, text: "", usage: { input: 0, output: 0, total: 0 }, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null; reasoning_content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    const usage = json.usage ?? {};
    return {
      ok: true,
      text,
      usage: {
        input: usage.prompt_tokens ?? 0,
        output: usage.completion_tokens ?? 0,
        total: usage.total_tokens ?? 0,
      },
    };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, text: "", usage: { input: 0, output: 0, total: 0 }, error: err };
  }
}

function extractJsonFromText(text: string): { ok: true; value: unknown } | { ok: false; reason: string } {
  if (!text || !text.trim()) return { ok: false, reason: "empty" };
  // Strip markdown code fences if present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  if (!candidate) return { ok: false, reason: "no candidate" };
  // Find first { or [.
  const start = candidate.search(/[{[]/);
  if (start < 0) return { ok: false, reason: "no json brace" };
  const sliced = candidate.slice(start).trim();
  try {
    return { ok: true, value: JSON.parse(sliced) };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "parse error" };
  }
}

function priceFor(model: ModelSpec, usage: { input: number; output: number }): number {
  if (!model.pricing) return 0;
  const [pIn, pOut] = model.pricing;
  return (usage.input / 1_000_000) * pIn + (usage.output / 1_000_000) * pOut;
}

function emptyResult<T>(opts: { error: string }): LlmResult<T> {
  return {
    ok: false,
    model_used: null,
    parsed: null,
    raw_text: "",
    tokens_used: 0,
    cost_usd: 0,
    error: opts.error,
  };
}
