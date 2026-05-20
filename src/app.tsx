/**
 * Hono app definition — shared between the Bun local server and the Vercel
 * serverless function. Pure app config; no runtime invocation.
 *
 * Bun entry:  src/server.tsx
 * Vercel entry: src/vercel-entry.ts → api/index.mjs (built by scripts/build-vercel.ts)
 *
 * Route map (v3):
 *   /             Landing page (anonymous) → 302 to /me if authed
 *   /events       Public events list (no personalization)
 *   /me           Personalized events list (cookie-gated; 302 /connect if anon)
 *   /connect      One-line install onboarding flow + browser polling
 *   /install      Bash install script (text/x-shellscript)
 *   /api/v1/*     REST API surface (see individual route files)
 */
import { Hono } from "hono";
import { queryGet } from "./db/index.ts";
import { getCityBySlug, listCities, listEvents } from "./db/queries.ts";
import { cities } from "./routes/cities.ts";
import { events } from "./routes/events.ts";
import { admin } from "./routes/admin.ts";
import { icsApp } from "./routes/ics.ts";
import { meIcsApp } from "./routes/me-ics.ts";
import {
  mePicksApp,
  meSessionApp,
  resolveCallerUserId,
} from "./routes/me-picks.ts";
import { registerApp } from "./routes/register.ts";
import { meTokenApp } from "./routes/me-token.ts";
import { connectApp } from "./routes/connect.ts";
import { installApp } from "./routes/install.ts";
import { meStatusApp } from "./routes/me-status.ts";
import {
  MePicksPayloadSchema,
  type MePicksPayload,
} from "./marble/derive-payload.ts";
import { Home } from "./views/home.tsx";
import { Landing } from "./views/landing.tsx";
import { Connect } from "./views/connect.tsx";
import { MeState } from "./views/me-state.tsx";
import { env } from "./env.ts";
import type { Context } from "hono";

// Schema is applied via the separate `bun run migrate` command, not on cold start.
// Module-init DB calls in the bundled Vercel function were hanging during cold start.

export const app = new Hono();

app.get("/healthz", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

app.route("/api/v1/cities", cities);
app.route("/api/v1/events", events);
app.route("/api/v1/admin", admin);
app.route("/calendar.ics", icsApp);
app.route("/me/calendar.ics", meIcsApp);
app.route("/api/v1/me/picks", mePicksApp);
app.route("/api/v1/me/session", meSessionApp);
app.route("/api/v1/me/token", meTokenApp);
app.route("/api/v1/me/status", meStatusApp);
app.route("/api/v1/register", registerApp);
app.route("/api/v1/connect", connectApp);
app.route("/install", installApp);

// ---- HTML pages -----------------------------------------------------------

/** Landing page (anonymous). Authed users get bounced to /me. */
app.get("/", async (c) => {
  // If the visitor is already authed (legacy alex cookie or v3 user cookie OR
  // a fresh ?token= for cookie exchange), don't waste their time on marketing.
  const callerUserId = await resolveCallerUserId(c.req.raw.headers, c.req.query("token"));
  if (callerUserId) {
    // Preserve any query string so /me?city=… or /me?token=… still works.
    const url = new URL(c.req.url);
    return c.redirect(`/me${url.search}`, 302);
  }

  // Render landing — show a small "N public events in Barcelona" tease.
  const all = await listCities();
  const barcelona = all.find((c) => c.slug === "barcelona") ?? all[0] ?? null;
  let eventCount = 0;
  if (barcelona) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAhead = new Date(today.getTime() + 7 * 86_400_000);
    try {
      const rows = await listEvents({
        citySlug: barcelona.slug,
        from: today.toISOString(),
        to: weekAhead.toISOString(),
        limit: 500,
        offset: 0,
      });
      eventCount = rows.length;
    } catch {
      eventCount = 0;
    }
  }
  return c.html(<Landing eventCount={eventCount} cityName={barcelona?.name ?? "Barcelona"} />);
});

/** Personalized view (cookie-gated). Anonymous → /connect. Not-yet-ready → onboarding state view. */
app.get("/me", async (c) => {
  const callerUserId = await resolveCallerUserId(c.req.raw.headers, c.req.query("token"));
  if (!callerUserId) {
    return c.redirect("/connect", 302);
  }

  // Gate the events dashboard behind onboarding readiness.
  const userRow = await queryGet<{
    onboarding_state: string;
    onboarding_message: string | null;
    onboarding_error_category: string | null;
    onboarding_updated_at: string | null;
    display_name: string | null;
  }>(
    `SELECT onboarding_state, onboarding_message, onboarding_error_category, onboarding_updated_at, display_name
       FROM users WHERE id = ? AND deleted_at IS NULL`,
    [callerUserId],
  );
  // Treat missing row defensively (shouldn't happen, but be loud).
  const state = userRow?.onboarding_state ?? "new";

  if (state !== "ready") {
    const log = await listRecentStatusLog(callerUserId);
    return c.html(
      <MeState
        state={state}
        errorCategory={userRow?.onboarding_error_category}
        message={userRow?.onboarding_message}
        updatedAt={userRow?.onboarding_updated_at}
        displayName={userRow?.display_name}
        log={log}
      />,
    );
  }

  return renderEventsPage(c, { picksFor: callerUserId });
});

async function listRecentStatusLog(userId: string) {
  try {
    const rows = await (await import("./db/index.ts")).queryAll<{
      state: string;
      message: string | null;
      error_category: string | null;
      created_at: string;
    }>(
      `SELECT state, message, error_category, created_at
         FROM user_status_log
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10`,
      [userId],
    );
    return rows;
  } catch {
    return [];
  }
}

/** Public events list (no personalization, no cookie required). */
app.get("/events", async (c) => renderEventsPage(c, { picksFor: null }));

/** Onboarding page — fetches a connect session via the inline script, polls, redirects. */
app.get("/connect", async (c) => {
  const { geoFromHeaders } = await import("./lib/geo.ts");
  const ua = c.req.raw.headers.get("user-agent") ?? "";
  let os: "macos" | "linux" | "windows" | "other" = "other";
  if (/Mac OS X|macOS/i.test(ua)) os = "macos";
  else if (/Linux/i.test(ua) && !/Android/i.test(ua)) os = "linux";
  else if (/Windows/i.test(ua)) os = "windows";
  const geo = geoFromHeaders(c.req.raw.headers);
  return c.html(
    <Connect
      os={os}
      siteUrl={env.SITE_URL}
      geo={{
        city: geo.city,
        country: geo.country,
        timezone: geo.timezone,
      }}
    />,
  );
});

// ---- shared events-page renderer (used by /me and /events) ---------------

async function renderEventsPage(
  c: Context,
  opts: { picksFor: string | null },
): Promise<Response> {
  const all = await listCities();
  const querySlug = c.req.query("city");
  const selected = querySlug ? await getCityBySlug(querySlug) : (all[0] ?? null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);

  const fromQ = c.req.query("from");
  const toQ = c.req.query("to");
  const from = fromQ ? `${fromQ}T00:00:00.000Z` : today.toISOString();
  const to = toQ ? `${toQ}T23:59:59.999Z` : weekAhead.toISOString();

  const sortQ = c.req.query("sort") ?? "date";
  const minRarityQ = c.req.query("min_rarity");
  const minRarity = minRarityQ ? parseFloat(minRarityQ) : null;
  const categoryQ = c.req.query("category");
  const selectedCategories = categoryQ
    ? categoryQ.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const eventsRows = selected
    ? await listEvents({
        citySlug: selected.slug,
        from,
        to,
        limit: 500,
        offset: 0,
        ...(selectedCategories.length > 0 ? { categories: selectedCategories } : {}),
        ...(minRarity !== null ? { minRarity } : {}),
      })
    : [];

  const allEventsForCats = selected
    ? await listEvents({ citySlug: selected.slug, from, to, limit: 500, offset: 0 })
    : [];
  const allCategories = [
    ...new Set(
      allEventsForCats.map((e) => e.category).filter((cat): cat is string => Boolean(cat)),
    ),
  ].sort();

  const rareCount = eventsRows.filter((e) => e.rarity_score >= 0.6).length;

  // Personalization layer — fetched only when /me handler said we have a user.
  let picks: MePicksPayload | null = null;
  if (selected && opts.picksFor) {
    try {
      const row = await queryGet<{ payload: string }>(
        `SELECT payload FROM me_picks
          WHERE user_id = ? AND city_slug = ?
            AND datetime(expires_at) > datetime('now')
          ORDER BY datetime(generated_at) DESC LIMIT 1`,
        [opts.picksFor, selected.slug],
      );
      if (row) {
        const parsed = MePicksPayloadSchema.safeParse(JSON.parse(row.payload));
        if (parsed.success) picks = parsed.data;
      }
    } catch {
      picks = null;
    }
  }

  return c.html(
    <Home
      cities={all}
      selectedCity={selected}
      from={from}
      to={to}
      events={eventsRows}
      totalCount={eventsRows.length}
      sort={sortQ}
      minRarity={minRarity}
      selectedCategories={selectedCategories}
      allCategories={allCategories}
      rareCount={rareCount}
      picks={picks}
    />,
  );
}

export default app;
