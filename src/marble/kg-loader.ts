/**
 * Read-only loader for the local Marble KG.
 *
 * HARD INVARIANTS (mirror of marble-yt-mcp/src/kg.ts):
 *  - KG file is opened with fs.readFile only. NO WRITE PATHS exist in this module.
 *  - We deep-copy with structuredClone() so any in-memory mutation cannot leak back
 *    to the file via shared references.
 *  - The absolute path that was loaded is returned for transparency / startup logging.
 *  - KG content NEVER lands in data.db, in committed files, or in long-lived logs.
 *    See ../routes/* and ../lib/* — none of them touch this module.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface MarbleKgUser {
  id?: string;
  dob?: string;
  beliefs?: Array<{ topic?: string; value?: string; claim?: string; confidence?: number }>;
  preferences?: Array<{ category?: string; value?: string; strength?: number }>;
  identities?: Array<{ role?: string; value?: string; salience?: number }>;
  interests?: Array<{ topic?: string; weight?: number; salience?: number; trend?: string }>;
  context?: {
    calendar?: unknown[];
    active_projects?: unknown[];
    recent_conversations?: unknown[];
    mood_signal?: unknown;
  };
  history?: Array<{ item_id?: string; reaction?: string; topics?: string[] }>;
  syntheses?: Array<{
    trait?: { dimension?: string; value?: string; weight?: number };
    origin?: string;
    mechanics?: string;
    affinities?: string[];
    aversions?: string[];
  }>;
}

export interface MarbleKg {
  user: MarbleKgUser;
}

/**
 * Load the KG file, parse, deep-clone, return frozen-by-convention snapshot.
 *
 * Caller MUST NOT pass this object to any function that persists state. Within
 * events-x-marble there are no such paths — the engine never writes KG content
 * to data.db, the source registry, or committed files.
 */
export async function loadKg(path: string): Promise<{ kg: MarbleKg; loadedFrom: string }> {
  const abs = resolve(path);
  const raw = await readFile(abs, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  // Handle the same three Marble file shapes that marble-yt-mcp accepts:
  //   { user: {...} }                      ← canonical
  //   { kg: { user: {...} } }              ← wrapped
  //   { beliefs: [...], preferences: ... } ← flattened user (no wrapper)
  const obj = parsed as { user?: MarbleKgUser; kg?: { user?: MarbleKgUser } } & MarbleKgUser;
  let user: MarbleKgUser | undefined;
  if (obj.user) user = obj.user;
  else if (obj.kg?.user) user = obj.kg.user;
  else if (obj.beliefs || obj.preferences || obj.history || obj.interests) {
    user = obj as MarbleKgUser;
  }

  if (!user) {
    throw new Error(
      `Could not locate a Marble user object inside ${abs} — file shape unrecognized.`,
    );
  }

  return { kg: structuredClone({ user }), loadedFrom: abs };
}

/** Sanity counts for logging (no content, just integer cardinalities). */
export function kgCounts(kg: MarbleKg): {
  beliefs: number;
  preferences: number;
  identities: number;
  interests: number;
  history: number;
  syntheses: number;
} {
  const u = kg.user;
  return {
    beliefs: u.beliefs?.length ?? 0,
    preferences: u.preferences?.length ?? 0,
    identities: u.identities?.length ?? 0,
    interests: u.interests?.length ?? 0,
    history: u.history?.length ?? 0,
    syntheses: u.syntheses?.length ?? 0,
  };
}
