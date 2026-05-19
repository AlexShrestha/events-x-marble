/**
 * Vercel serverless function entry — wraps the shared Hono app via hono/vercel.
 * All paths (/, /api/*, /healthz, /calendar.ics, /me/calendar.ics) route through
 * here, courtesy of the catch-all rewrite in vercel.json.
 *
 * Runtime: Node.js 20+. Avoid Edge: @libsql/client needs Node Buffer / net APIs.
 */
import { handle } from "hono/vercel";
import { app } from "../src/app.tsx";

export const config = {
  runtime: "nodejs",
  // Public-surface scoring is light (no LLM calls on the deployed app), so
  // default 10s is fine. If we ever expose /me/* on Vercel we'd bump this.
};

export default handle(app);
