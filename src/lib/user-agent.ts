import { env } from "../env.ts";

/**
 * Build the outbound User-Agent string used by every fetcher in events-x-marble.
 *
 * The contact email is read from CONTACT_EMAIL in .env (gitignored). The fallback
 * is intentionally generic so a fresh public checkout doesn't accidentally leak any
 * maintainer's email into request headers / server logs of remote sources.
 *
 * If you fork events-x-marble for your own deployment, set CONTACT_EMAIL in .env.
 */
export function getUserAgent(): string {
  const contact = env.CONTACT_EMAIL ?? "noreply@events-x-marble.local";
  return `events-x-marble/0.1 (+contact: ${contact})`;
}
