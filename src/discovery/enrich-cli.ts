import { parseArgs } from "node:util";
import { applySchema } from "../db/index.ts";
import { enrichRecentEvents } from "./tier2-enrich.ts";

const { values } = parseArgs({
  options: {
    limit: { type: "string", short: "l" },
    "dry-run": { type: "boolean", short: "n", default: false },
  },
  allowPositionals: false,
});

applySchema();

const limit = values.limit ? Number(values.limit) : undefined;
const dryRun = values["dry-run"] ?? false;

if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
  console.error("Error: --limit must be a positive integer");
  process.exit(2);
}

const result = await enrichRecentEvents({ limit, dryRun });

console.log(JSON.stringify(result, null, 2));
