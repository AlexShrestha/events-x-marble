import { randomUUID } from "node:crypto";
import { db } from "../db/index.ts";
import { extractJson, HAIKU_FALLBACK } from "../lib/llm.ts";

export interface EnrichOpts {
  limit?: number;
  dryRun?: boolean;
}

export interface EnrichResult {
  categorized: number;
  updated: number;
  cost_usd: number;
}

interface RawEvent {
  id: string;
  title: string;
  category: string | null;
  rarity_score: number;
  source_name: string;
}

interface CategoryItem {
  id: string;
  category: string;
}

interface CategoryResponse {
  events: CategoryItem[];
}

const VALID_CATEGORIES = new Set([
  "religious",
  "music",
  "exhibition",
  "community",
  "food",
  "sport",
  "family",
  "nightlife",
  "theatre",
  "film",
  "market",
  "heritage",
  "conference",
  "other",
]);

const RARE_TITLE_RE =
  /apertur(?:a|es) especial|portes obertes|puertas abiertas|única vez|twice a year|once a year|special opening|rare/i;

function computeRarityScore(
  title: string,
  category: string,
  sourceName: string,
): number {
  let score = 0.3;

  if (RARE_TITLE_RE.test(title)) score += 0.4;

  if (category === "religious" || category === "heritage") score += 0.2;

  if (
    /parish|monestir|església|iglesia|cathedral|catedral/i.test(sourceName)
  ) {
    score += 0.2;
  }

  if (category === "nightlife" || category === "music") score -= 0.2;

  return Math.min(1, Math.max(0, score));
}

async function categorizeBatch(events: RawEvent[]): Promise<{
  items: CategoryItem[];
  cost_usd: number;
  tokens_used: number;
}> {
  const eventList = events
    .map((e, i) => `${i + 1}. id="${e.id}" title="${e.title}"`)
    .join("\n");

  const result = await extractJson<CategoryResponse>({
    systemPrompt:
      "You are an event categorizer. Return strict JSON only — no markdown, no explanations.",
    userMessage: `For each event below, return a category from this fixed set:
religious | music | exhibition | community | food | sport | family | nightlife | theatre | film | market | heritage | conference | other

Events:
${eventList}

Output strict JSON in this exact format:
{"events":[{"id":"<id>","category":"<category>"},...]}`,
    models: [HAIKU_FALLBACK],
    maxTokens: 1200,
  });

  if (!result.ok || !result.parsed) {
    console.warn("[tier2-enrich] LLM call failed:", result.error);
    return { items: [], cost_usd: 0, tokens_used: 0 };
  }

  const parsed = result.parsed;
  const items: CategoryItem[] = (parsed.events ?? []).filter(
    (e) =>
      typeof e.id === "string" &&
      typeof e.category === "string" &&
      VALID_CATEGORIES.has(e.category),
  );

  return { items, cost_usd: result.cost_usd, tokens_used: result.tokens_used };
}

export async function enrichRecentEvents(
  opts: EnrichOpts = {},
): Promise<EnrichResult> {
  const limit = opts.limit ?? 50;
  const dryRun = opts.dryRun ?? false;

  const D = db();

  const rows = D.query(
    `SELECT e.id, e.title, e.category, e.rarity_score, s.name AS source_name
     FROM events e
     JOIN sources s ON s.id = e.source_id
     WHERE (e.category IS NULL OR e.category = '')
     LIMIT ?`,
  ).all(limit) as RawEvent[];

  if (rows.length === 0) {
    return { categorized: 0, updated: 0, cost_usd: 0 };
  }

  console.log(
    `[tier2-enrich] Found ${rows.length} uncategorized events. dryRun=${dryRun}`,
  );

  const BATCH_SIZE = 25;
  const batches: RawEvent[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  let totalCategorized = 0;
  let totalUpdated = 0;
  let totalCost = 0;
  let totalTokensUsed = 0;

  for (const batch of batches) {
    const { items, cost_usd, tokens_used } = await categorizeBatch(batch);
    totalCost += cost_usd;
    totalTokensUsed += tokens_used;

    if (items.length === 0) continue;

    // Build lookup for source names
    const sourceByEventId = new Map<string, string>(
      batch.map((e) => [e.id, e.source_name]),
    );

    totalCategorized += items.length;

    if (!dryRun) {
      const updateCategory = D.prepare(
        `UPDATE events SET category = ?, rarity_score = ?, updated_at = datetime('now') WHERE id = ?`,
      );

      const tx = D.transaction((categoryItems: CategoryItem[]) => {
        for (const item of categoryItems) {
          const event = batch.find((e) => e.id === item.id);
          if (!event) continue;
          const sourceName = sourceByEventId.get(item.id) ?? "";
          const newRarity = computeRarityScore(
            event.title,
            item.category,
            sourceName,
          );
          updateCategory.run(item.category, newRarity, item.id);
          totalUpdated++;
        }
      });
      tx(items);
    } else {
      // In dry-run, log what would happen
      for (const item of items) {
        const event = batch.find((e) => e.id === item.id);
        if (!event) continue;
        const sourceName = sourceByEventId.get(item.id) ?? "";
        const newRarity = computeRarityScore(
          event.title,
          item.category,
          sourceName,
        );
        console.log(
          `[dry-run] ${event.title} -> ${item.category} (rarity: ${event.rarity_score} -> ${newRarity.toFixed(2)})`,
        );
      }
      totalUpdated += items.length;
    }
  }

  if (!dryRun && totalCost > 0) {
    // tokens_used is total (prompt + completion). Store in prompt_tokens; completion_tokens = 0
    // since the LLM helper only exposes the total via tokens_used in LlmResult.
    D.run(
      `INSERT INTO cost_ledger (id, run_id, model, prompt_tokens, completion_tokens, cost_usd, created_at)
       VALUES (?, NULL, ?, ?, ?, ?, datetime('now'))`,
      [randomUUID(), HAIKU_FALLBACK.id, totalTokensUsed, 0, totalCost],
    );
  }

  return {
    categorized: totalCategorized,
    updated: totalUpdated,
    cost_usd: totalCost,
  };
}
