import { getUserAgent } from "../lib/user-agent.ts";
const USER_AGENT = getUserAgent();
const TIMEOUT = 15_000;

export interface VerifyOutcome {
  ok: boolean;
  bytes?: number;
  status?: number;
  error?: string;
}

/**
 * Normalize a Telegram candidate URL to its public-view URL and verify it has real messages.
 * Returns ok=false for empty/private/non-existent channels.
 */
export async function verifyTelegram(urlOrHandle: string): Promise<VerifyOutcome> {
  const handle = extractTelegramHandle(urlOrHandle);
  if (!handle) return { ok: false, error: "could not extract handle" };
  const url = `https://t.me/s/${handle}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    const text = await res.text();
    // t.me/s/X returns 200 even for non-existent channels — content tells us the truth.
    if (!text.includes("tgme_widget_message")) {
      return { ok: false, bytes: text.length, error: "no message widgets (channel empty or non-public)" };
    }
    return { ok: true, bytes: text.length, status: 200 };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function verifyWebsite(url: string): Promise<VerifyOutcome> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    // Don't read the full body; the pipeline will do that later via Jina.
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function extractTelegramHandle(input: string): string | null {
  if (!input) return null;
  const cleaned = input.trim();
  // @handle form
  if (cleaned.startsWith("@")) return sanitize(cleaned.slice(1));
  // t.me/handle or https://t.me/handle or https://t.me/s/handle or t.me/+invite
  const m = cleaned.match(/(?:https?:\/\/)?(?:www\.)?t(?:elegram)?\.me\/(?:s\/)?(\+?[a-zA-Z0-9_]+)/i);
  if (m && m[1]) {
    if (m[1].startsWith("+")) return null; // invite link, not scrapeable
    return sanitize(m[1]);
  }
  // bare handle
  if (/^[a-zA-Z0-9_]{4,40}$/.test(cleaned)) return sanitize(cleaned);
  return null;
}

function sanitize(handle: string): string | null {
  if (!/^[a-zA-Z0-9_]{4,40}$/.test(handle)) return null;
  return handle;
}

export function telegramPublicViewUrl(handle: string): string {
  return `https://t.me/s/${handle}`;
}
