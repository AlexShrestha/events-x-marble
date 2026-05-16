import { Hono } from "hono";
import { env } from "./env.ts";
import { applySchema } from "./db/index.ts";
import { getCityBySlug, listCities, listEvents } from "./db/queries.ts";
import { cities } from "./routes/cities.ts";
import { events } from "./routes/events.ts";
import { admin } from "./routes/admin.ts";
import { icsApp } from "./routes/ics.ts";
import { Home } from "./views/home.tsx";

applySchema();

const app = new Hono();

app.get("/healthz", (c) => c.json({ ok: true }));

app.route("/api/v1/cities", cities);
app.route("/api/v1/events", events);
app.route("/api/v1/admin", admin);
app.route("/calendar.ics", icsApp);

app.get("/", (c) => {
  const all = listCities();
  const querySlug = c.req.query("city");
  const selected = querySlug ? getCityBySlug(querySlug) : (all[0] ?? null);

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
    ? categoryQ
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const eventsRows = selected
    ? listEvents({
        citySlug: selected.slug,
        from,
        to,
        limit: 500,
        offset: 0,
        ...(selectedCategories.length > 0 ? { categories: selectedCategories } : {}),
        ...(minRarity !== null ? { minRarity } : {}),
      })
    : [];

  // Collect all distinct categories from the full unfiltered set for the chips
  const allEventsForCats = selected
    ? listEvents({ citySlug: selected.slug, from, to, limit: 500, offset: 0 })
    : [];
  const allCategories = [
    ...new Set(
      allEventsForCats
        .map((e) => e.category)
        .filter((cat): cat is string => Boolean(cat)),
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

const port = env.PORT;
console.log(`Events x Marble listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
