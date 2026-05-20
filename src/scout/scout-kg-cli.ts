/**
 * CLI: `bun run scout:kg --city <slug> [--top 8] [--dry-run]`
 *
 * KG-aware variant of `bun run scout`. Instead of typing an interest theme
 * by hand, we derive it from the Marble KG's top-N weighted interests and
 * feed that into the existing scout pipeline.
 *
 *   1. Load KG (read-only fs.readFile + structuredClone).
 *   2. Pick top-N interest labels by weight; format as a "+ "-joined phrase.
 *   3. scoutSources(...)   ← reuses src/scout/scout.ts unchanged
 *   4. verifyWebsite / verifyTelegram on each candidate
 *   5. persistCandidates(...) with enabled=false (existing behavior)
 *
 * PRIVACY: the interest phrase (~80 chars, coarse category labels only)
 * is the only KG-derived data that leaves the laptop. Same revelation level
 * as the rent payload. No raw beliefs/identities/preferences travel.
 *
 * The candidate URLs returned by the LLM cascade are public listings
 * (meetup pages, neighborhood blogs, telegram channels). They land in the
 * `sources` table with `enabled=false` for manual review.
 */
import { parseArgs } from "node:util";
import { applySchema, queryGet } from "../db/index.ts";
import type { ModelSpec } from "../lib/llm.ts";
import { loadKgForUser, resolveUserOrDefault } from "../marble/user.ts";
import { scoutSources } from "./scout.ts";
import { persistCandidates } from "./persist.ts";
import { verifyTelegram, verifyWebsite } from "./verify.ts";
import type { VerifiedCandidate } from "./types.ts";

// Override the scout's default tail (gemini-3-flash 401s at OpenCode today).
// Keep the free reasoning models first; fall back to Haiku — same model
// push-picks uses successfully, ~$0.01 per call.
const KG_SCOUT_MODELS: ModelSpec[] = [
  { id: "minimax-m2.5-free", reasoning: true, pricing: [0, 0] },
  { id: "deepseek-v4-flash-free", reasoning: true, pricing: [0, 0] },
  { id: "claude-haiku-4-5", reasoning: false, pricing: [1, 5] },
];

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    user: { type: "string", short: "u" },
    top: { type: "string", short: "n" },
    "dry-run": { type: "boolean" },
  },
});

if (!values.city) {
  console.error("Usage: bun run scout:kg --city <slug> [--user <id>] [--top 8] [--dry-run]");
  process.exit(2);
}

// Resolve the user (Stage 0: defaults to 'alex'; Stage 1: Turso row).
const user = await resolveUserOrDefault(values.user);
console.log(`[scout:kg] user: ${user.id}`);

await applySchema();

const cityRow = await queryGet<{ slug: string; name: string; country_code: string }>(
  "SELECT slug, name, country_code FROM cities WHERE slug = ?",
  [values.city],
);
if (!cityRow) {
  console.error(`Unknown city: ${values.city}.`);
  process.exit(2);
}

const top = values.top ? Math.max(2, Math.min(20, Number(values.top))) : 8;

// ---- derive the scout brief from KG top interests ------------------------

const kg = await loadKgForUser(user.id);

const interestPhrase = buildInterestPhrase(kg.user.interests ?? [], top);
if (!interestPhrase) {
  console.error("[scout:kg] KG has no usable interests — cannot derive a brief. Aborting.");
  process.exit(1);
}

console.log(`[scout:kg] city: ${cityRow.name} (${cityRow.country_code})`);
console.log(`[scout:kg] brief (top ${top}): "${interestPhrase}"`);
console.log("[scout:kg] asking the free LLM cascade for niche sources (1-2 min)…");

const result = await scoutSources({
  cityName: cityRow.name,
  countryCode: cityRow.country_code,
  interest: interestPhrase,
  models: KG_SCOUT_MODELS,
});

console.log(`[scout:kg] scout finished in ${(result.elapsed_ms / 1000).toFixed(1)}s`);
if (!result.ok) {
  console.error("[scout:kg] scout failed:", result.error);
  console.error("\n--- raw output (truncated) ---");
  console.error(result.raw_output.slice(0, 2000));
  process.exit(1);
}

console.log(`[scout:kg] got ${result.candidates.length} candidate(s). Verifying each…\n`);

const verified: VerifiedCandidate[] = [];
for (const c of result.candidates) {
  const outcome =
    c.kind === "telegram" ? await verifyTelegram(c.url) : await verifyWebsite(c.url);
  verified.push({
    ...c,
    verified: outcome.ok,
    ...(outcome.error ? { verify_error: outcome.error } : {}),
  });
  const mark = outcome.ok ? "✓" : "✗";
  const errSuffix = outcome.ok ? "" : `  — ${outcome.error}`;
  console.log(
    `  ${mark} [${c.kind.padEnd(8)}] conf=${c.confidence.toFixed(2)}  ${c.name}`,
  );
  console.log(`         ${c.url}${errSuffix}`);
  console.log(`         ${c.rationale}`);
}

const verifiedCount = verified.filter((v) => v.verified).length;
console.log(`\n[scout:kg] verified ${verifiedCount}/${verified.length}.`);

if (values["dry-run"]) {
  console.log("[scout:kg] --dry-run: not persisting.");
  process.exit(0);
}

const summary = await persistCandidates(values.city, verified, { interest: interestPhrase });
console.log(
  `[scout:kg] persisted: added=${summary.added}, skipped_unverified=${summary.skipped_unverified}, skipped_existing=${summary.skipped_existing}`,
);
if (summary.added > 0) {
  console.log("");
  console.log(`[scout:kg] ${summary.added} new source(s) await your review. To enable all:`);
  console.log(`           UPDATE sources SET enabled=1 WHERE city_id=(SELECT id FROM cities WHERE slug='${values.city}') AND enabled=0;`);
  console.log("           …or flip individually after spot-checking the URLs.");
}

// ---- helpers ------------------------------------------------------------

function buildInterestPhrase(
  interests: Array<{ topic?: string; weight?: number; salience?: number }>,
  topN: number,
): string {
  const sorted = interests
    .slice()
    .sort((a, b) => (b.weight ?? b.salience ?? 0) - (a.weight ?? a.salience ?? 0))
    .slice(0, topN);

  const labels: string[] = [];
  const seen = new Set<string>();
  for (const i of sorted) {
    const t = (i.topic ?? "").trim();
    if (!t) continue;
    // Defense: strip anything that looks like belief sentence (>40 chars, multi-clause).
    if (t.length > 40 || t.includes(". ") || t.includes(": ")) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    labels.push(t);
  }

  return labels.join(" + ");
}
