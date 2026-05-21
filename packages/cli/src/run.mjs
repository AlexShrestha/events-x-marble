/**
 * `events-x-marble run [--city SLUG] [--threshold 0.85] [--days 14] [--dry-run]`
 *
 * Weekly cron entry point — and the "first run" after init.
 *
 *   1. Load config + resolve API key from env.
 *   2. Load the marble KG from disk (read-only).
 *   3. Fetch upcoming events for the city from the public /api/v1/events endpoint.
 *   4. Score them locally using the user's LLM key.
 *   5. derivePayload (sanitizer enforced).
 *   6. POST to /api/v1/me/picks → row written under the user_id.
 */
import {
  expandHome,
  loadConfig,
  resolveApiKey,
  saveConfig,
} from "./config.mjs";
import { loadKg, kgCounts } from "./kg-load.mjs";
import { scoreEvents } from "./score.mjs";
import { derivePayload } from "./derive-payload.mjs";
import { pushPicks } from "./server-client.mjs";
import { parseFlags } from "./prompt.mjs";
import { report } from "./status-report.mjs";

export async function run(args) {
  const flags = parseFlags(args);
  const cfg = loadConfig();

  const city = flags.city ?? cfg.city_slug ?? "barcelona";
  const days = Number(flags.days ?? 14);
  const threshold = Number(flags.threshold ?? 0.85);
  const dryRun = Boolean(flags["dry-run"] || flags.dry);

  // --- Pre-flight: API key must be set, else block early
  let apiKey;
  try {
    apiKey = resolveApiKey(cfg);
  } catch (e) {
    const msg = e.message ?? String(e);
    await report({ cfg, state: "key_missing", message: msg });
    throw e;
  }

  const kgPath = expandHome(cfg.kg_path);

  process.stderr.write(`[run] user=${cfg.user_id} city=${city} threshold=${threshold} days=${days}\n`);
  process.stderr.write(`[run] kg=${kgPath}  llm=${cfg.llm_provider} (from $${cfg.llm_api_key_env})\n`);

  // --- Load KG (failing here is an error state)
  let kg, counts;
  try {
    const loaded = await loadKg(kgPath);
    kg = loaded.kg;
    counts = kgCounts(kg);
  } catch (e) {
    const msg = `couldn't read marble KG at ${kgPath}: ${e.message ?? e}`;
    await report({ cfg, state: "error", message: msg, errorCategory: "kg_load_failed" });
    throw new Error(msg);
  }
  process.stderr.write(
    `[run] KG: ${counts.beliefs} beliefs · ${counts.preferences} prefs · ${counts.identities} ids · ${counts.interests} interests\n`,
  );

  // --- Fetch upcoming events from the public API
  let events;
  try {
    events = await fetchUpcomingEvents(cfg.site_url, city, days);
  } catch (e) {
    const msg = `couldn't fetch events from ${cfg.site_url}: ${e.message ?? e}`;
    await report({ cfg, state: "error", message: msg, errorCategory: "network" });
    throw new Error(msg);
  }
  process.stderr.write(`[run] fetched ${events.length} upcoming events for ${city}\n`);
  if (events.length === 0) {
    const msg = `no upcoming events in ${city} for the next ${days} days — nothing to score.`;
    process.stderr.write(`[run] ${msg}\n`);
    await report({ cfg, state: "ready", message: msg });
    return;
  }

  // --- Resolve city metadata (for the prompt's timezone hint)
  const cityMeta = await fetchCityMeta(cfg.site_url, city);
  if (!cityMeta) {
    process.stderr.write(`[run] warning: city '${city}' not in /api/v1/cities — using UTC\n`);
  }

  // --- Score (long-running LLM call — report 'scoring' so the browser shows progress)
  process.stderr.write(`[run] scoring against KG…\n`);
  await report({ cfg, state: "scoring", message: `scoring ${events.length} events against your KG…` });
  let scoreResult;
  try {
    scoreResult = await scoreEvents({
      events,
      kg,
      cityName: cityMeta?.name ?? city,
      cityTimezone: cityMeta?.timezone ?? "UTC",
      notes: undefined,
      threshold,
      provider: cfg.llm_provider,
      apiKey,
      // Honor custom base/model from config (e.g. for openrouter or own-key).
      baseUrl: cfg.llm_base_url,
      model: cfg.llm_model,
    });
  } catch (e) {
    const msg = (e.message ?? String(e)).slice(0, 400);
    const isAuth = /401|403|unauth|invalid.*key/i.test(msg);
    await report({
      cfg,
      state: "error",
      message: msg,
      errorCategory: isAuth ? "key_invalid" : "score_failed",
    });
    throw e;
  }
  process.stderr.write(
    `[run] scored=${scoreResult.scored.length} surfaced=${scoreResult.surfaced.length} model=${scoreResult.meta.model_used} tokens=${scoreResult.meta.input_tokens + scoreResult.meta.output_tokens}\n`,
  );

  // --- Derive sanitized payload
  const payload = derivePayload({
    citySlug: city,
    scoreResult,
    user: kg.user,
  });
  process.stderr.write(
    `[run] payload: ${payload.picks.length} picks · ${payload.interest_palette.length} interests · ${Object.keys(payload.category_weights).length} categories · accent=${payload.accent_palette.primary} · fp=${payload.kg_fingerprint}\n`,
  );

  if (dryRun) {
    process.stderr.write("[run] --dry-run: not pushing.\n");
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
    return;
  }

  // --- Push (also reportable as 'pushing' so the UI can show that final beat)
  await report({ cfg, state: "pushing", message: `uploading ${payload.picks.length} picks…` });
  let result;
  try {
    result = await pushPicks({
      siteUrl: cfg.site_url,
      token: cfg.token,
      payload,
    });
  } catch (e) {
    const msg = (e.message ?? String(e)).slice(0, 400);
    await report({ cfg, state: "error", message: msg, errorCategory: "push_failed" });
    throw e;
  }
  process.stderr.write(`[run] ✓ pushed: ${JSON.stringify(result)}\n`);

  await report({
    cfg,
    state: "ready",
    message: `pushed ${payload.picks.length} picks, ${payload.interest_palette.length} interests`,
  });

  saveConfig({ last_push_at: new Date().toISOString() });
}

// ---- helpers ----

async function fetchUpcomingEvents(siteUrl, citySlug, days) {
  const now = new Date();
  const horizon = new Date(now.getTime() + days * 86_400_000);
  const params = new URLSearchParams({
    city: citySlug,
    from: now.toISOString(),
    to: horizon.toISOString(),
    limit: "500",
  });
  const url = `${trimSlash(siteUrl)}/api/v1/events?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetch events HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const body = await res.json();
  const rows = body?.events ?? body?.data ?? body;
  if (!Array.isArray(rows)) {
    throw new Error(`unexpected /api/v1/events response shape: ${JSON.stringify(body).slice(0, 200)}`);
  }
  // Normalize the public API shape ({venue: {...}, source: string}) into the
  // flat shape that score.mjs + derive-payload.mjs expect.
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? null,
    starts_at: r.starts_at,
    ends_at: r.ends_at ?? null,
    venue_name: r.venue?.name ?? null,
    venue_address: r.venue?.address ?? null,
    venue_lat: r.venue?.location?.lat ?? null,
    venue_lng: r.venue?.location?.lng ?? null,
    category: r.category ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    rarity_score: typeof r.rarity_score === "number" ? r.rarity_score : 0,
    confidence: typeof r.confidence === "number" ? r.confidence : 1,
    url: r.url ?? null,
    image_url: r.image_url ?? null,
    source: r.source ?? null,
    source_name: r.source ?? null,
  }));
}

async function fetchCityMeta(siteUrl, citySlug) {
  try {
    const res = await fetch(`${trimSlash(siteUrl)}/api/v1/cities`);
    if (!res.ok) return null;
    const body = await res.json();
    const list = body?.cities ?? body?.data ?? body;
    if (!Array.isArray(list)) return null;
    return list.find((c) => c.slug === citySlug) ?? null;
  } catch {
    return null;
  }
}

function trimSlash(url) {
  return url.replace(/\/$/, "");
}
