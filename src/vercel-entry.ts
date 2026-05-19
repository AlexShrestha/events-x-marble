/**
 * esbuild entry for the Vercel deploy. Bundled into api/index.mjs.
 * Single-arg Fetch-style handler so @vercel/node detects signature unambiguously.
 */
import { app } from "./app.tsx";

export default async function handler(request: Request): Promise<Response> {
  return app.fetch(request);
}
