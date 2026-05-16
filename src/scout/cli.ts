import { parseArgs } from "node:util";
import { applySchema, db } from "../db/index.ts";
import { scoutSources } from "./scout.ts";
import { verifyTelegram, verifyWebsite } from "./verify.ts";
import { persistCandidates } from "./persist.ts";
import type { VerifiedCandidate } from "./types.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    interest: { type: "string", short: "i" },
    "dry-run": { type: "boolean" },
  },
});

if (!values.city || !values.interest) {
  console.error('Usage: bun run scout --city <slug> --interest "<theme>" [--dry-run]');
  console.error('Example: bun run scout --city barcelona --interest "underground music + church openings + neighborhood community events"');
  process.exit(2);
}

applySchema();

const cityRow = db()
  .query("SELECT slug, name, country_code FROM cities WHERE slug = ?")
  .get(values.city) as { slug: string; name: string; country_code: string } | null;
if (!cityRow) {
  console.error(`Unknown city: ${values.city}. Seed it first.`);
  process.exit(2);
}

console.log(`Scouting sources for ${cityRow.name} (${cityRow.country_code})`);
console.log(`Interest: "${values.interest}"`);
console.log("Asking the free LLM cascade to recall niche sources (1-2 min)...");

const result = await scoutSources({
  cityName: cityRow.name,
  countryCode: cityRow.country_code,
  interest: values.interest,
});

console.log(`\nScout finished in ${(result.elapsed_ms / 1000).toFixed(1)}s`);
if (!result.ok) {
  console.error("Scout failed:", result.error);
  console.error("\n--- raw output (truncated) ---");
  console.error(result.raw_output.slice(0, 2000));
  process.exit(1);
}

console.log(`Got ${result.candidates.length} candidate(s). Verifying each…\n`);

const verified: VerifiedCandidate[] = [];
for (const c of result.candidates) {
  const outcome =
    c.kind === "telegram" ? await verifyTelegram(c.url) : await verifyWebsite(c.url);
  verified.push({ ...c, verified: outcome.ok, verify_error: outcome.error });
  const mark = outcome.ok ? "✓" : "✗";
  const errSuffix = outcome.ok ? "" : `  — ${outcome.error}`;
  console.log(
    `  ${mark} [${c.kind.padEnd(8)}] conf=${c.confidence.toFixed(2)}  ${c.name}`,
  );
  console.log(`         ${c.url}${errSuffix}`);
  console.log(`         ${c.rationale}`);
}

const verifiedCount = verified.filter((v) => v.verified).length;
console.log(`\nVerified ${verifiedCount} of ${verified.length}.`);

if (values["dry-run"]) {
  console.log("(dry-run mode — not persisting)");
  process.exit(0);
}

const summary = persistCandidates(values.city, verified, { interest: values.interest });
console.log(
  `Persisted: added=${summary.added}, skipped_unverified=${summary.skipped_unverified}, skipped_existing=${summary.skipped_existing}`,
);
console.log(`\nReview & enable selectively with SQL, or run all at once:`);
console.log(`  bun run pipeline --city ${values.city} --tier 1`);
console.log(`(disabled by default — flip enabled=1 on the rows you want).`);
