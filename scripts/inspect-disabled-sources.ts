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

const disabled = await c.execute({
  sql: `SELECT name, kind, url, config, last_status
        FROM sources
        WHERE city_id = ? AND enabled = 0
        ORDER BY name`,
  args: [cityId],
});

for (const row of disabled.rows) {
  console.log("---");
  console.log("name   :", row.name);
  console.log("kind   :", row.kind);
  console.log("url    :", row.url);
  console.log("config :", row.config);
  console.log("last   :", row.last_status);
}
