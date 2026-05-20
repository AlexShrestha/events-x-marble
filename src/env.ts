import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().default("sqlite://./data.db"),
  PORT: z.coerce.number().int().positive().default(3000),
  ADMIN_TOKEN: z.string().min(8).default("dev-token-change-me"),
  // OpenCode Zen — primary LLM gateway. Free models for Tier 1, Haiku for Tier 2.
  OPENCODE_API_KEY: z.string().optional(),
  OPENCODE_BASE_URL: z.string().default("https://opencode.ai/zen/v1"),
  // Direct Anthropic — optional, only if you want to bypass Zen for Claude calls.
  ANTHROPIC_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),

  // Per-deployment identity. Used in outbound User-Agent strings.
  // KEEP OUT OF GIT. Set in .env; fallback is a generic placeholder.
  CONTACT_EMAIL: z.string().email().optional(),

  // Path to the deployment's marble knowledge-graph JSON file (read-only).
  // KEEP OUT OF GIT. Per-deployment; the engine never persists KG content back to its own DB.
  MARBLE_KG_PATH: z.string().optional(),

  // Shared secret for personalized routes (/me/*). Calendar apps can't add headers,
  // so we pass it as a query param. URL = private capability link.
  // KEEP OUT OF GIT. Generate with `openssl rand -hex 24`.
  ME_TOKEN: z.string().optional(),

  // Turso (libSQL) for the hosted Vercel deploy. Absence → falls back to file:./data.db.
  TURSO_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),

  // Public site base URL — used by the local push-picks CLI to POST the rent payload.
  // Default points at the production deploy; override in private/.env.local for staging.
  SITE_URL: z.string().default("https://events.timesmarble.com"),

  // The "legacy user id" that env-backed personalization resolves to in Stage 0
  // (before the v3 users table exists). Default 'alex' so existing flows keep working.
  // See src/marble/user.ts.
  DEFAULT_USER_ID: z.string().default("alex"),

  // HMAC key for v3 per-user session cookies (mb_user). Optional — if unset,
  // src/auth/session.ts derives a key from sha256(ME_TOKEN + salt). Set this
  // explicitly to rotate per-user sessions independently of ME_TOKEN. Generate
  // with `openssl rand -hex 32`.
  AUTH_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);
