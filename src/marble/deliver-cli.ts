/**
 * CLI: `bun run deliver --city barcelona [--days 14] [--threshold 0.85] [--notes "..."]`
 *
 * Scores the city's events with marble, renders an HTML+text email digest, and
 * writes both to /tmp/marble-email.{html,txt,json}.
 *
 * Does NOT send. The agent / harness that invokes this is expected to take the
 * rendered output and hand it to a delivery channel (Gmail draft via MCP,
 * SMTP, webhook, etc.).
 */
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { applySchema, closeDb, db } from "../db/index.ts";
import { env } from "../env.ts";
import { scoreEventsForUser, type EventForScoring } from "./scorer.ts";
import { renderEmail } from "./email-render.ts";
import { sendEmail } from "./send-email.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    days: { type: "string", short: "d" },
    notes: { type: "string", short: "n" },
    threshold: { type: "string", short: "t" },
    model: { type: "string", short: "m" },
    "html-out": { type: "string" },
    "text-out": { type: "string" },
    "json-out": { type: "string" },
    send: { type: "boolean" },
    "send-to": { type: "string" },
    "dry-run": { type: "boolean" },
  },
});

if (!values.city) {
  console.error('Usage: bun run deliver --city <slug> [--days 14] [--threshold 0.85] [--notes "..."]');
  process.exit(2);
}
if (!env.MARBLE_KG_PATH) {
  console.error("MARBLE_KG_PATH not set in .env");
  process.exit(2);
}

applySchema();

const days = values.days ? Number(values.days) : 14;
const threshold = values.threshold ? Number(values.threshold) : 0.85;
const htmlOut = values["html-out"] ?? "/tmp/marble-email.html";
const textOut = values["text-out"] ?? "/tmp/marble-email.txt";
const jsonOut = values["json-out"] ?? "/tmp/marble-email.json";

const D = db();
const city = D.query(
  "SELECT slug, name, timezone, centroid_lng, centroid_lat FROM cities WHERE slug = ?",
).get(values.city) as
  | { slug: string; name: string; timezone: string; centroid_lng: number | null; centroid_lat: number | null }
  | null;
if (!city) {
  console.error(`Unknown city: ${values.city}`);
  process.exit(2);
}

const now = new Date();
const horizon = new Date(now.getTime() + days * 86_400_000);

const rows = D.query(
  `SELECT e.id, e.title, e.description, e.starts_at, e.ends_at,
          e.venue_name, e.venue_address, e.venue_lat, e.venue_lng,
          e.category, e.rarity_score, e.url, s.name AS source_name
   FROM events e JOIN sources s ON s.id = e.source_id
   WHERE e.city_id = (SELECT id FROM cities WHERE slug = ?)
     AND e.starts_at >= ? AND e.starts_at < ?
   ORDER BY e.starts_at ASC`,
).all(city.slug, now.toISOString(), horizon.toISOString()) as Array<{
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  category: string | null;
  rarity_score: number;
  url: string | null;
  source_name: string;
}>;

console.log(`Loaded ${rows.length} events for ${city.name} (${days}d). Scoring…`);

if (rows.length === 0) {
  console.error("no events to score; run `bun run pipeline` first");
  closeDb();
  process.exit(1);
}

const candidates: EventForScoring[] = rows.map((r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  starts_at: r.starts_at,
  ends_at: r.ends_at,
  venue_name: r.venue_name,
  venue_address: r.venue_address,
  venue_lat: r.venue_lat,
  venue_lng: r.venue_lng,
  category: r.category,
  rarity_score: r.rarity_score,
  source: r.source_name,
  url: r.url,
}));

const centroid: [number, number] | null =
  city.centroid_lng != null && city.centroid_lat != null
    ? [city.centroid_lng, city.centroid_lat]
    : null;

const result = await scoreEventsForUser(candidates, {
  city: { name: city.name, centroid, timezone: city.timezone },
  ...(values.notes ? { notes: values.notes } : {}),
  threshold,
  ...(values.model ? { model: values.model } : {}),
});

const email = renderEmail(result, {
  cityName: city.name,
  cityTimezone: city.timezone,
  windowDays: days,
  threshold,
});

writeFileSync(htmlOut, email.htmlBody, "utf8");
writeFileSync(textOut, email.textBody, "utf8");
writeFileSync(
  jsonOut,
  JSON.stringify(
    {
      subject: email.subject,
      htmlPath: htmlOut,
      textPath: textOut,
      meta: result.meta,
      surfaced: result.surfaced.length,
      total_scored: result.scored.length,
    },
    null,
    2,
  ),
  "utf8",
);

console.log("");
console.log(`subject: ${email.subject}`);
console.log(`surfaced: ${result.surfaced.length} / ${result.scored.length} above ${threshold}`);
console.log(`html : ${htmlOut} (${email.htmlBody.length} bytes)`);
console.log(`text : ${textOut} (${email.textBody.length} bytes)`);
console.log(`json : ${jsonOut}`);
console.log(`model: ${result.meta.model_used} · tokens ${result.meta.tokens_used} · cost $${result.meta.cost_usd.toFixed(4)}`);

// Optional SMTP send (for the autonomous weekly cron).
if (values.send && !values["dry-run"]) {
  const recipient = values["send-to"] ?? env.SMTP_TO;
  if (!recipient) {
    console.error("--send was passed but no recipient: set SMTP_TO in .env or pass --send-to <addr>");
    closeDb();
    process.exit(2);
  }
  console.log("");
  console.log(`sending via SMTP → ${recipient}…`);
  const send = await sendEmail({
    to: recipient,
    subject: email.subject,
    htmlBody: email.htmlBody,
    textBody: email.textBody,
  });
  if (send.ok) {
    console.log(`✓ sent. messageId=${send.messageId ?? "?"} accepted=${(send.accepted ?? []).length} rejected=${(send.rejected ?? []).length}`);
  } else {
    console.error(`✗ send failed: ${send.error}`);
    closeDb();
    process.exit(1);
  }
} else if (values.send) {
  console.log("(--send + --dry-run → would have sent; skipping)");
}

closeDb();
