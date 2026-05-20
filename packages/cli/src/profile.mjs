/**
 * Compact, LLM-friendly profile snapshot from a marble KG.
 * Mirrors src/marble/profile.ts in the website (kept in sync manually).
 */

const DEFAULTS = {
  maxBeliefs: 25,
  maxPreferences: 25,
  maxIdentities: 15,
  maxInterests: 20,
  maxTraits: 15,
  minBeliefConfidence: 0.5,
  minPreferenceStrength: 0.4,
  minIdentitySalience: 0.4,
};

export function profileSnapshot(user, opts = {}) {
  const o = { ...DEFAULTS, ...opts };

  const interests = (user.interests ?? [])
    .slice()
    .sort((a, b) => (b.weight ?? b.salience ?? 0) - (a.weight ?? a.salience ?? 0))
    .slice(0, o.maxInterests)
    .map((i) => {
      const w = i.weight ?? i.salience;
      const trend = i.trend ? ` (${i.trend})` : "";
      return w != null ? `${i.topic} [w=${w.toFixed(2)}${trend}]` : `${i.topic}${trend}`;
    });

  const beliefs = (user.beliefs ?? [])
    .filter((b) => (b.confidence ?? 1) >= o.minBeliefConfidence)
    .slice(0, o.maxBeliefs)
    .map(beliefLine)
    .filter(Boolean);

  const preferences = (user.preferences ?? [])
    .filter((p) => (p.strength ?? 1) >= o.minPreferenceStrength)
    .slice(0, o.maxPreferences)
    .map(preferenceLine)
    .filter(Boolean);

  const identities = (user.identities ?? [])
    .filter((i) => (i.salience ?? 1) >= o.minIdentitySalience)
    .slice(0, o.maxIdentities)
    .map(identityLine)
    .filter(Boolean);

  const traits = (user.syntheses ?? [])
    .slice(0, o.maxTraits)
    .map(traitLine)
    .filter(Boolean);

  return { interests, beliefs, preferences, identities, traits };
}

export function renderProfileForPrompt(p) {
  const block = (label, items) =>
    items.length > 0 ? `${label}:\n${items.map((s) => `  - ${s}`).join("\n")}` : "";
  return [
    block("INTERESTS (highest weight first)", p.interests),
    block("TRAITS (cross-domain synthesized patterns)", p.traits),
    block("IDENTITIES", p.identities),
    block("PREFERENCES", p.preferences),
    block("BELIEFS", p.beliefs),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function beliefLine(b) {
  const topic = b.topic ?? "";
  const value = b.value ?? b.claim ?? "";
  if (!topic && !value) return "";
  return topic && value ? `${topic}: ${value}` : topic || value;
}

function preferenceLine(p) {
  const cat = p.category ?? "";
  const val = p.value ?? "";
  if (!cat && !val) return "";
  return cat && val ? `${cat}: ${val}` : cat || val;
}

function identityLine(i) {
  const role = i.role ?? "";
  const val = i.value ?? "";
  if (!role && !val) return "";
  return role && val ? `${role}: ${val}` : role || val;
}

function traitLine(s) {
  const t = s.trait;
  if (!t || !t.dimension || !t.value) return "";
  const tag = s.origin ? ` [${s.origin}]` : "";
  return `${t.dimension}=${t.value}${tag}`;
}
