/**
 * Bun local-dev server. Wraps the shared Hono app from src/app.tsx in Bun.serve.
 * For Vercel deploy, see api/index.ts which wraps the same app via hono/vercel.
 */
import { env } from "./env.ts";
import { app } from "./app.tsx";

const port = env.PORT;
console.log(`Events x Marble listening on http://localhost:${port}`);

export default {
  port,
  // Personalized routes (marble scoring) take ~30s. Bun default 10s is too tight.
  idleTimeout: 120,
  fetch: app.fetch,
};
