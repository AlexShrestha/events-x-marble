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
}

export const Home: FC<Props> = ({ cities, selectedCity, from, to, events, totalCount }) => {
  const grouped = groupByDay(events, selectedCity?.timezone ?? "UTC");
  return (
    <Layout title="Events x Marble">
      <header>
        <h1>Events x Marble</h1>
        <span class="sub">
          {selectedCity ? `${selectedCity.name}, ${selectedCity.country_code}` : "no city"}
          {" — "}
          {totalCount} event{totalCount === 1 ? "" : "s"} this view
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
          <button type="submit">Refresh</button>
        </form>

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
                      {e.title}
                      {e.rarity_score >= 0.7 ? <span class="rarity">rare</span> : null}
                    </div>
                    <div class="meta">
                      {e.venue_name ?? "—"}
                      {" · "}
                      {e.source_name}
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

function groupByDay(events: EventRow[], tz: string): Array<[string, EventRow[]]> {
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
  return [...map.entries()];
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
