/**
 * Scoring LLM client — thin wrapper around llm-providers.mjs's universal
 * dispatch. Used by score.mjs to score upcoming events against the user's
 * marble profile.
 *
 * Multi-provider since v8: openai · anthropic · opencode · openrouter ·
 * custom. The user's API key is per-call (never globalized), per the v3
 * isolation contract.
 */
import { callLlmJson, PROVIDERS } from "./llm-providers.mjs";

export async function callForJson({
  provider,
  baseUrl,
  apiKey,
  systemPrompt,
  userMessage,
  model,
  maxTokens = 8000,
}) {
  const def = PROVIDERS[provider];
  if (!def) {
    throw new Error(
      `unknown provider '${provider}' — supported: ${Object.keys(PROVIDERS).join(", ")}`,
    );
  }
  const providerCfg = {
    provider,
    baseUrl: trimSlash(baseUrl || def.defaultBaseUrl),
    model: model || def.defaultModel,
    apiFormat: def.apiFormat,
  };
  return callLlmJson({
    providerCfg,
    apiKey,
    systemPrompt,
    userMessage,
    maxTokens,
  });
}

function trimSlash(url) {
  return (url || "").replace(/\/$/, "");
}
