/**
 * Print which heritage / barrio sources are configured for Barcelona, their
 * last status, what's been ingested from them, and category gaps.
 */
import { createClient } from "@libsql/client";

const c = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const cityRow = await c.execute({
  sql: "SELECT id FROM cities WHERE slug = ?",
  args: ["barcelona"],
});
const cityId = cityRow.rows[0]?.id as string;

const HERITAGE_KEYWORDS = [
  "Patrimoni",
  "Catedral",
  "Monestir",
  "Diputació",
  "Districte",
  "ConvocatoriesBCN",
  "Núvol",
  "Vilaweb",
  "barris",
  "Sant ",
  "festa",
  "Festa",
  "festes",
  "bisbat",
  "Bisbat",
  "Esglesia",
  "Esgles",
  "Gràcia",
  "Eixample",
  "Sants",
  "Poblenou",
  "iglesia",
  "Iglesia",
  "rare",
];

const allSources = await c.execute({
  sql: `SELECT id, name, kind, url, tier, enabled, last_status, last_run_at, config
        FROM sources WHERE city_id = ? ORDER BY tier, name`,
  args: [cityId],
});

const heritage = allSources.rows.filter((r) =>
  HERITAGE_KEYWORDS.some((k) => (r.name as string).toLowerCase().includes(k.toLowerCase())),
);

console.log(`heritage/barrio-flavored sources currently configured (${heritage.length}):`);
for (const r of heritage) {
  console.log(
    `  [tier ${r.tier}] enabled=${r.enabled} status=${(r.last_status ?? "—").padEnd(13)} ${r.name}`,
  );
  console.log(`           url: ${r.url}`);
}

console.log("\nevents-from-these-sources (last 14d window from today):");
const heritageIds = heritage.map((r) => r.id);
if (heritageIds.length === 0) {
  console.log("  (none)");
} else {
  const placeholders = heritageIds.map(() => "?").join(",");
  const ev = await c.execute({
    sql: `SELECT s.name AS source_name, COUNT(*) AS cnt
          FROM events e JOIN sources s ON s.id = e.source_id
          WHERE e.city_id = ? AND e.source_id IN (${placeholders})
            AND e.starts_at > datetime('now')
            AND e.starts_at < datetime('now', '+14 days')
          GROUP BY s.name ORDER BY cnt DESC`,
    args: [cityId, ...heritageIds],
  });
  if (ev.rows.length === 0) {
    console.log("  (zero events ingested from any heritage source in current window)");
  } else {
    for (const r of ev.rows) console.log(`  ${(r.cnt as number).toString().padStart(3)}  ${r.source_name}`);
  }
}

console.log("\ntotal corpus by category (next 14d):");
const cats = await c.execute({
  sql: `SELECT category, COUNT(*) AS cnt FROM events
        WHERE city_id = ? AND starts_at > datetime('now') AND starts_at < datetime('now','+14 days')
        GROUP BY category ORDER BY cnt DESC`,
  args: [cityId],
});
for (const r of cats.rows) console.log(`  ${(r.cnt as number).toString().padStart(3)}  ${r.category ?? "(null)"}`);
