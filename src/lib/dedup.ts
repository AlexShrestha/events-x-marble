import { createHash } from "node:crypto";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateBucketHour(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 13);
}

export function dedupHash(input: {
  title: string;
  starts_at: string;
  venue_name?: string | null;
}): string {
  const key = [
    normalize(input.title),
    dateBucketHour(input.starts_at),
    normalize(input.venue_name ?? ""),
  ].join("|");
  return createHash("sha256").update(key).digest("hex");
}
