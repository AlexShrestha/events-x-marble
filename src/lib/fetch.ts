const USER_AGENT = "events-x-marble/0.1 (+contact: alex.shrestha88@gmail.com)";
const FETCH_TIMEOUT_MS = 30_000;
const JINA_BASE = "https://r.jina.ai/";

export interface FetchedPage {
  ok: boolean;
  markdown: string;
  via: "jina" | "raw" | "failed";
  error?: string;
}

/**
 * Fetch a URL as cleaned markdown. Tries Jina Reader first (free, JS-rendered, returns markdown),
 * falls back to raw HTML fetch with light cleanup.
 * Playwright is intentionally NOT a fallback in v1 — add it when a target source needs it.
 */
export async function fetchAsMarkdown(url: string): Promise<FetchedPage> {
  const viaJina = await tryJina(url);
  if (viaJina.ok) return viaJina;

  const viaRaw = await tryRawHtml(url);
  if (viaRaw.ok) return viaRaw;

  return {
    ok: false,
    markdown: "",
    via: "failed",
    error: `jina: ${viaJina.error}; raw: ${viaRaw.error}`,
  };
}

async function tryJina(url: string): Promise<FetchedPage> {
  try {
    const res = await fetch(JINA_BASE + url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/markdown, text/plain, */*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { ok: false, markdown: "", via: "failed", error: `Jina HTTP ${res.status}` };
    }
    const text = await res.text();
    if (!text.trim()) {
      return { ok: false, markdown: "", via: "failed", error: "Jina empty body" };
    }
    // Jina wraps upstream errors in a 200 with a 'Warning: Target URL returned error' header line.
    const upstreamErr = text.match(/Warning:\s*Target URL returned error\s*(\d{3})/i);
    if (upstreamErr) {
      return {
        ok: false,
        markdown: "",
        via: "failed",
        error: `upstream HTTP ${upstreamErr[1]} (reported by Jina)`,
      };
    }
    return { ok: true, markdown: text, via: "jina" };
  } catch (e) {
    return { ok: false, markdown: "", via: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}

async function tryRawHtml(url: string): Promise<FetchedPage> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html, */*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { ok: false, markdown: "", via: "failed", error: `Raw HTTP ${res.status}` };
    }
    const html = await res.text();
    const cleaned = stripHtmlToText(html);
    if (cleaned.length < 64) {
      return { ok: false, markdown: "", via: "failed", error: "raw page too short after strip" };
    }
    return { ok: true, markdown: cleaned, via: "raw" };
  } catch (e) {
    return { ok: false, markdown: "", via: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}

/** Cheap HTML → text. Not perfect, but good enough to feed to an LLM extractor. */
function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
