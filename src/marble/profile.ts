/**
 * Build a compact, LLM-friendly profile snapshot from a Marble KG.
 * Used ONLY for prompt construction; never persisted by events-x-marble.
 */
import type { MarbleKgUser } from "./kg-loader.ts";

export interface ProfileSnapshot {
  interests: string[];   // weighted topics, descending
  beliefs: string[];     // selected high-confidence
  preferences: string[]; // strong preferences
  identities: string[];  // self-identifications
  traits: string[];      // synthesized traits (cross-domain patterns)
}

interface SnapshotOpts {
  maxBeliefs?: number;
  maxPreferences?: number;
  maxIdentities?: number;
  maxInterests?: number;
  maxTraits?: number;
  minBeliefConfidence?: number;
  minPreferenceStrength?: number;
  minIdentitySalience?: number;
}

/**
 * Project the user object into compact human-readable bullet strings.
 * Filtering keeps the prompt small AND avoids surfacing low-confidence/stale items.
 */
export function profileSnapshot(user: MarbleKgUser, opts: SnapshotOpts = {}): ProfileSnapshot {
  const o = {
    maxBeliefs: opts.maxBeliefs ?? 25,
    maxPreferences: opts.maxPreferences ?? 25,
    maxIdentities: opts.maxIdentities ?? 15,
    maxInterests: opts.maxInterests ?? 20,
    maxTraits: opts.maxTraits ?? 15,
    minBeliefConfidence: opts.minBeliefConfidence ?? 0.5,
    minPreferenceStrength: opts.minPreferenceStrength ?? 0.4,
    minIdentitySalience: opts.minIdentitySalience ?? 0.4,
  };

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
    .map((b) => beliefLine(b))
    .filter(Boolean);

  const preferences = (user.preferences ?? [])
    .filter((p) => (p.strength ?? 1) >= o.minPreferenceStrength)
    .slice(0, o.maxPreferences)
    .map((p) => preferenceLine(p))
    .filter(Boolean);

  const identities = (user.identities ?? [])
    .filter((i) => (i.salience ?? 1) >= o.minIdentitySalience)
    .slice(0, o.maxIdentities)
    .map((i) => identityLine(i))
    .filter(Boolean);

  const traits = (user.syntheses ?? [])
    .slice(0, o.maxTraits)
    .map((s) => traitLine(s))
    .filter(Boolean);

  return { interests, beliefs, preferences, identities, traits };
}

function beliefLine(b: NonNullable<MarbleKgUser["beliefs"]>[number]): string {
  const topic = b.topic ?? "";
  const value = b.value ?? b.claim ?? "";
  if (!topic && !value) return "";
  return topic && value ? `${topic}: ${value}` : topic || value;
}

function preferenceLine(p: NonNullable<MarbleKgUser["preferences"]>[number]): string {
  const cat = p.category ?? "";
  const val = p.value ?? "";
  if (!cat && !val) return "";
  return cat && val ? `${cat}: ${val}` : cat || val;
}

function identityLine(i: NonNullable<MarbleKgUser["identities"]>[number]): string {
  const role = i.role ?? "";
  const val = i.value ?? "";
  if (!role && !val) return "";
  return role && val ? `${role}: ${val}` : role || val;
}

function traitLine(s: NonNullable<MarbleKgUser["syntheses"]>[number]): string {
  const t = s.trait;
  if (!t || !t.dimension || !t.value) return "";
  const tag = s.origin ? ` [${s.origin}]` : "";
  return `${t.dimension}=${t.value}${tag}`;
}

/** Render the snapshot as a single block of prompt text. */
export function renderProfileForPrompt(p: ProfileSnapshot): string {
  const block = (label: string, items: string[]): string =>
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
