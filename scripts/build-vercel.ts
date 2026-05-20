/**
 * Bundles api/index.ts into a single api/index.mjs file using esbuild.
 * Vercel's per-file transpile doesn't handle our .tsx + .ts imports cleanly,
 * so we pre-bundle locally and let Vercel ship the .mjs verbatim.
 *
 * Run via `bun run build` (Vercel invokes this automatically pre-deploy).
 */
import { build } from "esbuild";
import { rmSync, existsSync } from "node:fs";

// Clean any prior output so Vercel sees only the bundled artifact.
const OUT = "api/index.mjs";
const MAP = "api/index.mjs.map";
for (const p of [
  OUT,
  MAP,
  "api/[...path].mjs",
  "api/[...path].mjs.map",
  "api/[[...path]].mjs",
  "api/[[...path]].mjs.map",
]) {
  if (existsSync(p)) rmSync(p);
}

const result = await build({
  entryPoints: ["src/vercel-entry.ts"],
  outfile: OUT,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // Node runtime — let Vercel install deps from package.json, keep them external.
  // Bundle libsql inline (it has optional WS sub-deps that Vercel's installer
  // skips, causing missing-module errors). Keep heavyweight node-only deps
  // that aren't reached in the request path external (playwright).
  external: ["playwright", "node:*"],
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  jsx: "automatic",
  jsxImportSource: "hono/jsx",
  // Embed schema.sql as a string literal so applySchema works without disk reads.
  loader: { ".sql": "text" },
  sourcemap: true,
  logLevel: "info",
});

console.log(
  `[build-vercel] api/index.mjs built. warnings=${result.warnings.length} errors=${result.errors.length}`,
);
if (result.errors.length > 0) process.exit(1);
