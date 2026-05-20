/**
 * Derive the sanitized "rent payload" pushed by the local cron to Vercel-at-rest.
 *
 * PRIVACY CONTRACT (enforced in code, not just by comment — see assertNoRawKgContent):
 *   - NO raw beliefs[].value, preferences[].value, identities[].value, syntheses[].trait.value
 *   - NO free-text history, notes, mood_signal
 *   - YES: interest topic names (≤12, weighted) — these are coarse labels
 *   - YES: event_ids + scores + ≤120-char rationale (same surface already on wire via email)
 *   - YES: category weights, decorative emoji + color palette derived from interests
 *
 * The output is JSON-serialized into the `me_picks.payload` Turso column.
 * The route `src/routes/me-picks.ts` re-validates with the Zod schema before insert.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import type { MarbleKgUser } from "./kg-loader.ts";
import type { ScoreResult, ScoredEvent } from "./scorer.ts";

// ---- constants ----

export const PAYLOAD_SCHEMA_VERSION = 1;
export const PAYLOAD_TTL_DAYS = 8; // slightly > weekly cron interval, so stale shows briefly before expiry
export const MAX_PICKS = 12;
export const MAX_INTERESTS = 12;
export const MAX_RATIONALE_LEN = 120;
export const MAX_LABEL_LEN = 24;

// ---- types + zod schema (single source of truth) ----

export const MePickSchema = z.object({
  event_id: z.string().min(1).max(64),
  marble_score: z.number().min(0).max(1),
  rank: z.number().int().min(1).max(MAX_PICKS),
  rationale: z.string().max(MAX_RATIONALE_LEN),
});
export type MePick = z.infer<typeof MePickSchema>;

export const InterestSwatchSchema = z.object({
  label: z.string().min(1).max(MAX_LABEL_LEN),
  emoji: z.string().min(1).max(8),
  weight: z.number().min(0).max(1),
});
export type InterestSwatch = z.infer<typeof InterestSwatchSchema>;

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const AccentPaletteSchema = z.object({
  primary: HexColor,
  rare: HexColor,
  card: HexColor,
});
export type AccentPalette = z.infer<typeof AccentPaletteSchema>;

export const MePicksPayloadSchema = z
  .object({
    schema_version: z.literal(PAYLOAD_SCHEMA_VERSION),
    city_slug: z.string().min(1).max(64),
    generated_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    kg_fingerprint: z.string().regex(/^[0-9a-f]{8}$/),
    picks: z.array(MePickSchema).max(MAX_PICKS),
    interest_palette: z.array(InterestSwatchSchema).max(MAX_INTERESTS),
    category_weights: z.record(z.string().min(1).max(40), z.number().min(0).max(1)),
    // Decorative emoji per category name (resolved on the laptop using the same
    // EMOJI_MAP that interests use). UI uses this directly — no fuzzy match.
    category_emoji: z.record(z.string().min(1).max(40), z.string().min(1).max(8)),
    accent_palette: AccentPaletteSchema,
  })
  .strict(); // strict = reject unknown keys (defense in depth)
export type MePicksPayload = z.infer<typeof MePicksPayloadSchema>;

// ---- public builder ----

export interface DeriveInput {
  citySlug: string;
  scoreResult: ScoreResult;
  user: MarbleKgUser;
  now?: Date;
}

export function derivePayload(input: DeriveInput): MePicksPayload {
  const now = input.now ?? new Date();
  const expires = new Date(now.getTime() + PAYLOAD_TTL_DAYS * 86_400_000);

  const interestPalette = buildInterestPalette(input.user);

  const picksRaw = input.scoreResult.surfaced.slice(0, MAX_PICKS);
  const picks: MePick[] = picksRaw.map((e, i) => ({
    event_id: e.id,
    marble_score: round(e.marble_score, 3),
    rank: i + 1,
    rationale: sanitizeRationale(e.why),
  }));

  const categoryWeights = buildCategoryWeights(input.scoreResult.scored, MAX_PICKS * 3);
  // Resolve a decorative emoji for every category we know about. UI just looks it up.
  const categoryEmoji: Record<string, string> = {};
  for (const c of Object.keys(categoryWeights)) categoryEmoji[c] = emojiForLabel(c);
  const accentPalette = buildAccentPalette(interestPalette);

  // Non-reversible freshness marker. Hashed over derived interests only — never raw KG.
  const fingerprintBasis = interestPalette
    .map((i) => `${i.label}:${i.weight.toFixed(2)}`)
    .join("|");
  const kgFingerprint = createHash("sha256").update(fingerprintBasis).digest("hex").slice(0, 8)
    || "00000000";

  const draft: MePicksPayload = {
    schema_version: PAYLOAD_SCHEMA_VERSION,
    city_slug: input.citySlug,
    generated_at: now.toISOString(),
    expires_at: expires.toISOString(),
    kg_fingerprint: kgFingerprint,
    picks,
    interest_palette: interestPalette,
    category_weights: categoryWeights,
    category_emoji: categoryEmoji,
    accent_palette: accentPalette,
  };

  // Defense in depth — scan every string in the payload against raw KG content.
  assertNoRawKgContent(draft, input.user);

  // Round-trip through the Zod schema so the laptop catches contract violations
  // before they ever hit the wire.
  return MePicksPayloadSchema.parse(draft);
}

// ---- sanitizers ----

function sanitizeRationale(why: string): string {
  // Strip quoted substrings — those are most often where the LLM cited a raw
  // belief/identity sentence verbatim. (parens kept as the redaction marker.)
  let s = (why ?? "")
    .replace(/"[^"]{3,}"/g, "(redacted)")
    .replace(/'[^']{3,}'/g, "(redacted)")
    // Collapse whitespace.
    .replace(/\s+/g, " ")
    // Drop control chars / BOMs.
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();

  if (s.length > MAX_RATIONALE_LEN) {
    s = s.slice(0, MAX_RATIONALE_LEN - 1).trimEnd() + "…";
  }
  return s;
}

function sanitizeLabel(s: string): string {
  // Topics are short tags ("design", "AI", "climbing"). Strip punctuation that could
  // smuggle payload; drop anything suspiciously long.
  const t = (s ?? "").replace(/[^\w\s/&+-]/g, "").trim();
  if (!t || t.length > MAX_LABEL_LEN) return "";
  return t;
}

// ---- builders ----

function buildInterestPalette(user: MarbleKgUser): InterestSwatch[] {
  return (user.interests ?? [])
    .slice()
    .sort((a, b) => (b.weight ?? b.salience ?? 0) - (a.weight ?? a.salience ?? 0))
    .slice(0, MAX_INTERESTS)
    .map((i): InterestSwatch | null => {
      const label = sanitizeLabel(i.topic ?? "");
      if (!label) return null;
      const weight = round(clamp(i.weight ?? i.salience ?? 0.5, 0, 1), 2);
      return { label, emoji: emojiForLabel(label), weight };
    })
    .filter((x): x is InterestSwatch => x !== null);
}

function buildCategoryWeights(
  scored: ScoredEvent[],
  limit: number,
): Record<string, number> {
  const top = scored.slice(0, limit);
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const e of top) {
    const raw = e.category?.toLowerCase().trim() ?? "";
    if (!raw || raw.length > 40) continue;
    sums.set(raw, (sums.get(raw) ?? 0) + (e.marble_score ?? 0));
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  const out: Record<string, number> = {};
  for (const [c, s] of sums) {
    const n = counts.get(c) ?? 1;
    out[c] = round(clamp(s / n, 0, 1), 2);
  }
  return out;
}

function buildAccentPalette(interests: InterestSwatch[]): AccentPalette {
  // 5 hand-picked palettes — warm, cool, earth, jewel, monochrome.
  // Selection is a deterministic hash of the top interest labels so the same
  // KG always yields the same palette (no flicker between weekly pushes).
  const palettes: AccentPalette[] = [
    { primary: "#d97706", rare: "#be185d", card: "#1a1411" }, // warm-terracotta
    { primary: "#0ea5e9", rare: "#8b5cf6", card: "#0f172a" }, // cool-electric
    { primary: "#65a30d", rare: "#ca8a04", card: "#171a14" }, // earth-moss
    { primary: "#9333ea", rare: "#f43f5e", card: "#171423" }, // jewel-violet
    { primary: "#e5e7eb", rare: "#fbbf24", card: "#15171c" }, // mono-light
  ];
  if (interests.length === 0) return palettes[0]!;
  const seed = interests.map((i) => i.label).join("|");
  const idx = Math.abs(hashCode(seed)) % palettes.length;
  return palettes[idx]!;
}

// ---- emoji map (decorative only — coarse interest labels → unicode glyph) ----

const EMOJI_MAP: Record<string, string> = {
  // Arts & culture
  design: "🎨",
  art: "🎨",
  architecture: "🏛️",
  music: "🎵",
  jazz: "🎷",
  classical: "🎻",
  electronic: "🎛️",
  film: "🎬",
  cinema: "🎬",
  theatre: "🎭",
  theater: "🎭",
  literature: "📖",
  llibres: "📖", // catalan
  books: "📚",
  poetry: "📝",
  literatura: "📖",
  // Food + drink
  food: "🍷",
  wine: "🍷",
  coffee: "☕",
  // Thinking
  philosophy: "🧠",
  research: "🔬",
  science: "🔬",
  educació: "🎓",
  education: "🎓",
  // Tech + business (matches your KG's top interests)
  ai: "🤖",
  llm: "🤖",
  llms: "🤖",
  generative: "🤖",
  technology: "💻",
  programming: "💻",
  saas: "🛠️",
  product: "🛠️",
  building: "🛠️",
  startup: "🚀",
  growth: "📈",
  marketing: "📈",
  monetisation: "💰",
  monetization: "💰",
  revenue: "💰",
  shopify: "🛒",
  commerce: "🛒",
  ecommerce: "🛒",
  outreach: "✉️",
  email: "✉️",
  cold: "✉️",
  crypto: "🪙",
  web3: "🪙",
  blockchain: "🪙",
  logistics: "📦",
  trade: "📦",
  finance: "💹",
  // Civic / social
  politics: "🗳️",
  history: "🏺",
  religion: "⛪",
  mass: "⛪",
  spirituality: "🕯️",
  community: "🤝",
  // Body / outdoors
  fitness: "🏋️",
  biohacking: "🧬",
  health: "🩺",
  nature: "🌿",
  hiking: "🥾",
  climbing: "🧗",
  cycling: "🚴",
  running: "🏃",
  yoga: "🧘",
  sports: "⚽",
  // Misc
  travel: "✈️",
  fashion: "👗",
  photography: "📷",
  craft: "🪡",
  nightlife: "🌙",
  exhibition: "🖼️",
  exposició: "🖼️", // catalan
};

function emojiForLabel(label: string): string {
  const key = label.toLowerCase().trim();
  if (EMOJI_MAP[key]) return EMOJI_MAP[key]!;
  for (const k of Object.keys(EMOJI_MAP)) {
    if (key.includes(k) || k.includes(key)) return EMOJI_MAP[k]!;
  }
  return "✨";
}

// ---- assertion (last line of defense before the payload leaves the laptop) ----

/**
 * Build a set of forbidden substrings from the user's raw KG content and
 * scan every string in the payload for a match. Throws on violation.
 *
 * The per-field builders above should prevent leaks at the source; this is
 * the second checkpoint that catches future regressions.
 */
function assertNoRawKgContent(payload: MePicksPayload, user: MarbleKgUser): void {
  const forbidden = new Set<string>();
  const collect = (xs: Array<string | undefined>) => {
    for (const x of xs) {
      if (!x) continue;
      const t = x.trim().toLowerCase();
      // Only forbid substrings of meaningful length to avoid spurious matches
      // on short words like "music" that appear in interest labels too.
      if (t.length >= 12) forbidden.add(t);
    }
  };
  collect((user.beliefs ?? []).flatMap((b) => [b.value, b.claim]));
  collect((user.preferences ?? []).map((p) => p.value));
  collect((user.identities ?? []).map((i) => i.value));
  collect(
    (user.syntheses ?? []).flatMap((s) => [
      s.trait?.value,
      s.mechanics,
      ...(s.affinities ?? []),
      ...(s.aversions ?? []),
    ]),
  );

  const visit = (v: unknown, path: string): void => {
    if (typeof v === "string") {
      const low = v.toLowerCase();
      for (const f of forbidden) {
        if (low.includes(f)) {
          throw new Error(
            `derive-payload sanitizer: forbidden KG content leaked at ${path} (first 40 chars: "${v.slice(0, 40)}")`,
          );
        }
      }
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, `${path}[${i}]`));
    } else if (v && typeof v === "object") {
      for (const [k, vv] of Object.entries(v as object)) {
        visit(vv, `${path}.${k}`);
      }
    }
  };
  visit(payload, "payload");
}

// ---- tiny utils ----

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
