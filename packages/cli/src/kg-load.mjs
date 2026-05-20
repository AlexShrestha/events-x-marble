/**
 * Read-only marble KG loader. Mirrors src/marble/kg-loader.ts in the website.
 *
 * Hard invariants:
 *   - fs.readFile only. No write paths.
 *   - structuredClone to break shared references.
 *   - KG content never persisted by this CLI to disk except by marble itself.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function loadKg(kgPath) {
  const abs = resolve(kgPath);
  const raw = await readFile(abs, "utf8");
  const parsed = JSON.parse(raw);

  // Accept the three marble file shapes that marble-yt-mcp also accepts.
  let user;
  if (parsed?.user) user = parsed.user;
  else if (parsed?.kg?.user) user = parsed.kg.user;
  else if (parsed?.beliefs || parsed?.preferences || parsed?.interests || parsed?.history) {
    user = parsed;
  }

  if (!user) {
    throw new Error(`could not locate a marble user object inside ${abs} — file shape unrecognized`);
  }

  return { kg: structuredClone({ user }), loadedFrom: abs };
}

export function kgCounts(kg) {
  const u = kg.user ?? {};
  return {
    beliefs: u.beliefs?.length ?? 0,
    preferences: u.preferences?.length ?? 0,
    identities: u.identities?.length ?? 0,
    interests: u.interests?.length ?? 0,
    history: u.history?.length ?? 0,
    syntheses: u.syntheses?.length ?? 0,
  };
}
