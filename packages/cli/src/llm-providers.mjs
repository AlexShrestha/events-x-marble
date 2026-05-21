/**
 * LLM provider registry + universal call dispatch.
 *
 * Five supported providers, three different API formats under the hood:
 *
 *   openai      — OpenAI direct                  /v1/chat/completions   Bearer auth
 *   anthropic   — Anthropic direct               /v1/messages           x-api-key auth
 *   opencode    — OpenCode Zen gateway           /v1/chat/completions   Bearer auth
 *   openrouter  — OpenRouter aggregator          /v1/chat/completions   Bearer auth
 *   custom      — any OpenAI-compatible host     /v1/chat/completions   Bearer auth
 *                 (user-provided base URL + key)
 *
 * Both API formats expose the same shape from this module:
 *   callLlmText({ providerCfg, apiKey, prompt }) → Promise<string>
 *   callLlmJson({ providerCfg, apiKey, systemPrompt, userMessage }) → Promise<{ parsed, modelUsed, usage }>
 *
 * Callers (llm-call.mjs / marble-build.mjs) don't care about format — they
 * pass the resolved config and get text out.
 */

export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    keyEnv: "OPENAI_API_KEY",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    apiFormat: "openai",
    signupUrl: "https://platform.openai.com/api-keys",
    keyHint: "sk-...",
  },
  anthropic: {
    label: "Anthropic",
    keyEnv: "ANTHROPIC_API_KEY",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-haiku-4-5",
    apiFormat: "anthropic",
    signupUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "sk-ant-...",
  },
  opencode: {
    label: "OpenCode Zen",
    keyEnv: "OPENCODE_API_KEY",
    defaultBaseUrl: "https://opencode.ai/zen/v1",
    defaultModel: "claude-haiku-4-5",
    apiFormat: "openai", // OpenCode exposes OpenAI-compatible /chat/completions
    signupUrl: "https://opencode.ai/zen",
    keyHint: "sk-...",
  },
  openrouter: {
    label: "OpenRouter",
    keyEnv: "OPENROUTER_API_KEY",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-haiku-4.5",
    apiFormat: "openai",
    signupUrl: "https://openrouter.ai/settings/keys",
    keyHint: "sk-or-v1-...",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    keyEnv: "LLM_API_KEY",
    defaultBaseUrl: null, // user-provided
    defaultModel: null, // user-provided
    apiFormat: "openai",
    signupUrl: null,
    keyHint: "sk-...",
  },
};

/**
 * The canonical display order in init's "pick a provider" prompt.
 * Reorder here to change the UI without touching pickProvider.
 */
export const PROVIDER_ORDER = ["openai", "anthropic", "opencode", "openrouter", "custom"];

/**
 * Resolve the runtime config for an LLM call from the saved cfg.
 * Returns { provider, baseUrl, model, apiFormat, apiKey }. Throws if the
 * cfg references an unknown provider or no key is available.
 */
export function resolveLlmConfig(cfg) {
  const providerKey = cfg.llm_provider;
  const def = PROVIDERS[providerKey];
  if (!def) {
    throw new Error(
      `unknown LLM provider '${providerKey}' in config — re-run \`events-x-marble init\``,
    );
  }
  const baseUrl = cfg.llm_base_url || def.defaultBaseUrl;
  if (!baseUrl) {
    throw new Error(
      `provider '${providerKey}' needs a base URL — re-run init to configure.`,
    );
  }
  const model = cfg.llm_model || def.defaultModel;
  if (!model) {
    throw new Error(
      `provider '${providerKey}' needs a model name — re-run init to configure.`,
    );
  }
  return {
    provider: providerKey,
    baseUrl: trimSlash(baseUrl),
    model,
    apiFormat: def.apiFormat,
  };
}

/**
 * Universal text-in / text-out LLM call. Used by marble-build's buildLlmFn
 * to satisfy marble's `async (prompt) => string` contract.
 */
export async function callLlmText({ providerCfg, apiKey, prompt, maxTokens = 4096 }) {
  if (providerCfg.apiFormat === "anthropic") {
    const res = await fetch(`${providerCfg.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: providerCfg.model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `LLM ${providerCfg.provider}/${providerCfg.model} HTTP ${res.status} ${text.slice(0, 200)}`,
      );
    }
    const body = await res.json();
    return body?.content?.[0]?.text ?? "";
  }

  // OpenAI-compatible (openai / opencode / openrouter / custom).
  const res = await fetch(`${providerCfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      // OpenRouter requires HTTP-Referer + X-Title for analytics; harmless on others.
      "HTTP-Referer": "https://events.timesmarble.com",
      "X-Title": "events × marble",
    },
    body: JSON.stringify({
      model: providerCfg.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LLM ${providerCfg.provider}/${providerCfg.model} HTTP ${res.status} ${text.slice(0, 200)}`,
    );
  }
  const body = await res.json();
  return body?.choices?.[0]?.message?.content ?? "";
}

/**
 * System + user message variant. Used by the scoring path which builds a
 * structured "score these events against this profile" prompt and expects
 * JSON back. Returns { parsed, modelUsed, rawText, inputTokens, outputTokens }.
 */
export async function callLlmJson({
  providerCfg,
  apiKey,
  systemPrompt,
  userMessage,
  maxTokens = 8000,
}) {
  let text;
  let inputTokens = 0;
  let outputTokens = 0;

  if (providerCfg.apiFormat === "anthropic") {
    const res = await fetch(`${providerCfg.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: providerCfg.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(
        `LLM ${providerCfg.provider}/${providerCfg.model} HTTP ${res.status} ${t.slice(0, 200)}`,
      );
    }
    const body = await res.json();
    text = body?.content?.[0]?.text ?? "";
    inputTokens = body?.usage?.input_tokens ?? 0;
    outputTokens = body?.usage?.output_tokens ?? 0;
  } else {
    const res = await fetch(`${providerCfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://events.timesmarble.com",
        "X-Title": "events × marble",
      },
      body: JSON.stringify({
        model: providerCfg.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(
        `LLM ${providerCfg.provider}/${providerCfg.model} HTTP ${res.status} ${t.slice(0, 200)}`,
      );
    }
    const body = await res.json();
    text = body?.choices?.[0]?.message?.content ?? "";
    inputTokens = body?.usage?.prompt_tokens ?? 0;
    outputTokens = body?.usage?.completion_tokens ?? 0;
  }

  const parsed = extractJsonFromText(text);
  if (!parsed) {
    throw new Error(
      `LLM ${providerCfg.model} returned no parseable JSON. First 200 chars: ${text.slice(0, 200)}`,
    );
  }
  return {
    parsed,
    modelUsed: providerCfg.model,
    rawText: text,
    inputTokens,
    outputTokens,
  };
}

function trimSlash(url) {
  return url.replace(/\/$/, "");
}

function extractJsonFromText(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }
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
