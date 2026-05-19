import { Hono } from "hono";
import { listCities } from "../db/queries.ts";

export const cities = new Hono();

cities.get("/", async (c) => {
  const rows = await listCities();
  return c.json({
    cities: rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      country_code: r.country_code,
      timezone: r.timezone,
      bbox:
        r.bbox_min_lng != null &&
        r.bbox_min_lat != null &&
        r.bbox_max_lng != null &&
        r.bbox_max_lat != null
          ? [r.bbox_min_lng, r.bbox_min_lat, r.bbox_max_lng, r.bbox_max_lat]
          : null,
      centroid:
        r.centroid_lng != null && r.centroid_lat != null
          ? [r.centroid_lng, r.centroid_lat]
          : null,
    })),
  });
});
