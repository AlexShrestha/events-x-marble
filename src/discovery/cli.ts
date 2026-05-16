import { parseArgs } from "node:util";
import { applySchema } from "../db/index.ts";
import { runPipeline } from "./pipeline.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string", short: "c" },
    days: { type: "string", short: "d" },
    tier: { type: "string", short: "t" },
  },
  allowPositionals: true,
});

if (!values.city) {
  console.error("Usage: bun run pipeline --city <slug> [--days 14] [--tier 0|1|2|all]");
  process.exit(2);
}

applySchema();

const tierVal = values.tier;
const tier: 0 | 1 | 2 | "all" =
  tierVal === "all"
    ? "all"
    : tierVal === undefined
      ? "all"
      : (Number(tierVal) as 0 | 1 | 2);

const summary = await runPipeline({
  citySlug: values.city,
  windowDays: values.days ? Number(values.days) : 14,
  tier,
});

console.log(JSON.stringify(summary, null, 2));
