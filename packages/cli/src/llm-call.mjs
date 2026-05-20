/**
 * Minimal LLM client supporting OpenCode and Anthropic (same /v1/messages API).
 * Sends a system + user message, expects a JSON response, returns parsed JSON.
 *
 * No model cascade here — Pass A keeps the CLI deliberately simple. The user's
 * API key is per-call (never globalized), per the v3 isolation contract.
 */

const PROVIDER_BASES = {
  opencode: "https://opencode.ai/zen/v1",
  anthropic: "https://api.anthropic.com/v1",
};

const DEFAULT_MODELS = {
  opencode: "claude-haiku-4-5",
  anthropic: "claude-haiku-4-5",
};

export async function callForJson({
  provider,
  apiKey,
  systemPrompt,
  userMessage,
  model,
  maxTokens = 8000,
}) {
  if (provider !== "opencode" && provider !== "anthropic") {
    throw new Error(`provider '${provider}' not supported in Pass A (use opencode or anthropic)`);
  }
  const base = PROVIDER_BASES[provider];
  const modelId = model ?? DEFAULT_MODELS[provider];

  // OpenCode mimics Anthropic's /messages API. Anthropic requires the
  // anthropic-version header; OpenCode tolerates it.
  const res = await fetch(`${base}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM ${provider}/${modelId} failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }

  const body = await res.json();
  const text = body?.content?.[0]?.text ?? "";
  const usage = body?.usage ?? {};

  const parsed = extractJsonFromText(text);
  if (!parsed) {
    throw new Error(`LLM ${modelId} returned no parseable JSON. First 200 chars: ${text.slice(0, 200)}`);
  }
  return {
    parsed,
    modelUsed: modelId,
    rawText: text,
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
  };
}

/** Extract the first balanced { ... } block from a string. */
function extractJsonFromText(text) {
  if (!text) return null;
  // Try direct parse first (model returned pure JSON).
  try {
    return JSON.parse(text);
  } catch {}
  // Strip code fences and retry.
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }
  // Find the first balanced brace block.
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
