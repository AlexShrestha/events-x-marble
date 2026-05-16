import { Hono } from "hono";
import { env } from "../env.ts";
import { runPipeline } from "../discovery/pipeline.ts";

export const admin = new Hono();

admin.use("*", async (c, next) => {
  const token = c.req.header("X-Admin-Token");
  if (!token || token !== env.ADMIN_TOKEN) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
});

admin.post("/runs/:city", async (c) => {
  const citySlug = c.req.param("city");
  const tierRaw = c.req.query("tier");
  const daysRaw = c.req.query("days");
  const tier: 0 | 1 | 2 | "all" =
    tierRaw === undefined || tierRaw === "all"
      ? "all"
      : (Number(tierRaw) as 0 | 1 | 2);
  try {
    const summary = await runPipeline({
      citySlug,
      windowDays: daysRaw ? Number(daysRaw) : 14,
      tier,
    });
    return c.json(summary);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: "pipeline_failed", message }, 500);
  }
});

admin.post("/sources", (c) => {
  return c.json(
    {
      error: "not_implemented",
      message: "Use db/seed.ts or raw SQL for now. Source registry editing API lands later.",
    },
    501,
  );
});
