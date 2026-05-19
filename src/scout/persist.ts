import { randomUUID } from "node:crypto";
import { exec, queryGet } from "../db/index.ts";
import { extractTelegramHandle, telegramPublicViewUrl } from "./verify.ts";
import type { VerifiedCandidate } from "./types.ts";

export interface PersistSummary {
  added: number;
  skipped_unverified: number;
  skipped_existing: number;
  total: number;
}

export async function persistCandidates(
  citySlug: string,
  candidates: VerifiedCandidate[],
  opts: { interest: string },
): Promise<PersistSummary> {
  const city = await queryGet<{ id: string }>(
    "SELECT id FROM cities WHERE slug = ?",
    [citySlug],
  );
  if (!city) throw new Error(`unknown city slug: ${citySlug}`);

  let added = 0;
  let skippedUnverified = 0;
  let skippedExisting = 0;

  for (const c of candidates) {
    if (!c.verified) {
      skippedUnverified++;
      continue;
    }
    // For Telegram, store the public-view URL so the existing scrape pipeline can fetch it directly.
    const finalUrl =
      c.kind === "telegram"
        ? (() => {
            const h = extractTelegramHandle(c.url);
            return h ? telegramPublicViewUrl(h) : c.url;
          })()
        : c.url;

    const existing = await queryGet<{ id: string }>(
      `SELECT id FROM sources WHERE city_id = ? AND (url = ? OR url = ?)`,
      [city.id, finalUrl, c.url],
    );
    if (existing) {
      skippedExisting++;
      continue;
    }

    const rarity =
      c.kind === "telegram" ? Math.max(0.6, c.confidence) : Math.max(0.5, c.confidence * 0.9);
    const config = {
      discovered_via: "scout",
      kind_hint: c.kind,
      language: c.language,
      interest: opts.interest,
      rationale: c.rationale,
      scout_confidence: c.confidence,
      rarity_score: rarity,
      scouted_at: new Date().toISOString(),
    };

    await exec(
      `INSERT OR IGNORE INTO sources (id, city_id, kind, name, url, tier, enabled, config)
       VALUES (?, ?, 'scrape', ?, ?, 1, 0, ?)`,
      [randomUUID(), city.id, c.name, finalUrl, JSON.stringify(config)],
    );
    added++;
  }

  return {
    added,
    skipped_unverified: skippedUnverified,
    skipped_existing: skippedExisting,
    total: candidates.length,
  };
}
