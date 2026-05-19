/**
 * Hono app definition — shared between the Bun local server and the Vercel
 * serverless function. Pure app config; no runtime invocation.
 *
 * Bun entry:  src/server.tsx   (Bun.serve wraps app.fetch)
 * Vercel entry: api/index.ts   (hono/vercel `handle(app)` wraps the same app)
 */
import { Hono } from "hono";
import { getCityBySlug, listCities, listEvents } from "./db/queries.ts";
import { cities } from "./routes/cities.ts";
import { events } from "./routes/events.ts";
import { admin } from "./routes/admin.ts";
import { icsApp } from "./routes/ics.ts";
import { meIcsApp } from "./routes/me-ics.ts";
import { Home } from "./views/home.tsx";

// Schema is applied via the separate `bun run migrate` command, not on cold start.
// Module-init DB calls in the bundled Vercel function were hanging during cold start
// (function timed out before the libsql HTTP handshake completed).

export const app = new Hono();

app.get("/healthz", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

app.route("/api/v1/cities", cities);
app.route("/api/v1/events", events);
app.route("/api/v1/admin", admin);
app.route("/calendar.ics", icsApp);
app.route("/me/calendar.ics", meIcsApp);

app.get("/", async (c) => {
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
    />,
  );
});

export default app;
