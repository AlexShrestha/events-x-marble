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
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

export function sqlitePath(): string {
  const url = env.DATABASE_URL;
  if (!url.startsWith("sqlite://")) {
    throw new Error(
      `DATABASE_URL must start with sqlite:// for v1 (got: ${url.slice(0, 12)}...). Postgres support arrives when we move to Supabase.`,
    );
  }
  return url.slice("sqlite://".length);
}
