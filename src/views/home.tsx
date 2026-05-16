import type { FC } from "hono/jsx";
import { Layout } from "./layout.tsx";
import type { City, EventRow } from "../db/queries.ts";

interface Props {
  cities: City[];
  selectedCity: City | null;
  from: string;
  to: string;
  events: EventRow[];
  totalCount: number;
  sort: string;
  minRarity: number | null;
  selectedCategories: string[];
  allCategories: string[];
  rareCount: number;
}

export const Home: FC<Props> = ({
  cities,
  selectedCity,
  from,
  to,
  events,
  totalCount,
  sort,
  minRarity,
  selectedCategories,
  allCategories,
  rareCount,
}) => {
  const grouped = groupByDay(events, selectedCity?.timezone ?? "UTC", sort);

  // Build a base query string preserving city, from, to, and category params
  const buildQS = (overrides: Record<string, string | null>) => {
    const params: Record<string, string> = {};
    if (selectedCity) params.city = selectedCity.slug;
    if (from) params.from = from.slice(0, 10);
    if (to) params.to = to.slice(0, 10);
    if (sort && sort !== "date") params.sort = sort;
    if (minRarity !== null) params.min_rarity = String(minRarity);
    if (selectedCategories.length > 0) params.category = selectedCategories.join(",");
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null) delete params[k];
      else params[k] = v;
    }
    const qs = new URLSearchParams(params).toString();
    return qs ? `/?${qs}` : "/";
  };

  const categoryCount = allCategories.length;

  return (
    <Layout title="Events x Marble">
      <header>
        <h1>Events x Marble</h1>
        <span class="sub">
          {selectedCity ? `${selectedCity.name}, ${selectedCity.country_code}` : "no city"}
          {" — "}
          <span class="stats">
            {totalCount} event{totalCount === 1 ? "" : "s"}
            {" · "}
            {rareCount} rare
            {" · "}
            {categoryCount} {categoryCount === 1 ? "category" : "categories"}
          </span>
        </span>
      </header>
      <main>
        <form class="filters" method="get" action="/">
          <label>
            City
            <select name="city">
              {cities.map((c) => (
                <option value={c.slug} selected={c.slug === selectedCity?.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input type="date" name="from" value={from.slice(0, 10)} />
          </label>
          <label>
            To
            <input type="date" name="to" value={to.slice(0, 10)} />
          </label>
          {/* Preserve sort, min_rarity, category via hidden inputs */}
          {sort && sort !== "date" ? <input type="hidden" name="sort" value={sort} /> : null}
          {minRarity !== null ? (
            <input type="hidden" name="min_rarity" value={String(minRarity)} />
          ) : null}
          {selectedCategories.length > 0 ? (
            <input type="hidden" name="category" value={selectedCategories.join(",")} />
          ) : null}
          <button type="submit">Refresh</button>
        </form>

        {/* Sort toggle */}
        <div class="filter-row">
          <span class="filter-label">Sort:</span>
          <a
            href={buildQS({ sort: null })}
            class={`chip${!sort || sort === "date" ? " chip-active" : ""}`}
          >
            By date
          </a>
          <a
            href={buildQS({ sort: "rarity" })}
            class={`chip${sort === "rarity" ? " chip-active" : ""}`}
          >
            By rarity
          </a>
        </div>

        {/* Rarity filter chips */}
        <div class="filter-row">
          <span class="filter-label">Rarity:</span>
          <a
            href={buildQS({ min_rarity: null })}
            class={`chip${minRarity === null ? " chip-active" : ""}`}
          >
            All
          </a>
          <a
            href={buildQS({ min_rarity: "0.6" })}
            class={`chip${minRarity === 0.6 ? " chip-active" : ""}`}
          >
            Rare (≥0.6)
          </a>
          <a
            href={buildQS({ min_rarity: "0.8" })}
            class={`chip${minRarity === 0.8 ? " chip-active" : ""}`}
          >
            Off-the-beaten-path (≥0.8)
          </a>
        </div>

        {/* Category multi-select chips */}
        {allCategories.length > 0 ? (
          <div class="filter-row filter-row-wrap">
            <span class="filter-label">Category:</span>
            {allCategories.map((cat) => {
              const isActive = selectedCategories.includes(cat);
              // Toggle: add or remove from selection
              const newCats = isActive
                ? selectedCategories.filter((c) => c !== cat)
                : [...selectedCategories, cat];
              const catParam = newCats.length > 0 ? newCats.join(",") : null;
              return (
                <a
                  href={buildQS({ category: catParam })}
                  class={`chip chip-cat${isActive ? " chip-active" : ""}`}
                >
                  {cat}
                </a>
              );
            })}
          </div>
        ) : null}

        {grouped.length === 0 ? (
          <div class="empty">No events in this window yet. Run a pipeline to populate.</div>
        ) : (
          grouped.map(([day, dayEvents]) => (
            <section class="day">
              <h2>{day}</h2>
              {dayEvents.map((e) => (
                <article class="event">
                  <div class="time">{formatTime(e.starts_at, selectedCity?.timezone ?? "UTC")}</div>
                  <div class="body">
                    <div class="title">
                      <span class="source-badge">{truncate(e.source_name, 18)}</span>
                      {e.title}
                      <span class={rarityBadgeClass(e.rarity_score)}>
                        {rarityLabel(e.rarity_score)}
                      </span>
                    </div>
                    <div class="meta">
                      {e.venue_name ?? "—"}
                      {" · "}
                      {e.category ?? "uncategorized"}
                      {e.url ? (
                        <>
                          {" · "}
                          <a href={e.url} target="_blank" rel="noopener noreferrer">
                            source ↗
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ))
        )}
      </main>
      <footer>Tier 0 only. Run the discovery pipeline to populate from real sources.</footer>
    </Layout>
  );
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function rarityBadgeClass(score: number): string {
  if (score >= 0.8) return "rarity rarity-ultra";
  if (score >= 0.6) return "rarity rarity-rare";
  if (score >= 0.3) return "rarity rarity-amber";
  return "rarity rarity-muted";
}

function rarityLabel(score: number): string {
  if (score >= 0.8) return `🔥 ultra-rare`;
  if (score >= 0.6) return "rare";
  if (score >= 0.3) return `${Math.round(score * 100)}%`;
  return `${Math.round(score * 100)}%`;
}

function groupByDay(
  events: EventRow[],
  tz: string,
  sort: string,
): Array<[string, EventRow[]]> {
  const map = new Map<string, EventRow[]>();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  for (const e of events) {
    const day = fmt.format(new Date(e.starts_at));
    let list = map.get(day);
    if (!list) {
      list = [];
      map.set(day, list);
    }
    list.push(e);
  }

  const entries = [...map.entries()];

  if (sort === "rarity") {
    for (const [, dayEvents] of entries) {
      dayEvents.sort((a, b) => {
        if (b.rarity_score !== a.rarity_score) return b.rarity_score - a.rarity_score;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      });
    }
  }

  return entries;
}

function formatTime(iso: string, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date(iso));
}
