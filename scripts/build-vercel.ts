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
// Catch-all filename: Vercel's pattern for "every URL → this function".
const OUT = "api/[...path].mjs";
const MAP = "api/[...path].mjs.map";
if (existsSync(OUT)) rmSync(OUT);
if (existsSync(MAP)) rmSync(MAP);
if (existsSync("api/index.mjs")) rmSync("api/index.mjs");
if (existsSync("api/index.mjs.map")) rmSync("api/index.mjs.map");
if (existsSync("api/[[...path]].mjs")) rmSync("api/[[...path]].mjs");
if (existsSync("api/[[...path]].mjs.map")) rmSync("api/[[...path]].mjs.map");

const result = await build({
  entryPoints: ["src/vercel-entry.ts"],
  outfile: OUT,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // Node runtime — let Vercel install deps from package.json, keep them external.
  // Excludes the few deps that won't reach the Vercel deploy anyway.
  // Bundle libsql inline (it has optional WS sub-deps that Vercel's installer
  // skips, causing missing-module errors). Keep heavyweight node-only deps
  // that aren't reached in the request path external (nodemailer, playwright).
  external: ["nodemailer", "playwright", "node:*"],
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
