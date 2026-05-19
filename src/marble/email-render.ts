/**
 * Render a marble-scored event list into an email-ready (subject, htmlBody, textBody).
 *
 * Pure function — no IO, no DB, no network. Used by both the CLI (`bun run deliver`)
 * and any future scheduled-delivery harness.
 *
 * The "why" text on each event cites the recipient's profile elements (because the
 * scorer puts them there). The recipient IS the data owner — Gmail is their account
 * — so KG-derived rationale flowing into their own inbox is consented. Do NOT use
 * this renderer for any output destination that isn't the data owner's own channel.
 */
import type { ScoredEvent, ScoreResult } from "./scorer.ts";

export interface EmailContent {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailRenderOpts {
  cityName: string;
  cityTimezone: string;
  windowDays: number;
  threshold: number;
  /** how many sub-threshold "also considered" events to show; default 10 */
  alsoConsideredCount?: number;
}

export function renderEmail(result: ScoreResult, opts: EmailRenderOpts): EmailContent {
  const tail = result.scored
    .filter((e) => e.marble_score < result.meta.threshold)
    .slice(0, opts.alsoConsideredCount ?? 10);

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return {
    subject: buildSubject(result, opts, todayLabel),
    htmlBody: buildHtml(result.surfaced, tail, result, opts, todayLabel),
    textBody: buildText(result.surfaced, tail, result, opts, todayLabel),
  };
}

function buildSubject(result: ScoreResult, opts: EmailRenderOpts, today: string): string {
  const n = result.surfaced.length;
  if (n === 0) return `events x marble · ${opts.cityName} · quiet week (${result.scored.length} considered, none crossed ${opts.threshold})`;
  if (n === 1) return `events x marble · ${opts.cityName} · 1 event for you this week`;
  return `events x marble · ${opts.cityName} · ${n} events for the week of ${today}`;
}

function buildHtml(
  surfaced: ScoredEvent[],
  tail: ScoredEvent[],
  result: ScoreResult,
  opts: EmailRenderOpts,
  today: string,
): string {
  const c = palette();
  const css = `
    body { margin:0; padding:0; background:${c.pageBg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; color:${c.text}; }
    .wrap { max-width:640px; margin:0 auto; padding:24px 16px; }
    .meta { color:${c.muted}; font-size:13px; line-height:1.45; }
    .h1 { font-size:22px; font-weight:700; letter-spacing:-0.01em; margin:0 0 4px 0; color:${c.text}; }
    .sub { color:${c.muted}; font-size:13px; margin:0 0 24px 0; }
    .card { border:1px solid ${c.border}; border-radius:12px; padding:16px 18px; margin:0 0 14px 0; background:${c.cardBg}; }
    .badge { display:inline-block; background:${c.accent}; color:#fff; font-size:11px; padding:2px 8px; border-radius:999px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:6px; }
    .title { font-size:18px; font-weight:600; line-height:1.3; margin:0 0 6px 0; color:${c.text}; }
    .when  { font-size:13px; color:${c.muted}; margin:0 0 4px 0; }
    .where { font-size:13px; color:${c.muted}; margin:0 0 10px 0; }
    .why   { font-size:14px; line-height:1.5; padding:10px 12px; background:${c.whyBg}; border-left:3px solid ${c.accent}; border-radius:4px; margin:8px 0; color:${c.text}; }
    .actions { font-size:12px; color:${c.muted}; margin-top:8px; }
    .actions a { color:${c.link}; text-decoration:none; }
    .actions a:hover { text-decoration:underline; }
    .section-h { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${c.muted}; margin:32px 0 8px 0; }
    .tail-row { border-bottom:1px solid ${c.border}; padding:10px 0; font-size:13px; line-height:1.4; }
    .tail-row:last-child { border-bottom:0; }
    .tail-score { display:inline-block; min-width:36px; font-variant-numeric:tabular-nums; color:${c.muted}; font-weight:600; }
    .tail-title { color:${c.text}; }
    .tail-why { color:${c.muted}; font-style:italic; font-size:12px; margin-top:2px; }
    .footer { color:${c.muted}; font-size:11px; line-height:1.5; margin-top:36px; border-top:1px solid ${c.border}; padding-top:14px; }
    .quiet { padding:24px; text-align:center; color:${c.muted}; font-style:italic; border:1px dashed ${c.border}; border-radius:12px; }
  `.replace(/\s+/g, " ");

  const surfacedHtml =
    surfaced.length === 0
      ? `<div class="quiet">Nothing crossed the ${opts.threshold} threshold this week.<br/><br/>This is a feature — the system has taste and chose silence over noise. Sub-threshold honorable mentions below.</div>`
      : surfaced.map((e) => renderCard(e, opts.cityTimezone)).join("\n");

  const tailHtml =
    tail.length === 0
      ? ""
      : `
        <div class="section-h">Also considered (below threshold)</div>
        ${tail.map((e) => renderTailRow(e, opts.cityTimezone)).join("\n")}
      `;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>events x marble</title>
<style>${css}</style>
</head>
<body>
<div class="wrap">
  <p class="h1">events x marble</p>
  <p class="sub">${escapeHtml(opts.cityName)} · week of ${escapeHtml(today)} · scored against your marble KG · threshold ≥ ${opts.threshold.toFixed(2)}</p>

  ${surfacedHtml}

  ${tailHtml}

  <div class="footer">
    Scored ${result.scored.length} candidate event(s) from the ${opts.windowDays}-day window.
    Model: ${escapeHtml(result.meta.model_used)} · tokens: ${result.meta.tokens_used} · cost: $${result.meta.cost_usd.toFixed(4)}.<br/>
    KG: ${result.meta.kg_counts.beliefs} beliefs · ${result.meta.kg_counts.preferences} preferences · ${result.meta.kg_counts.identities} identities · ${result.meta.kg_counts.interests} interests · loaded read-only.<br/>
    To raise/lower the floor, change the threshold. To stop receiving these, unsubscribe at source.
  </div>
</div>
</body>
</html>`;
}

function renderCard(e: ScoredEvent, tz: string): string {
  const flame = e.marble_score >= 0.95 ? "🔥🔥" : "🔥";
  const day = new Date(e.starts_at).toLocaleDateString("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const time = new Date(e.starts_at).toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const venue = [e.venue_name, e.venue_address].filter(Boolean).join(" · ");
  const sourceText = e.source ? `source: ${escapeHtml(e.source)}` : "";
  const linkHtml = e.url ? `<a href="${escapeAttr(e.url)}">view source ↗</a>` : "";

  return `
    <div class="card">
      <span class="badge">${flame} marble ${e.marble_score.toFixed(2)}</span>
      <p class="title">${escapeHtml(e.title)}</p>
      <p class="when">${escapeHtml(day)} · ${escapeHtml(time)}</p>
      ${venue ? `<p class="where">${escapeHtml(venue)}</p>` : ""}
      <p class="why">${escapeHtml(e.why)}</p>
      <p class="actions">${[sourceText, linkHtml].filter(Boolean).join(" · ")}</p>
    </div>`;
}

function renderTailRow(e: ScoredEvent, tz: string): string {
  const day = new Date(e.starts_at).toLocaleDateString("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const link = e.url ? `<a href="${escapeAttr(e.url)}" style="color:inherit;text-decoration:none">${escapeHtml(e.title)}</a>` : escapeHtml(e.title);
  return `
    <div class="tail-row">
      <span class="tail-score">${e.marble_score.toFixed(2)}</span>
      <span class="tail-title"><strong>${escapeHtml(day)}</strong> — ${link}</span>
      <div class="tail-why">${escapeHtml(e.why)}</div>
    </div>`;
}

function buildText(
  surfaced: ScoredEvent[],
  tail: ScoredEvent[],
  result: ScoreResult,
  opts: EmailRenderOpts,
  today: string,
): string {
  const lines: string[] = [];
  lines.push(`events x marble`);
  lines.push(`${opts.cityName} · week of ${today} · threshold ≥ ${opts.threshold.toFixed(2)}`);
  lines.push(`(${opts.windowDays}-day window, ${result.scored.length} candidates scored)`);
  lines.push("");

  if (surfaced.length === 0) {
    lines.push(`Nothing crossed the ${opts.threshold} threshold this week.`);
    lines.push("This is a feature — the system has taste and chose silence over noise.");
  } else {
    lines.push(`>> ${surfaced.length} event${surfaced.length === 1 ? "" : "s"} for you this week:`);
    lines.push("");
    for (const e of surfaced) {
      const day = new Date(e.starts_at).toLocaleDateString("en-GB", {
        timeZone: opts.cityTimezone,
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
      const time = new Date(e.starts_at).toLocaleTimeString("en-GB", {
        timeZone: opts.cityTimezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const flame = e.marble_score >= 0.95 ? "🔥🔥" : "🔥";
      lines.push(`${flame} ${e.title}  [marble ${e.marble_score.toFixed(2)}]`);
      lines.push(`   ${day} · ${time}`);
      if (e.venue_name) lines.push(`   ${[e.venue_name, e.venue_address].filter(Boolean).join(" · ")}`);
      lines.push(`   why: ${e.why}`);
      if (e.url) lines.push(`   ${e.url}`);
      lines.push("");
    }
  }

  if (tail.length > 0) {
    lines.push("--- also considered (below threshold) ---");
    for (const e of tail) {
      const day = new Date(e.starts_at).toLocaleDateString("en-GB", {
        timeZone: opts.cityTimezone,
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
      lines.push(`  ${e.marble_score.toFixed(2)}  ${day}  ${e.title}`);
      lines.push(`        ${e.why}`);
    }
    lines.push("");
  }

  lines.push("--");
  lines.push(`Model: ${result.meta.model_used} · tokens: ${result.meta.tokens_used} · cost: $${result.meta.cost_usd.toFixed(4)}`);
  lines.push(`KG: ${result.meta.kg_counts.beliefs}b/${result.meta.kg_counts.preferences}p/${result.meta.kg_counts.identities}id/${result.meta.kg_counts.interests}i (read-only)`);
  return lines.join("\n");
}

function palette() {
  return {
    pageBg: "#f5f5f4",
    cardBg: "#ffffff",
    whyBg: "#fff8e1",
    text: "#0f1115",
    muted: "#6b6f78",
    border: "#e4e4e7",
    accent: "#f59e0b",
    link: "#b45309",
  };
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
