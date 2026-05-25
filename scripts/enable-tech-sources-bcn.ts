/**
 * One-shot: enable the four high-confidence tech sources scouted for Barcelona.
 *
 * Background: scout-kg-cli surfaces sources matching the user's interest
 * palette. For SaaS-founder Alex (Revenue/LLMs/SaaS/Entrepreneurship), the
 * scout found 4 strong matches but they landed at enabled=0 awaiting human
 * approval — which never happened. Result: corpus stays Resident-Advisor-
 * dominated (57/68 = 84% nightlife) and his /me page surfaces nothing.
 *
 * Sources enabled here, with scout confidence:
 *   - Ajuntament de Barcelona - Agenda Cultural   (0.95)
 *   - Eurecat - Barcelona Tech Events             (0.78)
 *   - 4YFN (4 Years From Now)                     (0.75)
 *   - Emprendedores.es Comunidad Barcelona        (0.60)
 *
 * After this, run: `bun src/discovery/cli.ts --city barcelona --tier 1` to
 * ingest. Then have the user re-run `events-x-marble run`.
 */
import { createClient } from "@libsql/client";

const c = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const TECH_SOURCE_NAMES = [
  "Ajuntament de Barcelona - Agenda Cultural",
  "Eurecat - Barcelona Tech Events",
  "4YFN (4 Years From Now)",
  "Emprendedores.es Comunidad Barcelona",
];

const cityRow = await c.execute({
  sql: "SELECT id FROM cities WHERE slug = ?",
  args: ["barcelona"],
});
const cityId = cityRow.rows[0]?.id as string;

const placeholders = TECH_SOURCE_NAMES.map(() => "?").join(",");
const res = await c.execute({
  sql: `UPDATE sources
        SET enabled = 1, last_status = NULL
        WHERE city_id = ? AND name IN (${placeholders})`,
  args: [cityId, ...TECH_SOURCE_NAMES],
});

console.log(`enabled ${res.rowsAffected} tech sources for barcelona`);

// Verify
const verify = await c.execute({
  sql: `SELECT name, enabled, last_status FROM sources
        WHERE city_id = ? AND name IN (${placeholders})
        ORDER BY name`,
  args: [cityId, ...TECH_SOURCE_NAMES],
});
for (const row of verify.rows) {
  console.log(`  enabled=${row.enabled}  ${row.name}`);
}
