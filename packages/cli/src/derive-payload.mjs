/**
 * Build the sanitized rent payload pushed to events.timesmarble.com.
 *
 * MUST stay in sync with src/marble/derive-payload.ts in the website repo —
 * the server re-validates with the same Zod schema, so any drift here will be
 * rejected at push time.
 *
 * Privacy contract (enforced):
 *   - NO raw beliefs/preferences/identities/syntheses values
 *   - YES: interest topic names (≤12), event_ids + scores + ≤120-char rationales,
 *          category weights, emoji + accent palette
 */
import { createHash } from "node:crypto";

export const PAYLOAD_SCHEMA_VERSION = 1;
export const PAYLOAD_TTL_DAYS = 8;
export const MAX_PICKS = 12;
export const MAX_INTERESTS = 12;
export const MAX_RATIONALE_LEN = 120;
export const MAX_LABEL_LEN = 24;

export function derivePayload({ citySlug, scoreResult, user, now }) {
  const ts = now ?? new Date();
  const expires = new Date(ts.getTime() + PAYLOAD_TTL_DAYS * 86_400_000);

  const interestPalette = buildInterestPalette(user);

  const picksRaw = scoreResult.surfaced.slice(0, MAX_PICKS);
  const picks = picksRaw.map((e, i) => ({
    event_id: e.id,
    marble_score: round(e.marble_score, 3),
    rank: i + 1,
    rationale: sanitizeRationale(e.why),
  }));

  const categoryWeights = buildCategoryWeights(scoreResult.scored, MAX_PICKS * 3);
  const categoryEmoji = {};
  for (const c of Object.keys(categoryWeights)) categoryEmoji[c] = emojiForLabel(c);
  const accentPalette = buildAccentPalette(interestPalette);

  const fingerprintBasis = interestPalette
    .map((i) => `${i.label}:${i.weight.toFixed(2)}`)
    .join("|");
  const kgFingerprint =
    createHash("sha256").update(fingerprintBasis).digest("hex").slice(0, 8) || "00000000";

  const payload = {
    schema_version: PAYLOAD_SCHEMA_VERSION,
    city_slug: citySlug,
    generated_at: ts.toISOString(),
    expires_at: expires.toISOString(),
    kg_fingerprint: kgFingerprint,
    picks,
    interest_palette: interestPalette,
    category_weights: categoryWeights,
    category_emoji: categoryEmoji,
    accent_palette: accentPalette,
  };

  assertNoRawKgContent(payload, user);
  return payload;
}

// ---- sanitizers ----

function sanitizeRationale(why) {
  let s = (why ?? "")
    .replace(/"[^"]{3,}"/g, "(redacted)")
    .replace(/'[^']{3,}'/g, "(redacted)")
    .replace(/\s+/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();
  if (s.length > MAX_RATIONALE_LEN) {
    s = s.slice(0, MAX_RATIONALE_LEN - 1).trimEnd() + "…";
  }
  return s;
}

function sanitizeLabel(s) {
  const t = (s ?? "").replace(/[^\w\s/&+-]/g, "").trim();
  if (!t || t.length > MAX_LABEL_LEN) return "";
  return t;
}

// ---- builders ----

function buildInterestPalette(user) {
  return (user.interests ?? [])
    .slice()
    .sort((a, b) => (b.weight ?? b.salience ?? 0) - (a.weight ?? a.salience ?? 0))
    .slice(0, MAX_INTERESTS)
    .map((i) => {
      const label = sanitizeLabel(i.topic ?? "");
      if (!label) return null;
      const weight = round(clamp(i.weight ?? i.salience ?? 0.5, 0, 1), 2);
      return { label, emoji: emojiForLabel(label), weight };
    })
    .filter(Boolean);
}

function buildCategoryWeights(scored, limit) {
  const top = scored.slice(0, limit);
  const sums = new Map();
  const counts = new Map();
  for (const e of top) {
    const raw = e.category?.toLowerCase().trim() ?? "";
    if (!raw || raw.length > 40) continue;
    sums.set(raw, (sums.get(raw) ?? 0) + (e.marble_score ?? 0));
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  const out = {};
  for (const [c, s] of sums) {
    const n = counts.get(c) ?? 1;
    out[c] = round(clamp(s / n, 0, 1), 2);
  }
  return out;
}

function buildAccentPalette(interests) {
  const palettes = [
    { primary: "#d97706", rare: "#be185d", card: "#1a1411" },
    { primary: "#0ea5e9", rare: "#8b5cf6", card: "#0f172a" },
    { primary: "#65a30d", rare: "#ca8a04", card: "#171a14" },
    { primary: "#9333ea", rare: "#f43f5e", card: "#171423" },
    { primary: "#e5e7eb", rare: "#fbbf24", card: "#15171c" },
  ];
  if (interests.length === 0) return palettes[0];
  const seed = interests.map((i) => i.label).join("|");
  const idx = Math.abs(hashCode(seed)) % palettes.length;
  return palettes[idx];
}

// ---- emoji map (keep in sync with src/marble/derive-payload.ts) ----

const EMOJI_MAP = {
  design: "🎨", art: "🎨", architecture: "🏛️",
  music: "🎵", jazz: "🎷", classical: "🎻", electronic: "🎛️",
  film: "🎬", cinema: "🎬", theatre: "🎭", theater: "🎭",
  literature: "📖", llibres: "📖", books: "📚", poetry: "📝", literatura: "📖",
  food: "🍷", wine: "🍷", coffee: "☕",
  philosophy: "🧠", research: "🔬", science: "🔬", educació: "🎓", education: "🎓",
  ai: "🤖", llm: "🤖", llms: "🤖", generative: "🤖",
  technology: "💻", programming: "💻",
  saas: "🛠️", product: "🛠️", building: "🛠️",
  startup: "🚀", growth: "📈", marketing: "📈",
  monetisation: "💰", monetization: "💰", revenue: "💰",
  shopify: "🛒", commerce: "🛒", ecommerce: "🛒",
  outreach: "✉️", email: "✉️", cold: "✉️",
  crypto: "🪙", web3: "🪙", blockchain: "🪙",
  logistics: "📦", trade: "📦", finance: "💹",
  politics: "🗳️", history: "🏺", religion: "⛪", mass: "⛪", spirituality: "🕯️",
  community: "🤝",
  fitness: "🏋️", biohacking: "🧬", health: "🩺",
  nature: "🌿", hiking: "🥾", climbing: "🧗", cycling: "🚴", running: "🏃", yoga: "🧘", sports: "⚽",
  travel: "✈️", fashion: "👗", photography: "📷", craft: "🪡",
  nightlife: "🌙", exhibition: "🖼️", exposició: "🖼️",
};

function emojiForLabel(label) {
  const key = (label ?? "").toLowerCase().trim();
  if (EMOJI_MAP[key]) return EMOJI_MAP[key];
  for (const k of Object.keys(EMOJI_MAP)) {
    if (key.includes(k) || k.includes(key)) return EMOJI_MAP[k];
  }
  return "✨";
}

// ---- assertion ----

function assertNoRawKgContent(payload, user) {
  const forbidden = new Set();
  const collect = (xs) => {
    for (const x of xs) {
      if (!x) continue;
      const t = String(x).trim().toLowerCase();
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

  const visit = (v, p) => {
    if (typeof v === "string") {
      const low = v.toLowerCase();
      for (const f of forbidden) {
        if (low.includes(f)) {
          throw new Error(
            `sanitizer: forbidden KG content leaked at ${p} (first 40 chars: "${v.slice(0, 40)}")`,
          );
        }
      }
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, `${p}[${i}]`));
    } else if (v && typeof v === "object") {
      for (const [k, vv] of Object.entries(v)) visit(vv, `${p}.${k}`);
    }
  };
  visit(payload, "payload");
}

// ---- utils ----

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
function round(n, decimals) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
