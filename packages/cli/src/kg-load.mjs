/**
 * Marble KG loader for the events-x-marble CLI.
 *
 * Delegates to @alexshrestha/marble for the actual read so users get:
 *   - KG_VERSION 2 → 3 auto-migration on first load (PR #62)
 *   - Persisted vector-index reuse — no embeddings re-spend on cold start
 *   - `_meta` shim back-fill for pre-PR-1 facts (cardinality reconciliation)
 *   - Cluster slot initialization (PR #63)
 *
 * The legacy fs.readFile+JSON.parse path is preserved as a fallback for the
 * unusual case where marble can't init the file (corrupted KG, etc.) — we
 * still want `events-x-marble run` to surface "couldn't read your KG" rather
 * than crash with a stack trace.
 *
 * Returns the same `{ kg, loadedFrom }` shape that run.mjs and score.mjs
 * already consume — callers don't change.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Load the user's marble KG via marble's own init() pipeline.
 *
 * marble.init() does:
 *   1. fs.readFile(storage)
 *   2. JSON.parse + schema check
 *   3. version-migrate (2 → 3, persisted vector cache, _meta shims)
 *   4. decayPass — applies temporal decay to old facts before scoring
 *
 * After init, `marble.kg.user` is the live KG object. We deep-clone it so any
 * downstream mutation in scorer/derive-payload can't leak back into marble's
 * persistence cycle (marble would otherwise re-save on its next write call).
 *
 * No embeddings + no LLM is intentional here: this is a READ path. Marble's
 * constructor accepts both as optional. The "[Marble] No embeddings configured"
 * stderr noise that would otherwise fire on every load is suppressed via
 * `silent: true`.
 */
export async function loadKg(kgPath) {
  const abs = resolve(kgPath);

  try {
    const { Marble } = await import("@alexshrestha/marble");
    const marble = new Marble({ storage: abs, silent: true });
    await marble.init();

    const user = marble.kg?.user;
    if (!user) {
      throw new Error(`marble loaded ${abs} but kg.user is empty — file may be corrupted`);
    }

    return {
      kg: structuredClone({ user }),
      loadedFrom: abs,
    };
  } catch (e) {
    // Fall back to the plain fs.readFile path so a flaky marble init doesn't
    // make the whole `events-x-marble run` fail with an opaque stack trace.
    // The forks-of-shape detection below mirrors marble-yt-mcp's loader and
    // accepts the three historical file shapes.
    const isInitFailure = /marble loaded .* kg\.user is empty/.test(e?.message ?? "");
    if (isInitFailure) throw e; // genuine corruption — don't paper over it
    return loadKgFallback(abs);
  }
}

/** Plain-JSON fallback for the rare case marble's init() can't open the file. */
async function loadKgFallback(absPath) {
  const raw = await readFile(absPath, "utf8");
  const parsed = JSON.parse(raw);

  let user;
  if (parsed?.user) user = parsed.user;
  else if (parsed?.kg?.user) user = parsed.kg.user;
  else if (parsed?.beliefs || parsed?.preferences || parsed?.interests || parsed?.history) {
    user = parsed;
  }

  if (!user) {
    throw new Error(`could not locate a marble user object inside ${absPath} — file shape unrecognized`);
  }

  return { kg: structuredClone({ user }), loadedFrom: absPath };
}

/** Cardinality summary for stderr logging — counts only, no content. */
export function kgCounts(kg) {
  const u = kg.user ?? {};
  return {
    beliefs: u.beliefs?.length ?? 0,
    preferences: u.preferences?.length ?? 0,
    identities: u.identities?.length ?? 0,
    interests: u.interests?.length ?? 0,
    history: u.history?.length ?? 0,
    syntheses: u.syntheses?.length ?? 0,
    insights: u.insights?.length ?? 0,
  };
}
