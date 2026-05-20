import type { FC } from "hono/jsx";

/**
 * Rendered when a user is authed on /me but their CLI hasn't reported `ready`
 * yet — i.e. they're missing a key, the install is still ingesting/learning,
 * or something failed. The events dashboard is intentionally gated behind
 * onboarding_state='ready' so we never show "your picks" while the laptop is
 * still computing them.
 */

interface StatusLogEntry {
  state: string;
  message: string | null;
  error_category: string | null;
  created_at: string;
}

interface Props {
  state: string;
  errorCategory?: string | null;
  message?: string | null;
  updatedAt?: string | null;
  displayName?: string | null;
  log?: StatusLogEntry[];
}

const STATE_TITLE: Record<string, string> = {
  new: "Hold on — your laptop hasn't checked in yet",
  key_missing: "Set your LLM API key",
  kg_missing: "We couldn't find your marble KG",
  ingesting: "Building your knowledge graph…",
  learning: "Synthesising patterns from your data…",
  scoring: "Scoring this week's events for you…",
  pushing: "Uploading your picks…",
  error: "Something went wrong during setup",
  ready: "Ready", // shouldn't render here; guarded by /me handler
};

const STATE_BODY: Record<string, string> = {
  new: "We registered your account but your `events-x-marble` install hasn't reported back. If you've just pasted the install command, give it ~30 seconds. If nothing happens, the install probably failed silently — re-run the command from /connect.",
  key_missing:
    "Your laptop's `events-x-marble` is installed and registered, but the LLM API key environment variable isn't set in your shell. Without it, we can't score events against your KG, so you can't use the personalised dashboard yet.",
  kg_missing:
    "Your laptop is registered but doesn't have a marble knowledge graph file yet. Run `marble init` + `marble ingest <your data>` + `marble learn`, then come back and run `events-x-marble run`.",
  ingesting:
    "Your laptop is currently feeding your data into marble. This usually takes 1–5 minutes depending on how much data you're ingesting. This page refreshes automatically — come back in a few minutes.",
  learning:
    "Marble is synthesising patterns across your knowledge graph (beliefs, preferences, interests, traits). This typically takes 3–10 minutes. This page refreshes automatically.",
  scoring:
    "Your laptop is scoring this week's events against your KG. Should take ~30 seconds. Hang tight — this page refreshes automatically.",
  pushing: "Uploading your picks. Almost done.",
  error: "",
  ready: "",
};

const ERROR_HELP: Record<string, string> = {
  key_invalid:
    "The LLM gateway rejected your API key. Open your shell, check the value of the API key environment variable (paste it into a private place to verify it matches what your provider gave you), then re-run `events-x-marble run`.",
  kg_load_failed:
    "We couldn't read your marble-kg.json. Check the file exists and is valid JSON.",
  kg_invalid: "Your KG file is shaped wrong. Try `marble learn` to rebuild.",
  ingest_failed:
    "Marble couldn't ingest your data. Email us with the message below — we'll triage.",
  learn_failed: "Marble crashed during the learn step. Please email us.",
  score_failed:
    "The scoring LLM call failed for a reason that wasn't auth-related (rate limit, network, schema mismatch). Try re-running `events-x-marble run`; if it persists, email us.",
  push_failed: "Couldn't upload your picks. Check your connection and re-run.",
  network: "Network error reaching the server. Check your connection and try again.",
  unknown: "An unexpected error. Please email us so we can dig in.",
};

export const MeState: FC<Props> = ({
  state,
  errorCategory,
  message,
  updatedAt,
  displayName,
  log,
}) => {
  const title = STATE_TITLE[state] ?? `Onboarding state: ${state}`;
  const body = STATE_BODY[state] ?? "";
  const isError = state === "error";
  const isWorking = ["ingesting", "learning", "scoring", "pushing", "new"].includes(state);
  const isBlocked = ["key_missing", "kg_missing"].includes(state);
  const errorHelpText = isError ? ERROR_HELP[errorCategory ?? "unknown"] ?? ERROR_HELP.unknown : "";
  const supportLink = buildSupportLink({ state, errorCategory, message, displayName });

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} · Events × Marble</title>
        {/* Auto-refresh while we're working — server-side, no JS required */}
        {isWorking ? <meta http-equiv="refresh" content="5" /> : null}
        <style>{css}</style>
      </head>
      <body>
        <main class="page">
          <header class="hdr">
            <a class="brand" href="/">Events × Marble</a>
            <a class="hdr-link" href="/events">Browse public events</a>
          </header>

          <section class={`card kind-${kindClass(state)}`}>
            <div class="indicator">
              {isWorking ? <div class="spinner" /> : null}
              {isError ? <div class="x-mark">✗</div> : null}
              {isBlocked ? <div class="bang">!</div> : null}
            </div>
            <h1>{title}</h1>
            {body ? <p class="body">{body}</p> : null}

            {isError ? (
              <>
                <p class="body">{errorHelpText}</p>
                {message ? <pre class="err-msg">{message}</pre> : null}
                <a class="cta" href={supportLink}>
                  Email us about this issue
                </a>
              </>
            ) : null}

            {isBlocked ? (
              <p class="hint">
                Re-run <code>events-x-marble run</code> on your laptop once
                you've fixed it. This page will refresh itself when your laptop
                reports back.
              </p>
            ) : null}

            {updatedAt ? (
              <p class="ts">Last update from your laptop: {formatTimeAgo(updatedAt)}</p>
            ) : null}
          </section>

          {log && log.length > 0 ? (
            <details class="log">
              <summary>Recent activity log (newest first)</summary>
              <ol>
                {log.map((entry) => (
                  <li>
                    <span class={`pill pill-${kindClass(entry.state)}`}>{entry.state}</span>
                    {entry.error_category ? (
                      <span class="pill pill-error">{entry.error_category}</span>
                    ) : null}
                    <span class="log-msg">{entry.message ?? ""}</span>
                    <time>{entry.created_at}</time>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}

          <footer class="ftr">
            <a href="/events">Browse public events</a>
            <span class="dot">·</span>
            <a href="/connect">Re-run the connect flow</a>
          </footer>
        </main>
      </body>
    </html>
  );
};

function kindClass(state: string): string {
  if (state === "error") return "err";
  if (["key_missing", "kg_missing"].includes(state)) return "block";
  if (["ingesting", "learning", "scoring", "pushing", "new"].includes(state)) return "work";
  return "ready";
}

function formatTimeAgo(iso: string): string {
  // Server-side rendering — give an approximate relative phrase. The auto-refresh
  // meta tag keeps the value reasonably fresh.
  try {
    const parsed = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
    const diff = Math.max(0, Date.now() - parsed.getTime());
    if (diff < 60_000) return "just now";
    if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / 3_600_000)} h ago`;
    return parsed.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function buildSupportLink({
  state,
  errorCategory,
  message,
  displayName,
}: {
  state: string;
  errorCategory?: string | null;
  message?: string | null;
  displayName?: string | null;
}): string {
  const subject = `events-x-marble setup issue (${errorCategory ?? state})`;
  const body = [
    `Hi,`,
    ``,
    `I'm having trouble with events-x-marble.`,
    ``,
    `state: ${state}`,
    `error_category: ${errorCategory ?? "(none)"}`,
    `display_name: ${displayName ?? "(none)"}`,
    `detail: ${message ?? "(no message)"}`,
    ``,
    `Thanks!`,
  ].join("\n");
  return `mailto:alex@timesmarble.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const css = `
  :root {
    --bg: #0d0f13; --bg-2: #131720; --fg: #e7e9ee; --fg-2: #b6bcc8;
    --muted: #6c7384; --accent: #f59e0b; --green: #10b981; --red: #ef4444;
    --amber: #fbbf24; --border: #1f2430; --card: #161a23;
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background: var(--bg); color: var(--fg);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    line-height: 1.55; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px; font-size: 0.92em; }

  .page { max-width: 680px; margin: 0 auto; padding: 32px 24px 80px; }

  .hdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 64px; }
  .brand { font-weight: 700; font-size: 16px; color: var(--fg); }
  .brand:hover { color: var(--accent); text-decoration: none; }
  .hdr-link { font-size: 13px; color: var(--muted); }

  .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 40px 32px; position: relative; }
  .card.kind-work  { border-left: 3px solid var(--accent); }
  .card.kind-err   { border-left: 3px solid var(--red); }
  .card.kind-block { border-left: 3px solid var(--amber); }
  .card.kind-ready { border-left: 3px solid var(--green); }

  .indicator { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .spinner { width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid var(--border); border-top-color: var(--accent);
    animation: spin 1s linear infinite; }
  .x-mark, .bang { width: 22px; height: 22px; border-radius: 50%;
    color: #0d0f13; font-weight: 800; font-size: 14px;
    display: flex; align-items: center; justify-content: center; }
  .x-mark { background: var(--red); }
  .bang   { background: var(--amber); }
  @keyframes spin { to { transform: rotate(360deg); } }

  .card h1 { font-size: 24px; margin: 0 0 12px 0; letter-spacing: -0.01em; font-weight: 700; }
  .card .body { color: var(--fg-2); font-size: 15px; margin: 0 0 16px 0; }
  .card .hint { color: var(--muted); font-size: 13px; margin: 16px 0 0 0; }
  .card .ts   { color: var(--muted); font-size: 12px; margin-top: 16px; }

  .err-msg { background: var(--bg-2); padding: 12px; border-radius: 6px;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px;
    color: var(--fg-2); border-left: 2px solid var(--red);
    overflow-x: auto; margin: 12px 0; white-space: pre-wrap; word-break: break-word; }

  .cta { display: inline-block; background: var(--accent); color: #0d0f13;
    padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 8px; }
  .cta:hover { filter: brightness(1.1); text-decoration: none; }

  .log { margin-top: 28px; }
  .log summary { color: var(--muted); font-size: 12px; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.08em; }
  .log summary:hover { color: var(--fg-2); }
  .log ol { list-style: none; padding: 12px 0 0 0; margin: 0; }
  .log li { padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: 13px;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .log li time { color: var(--muted); font-size: 11px; margin-left: auto;
    font-family: ui-monospace, "SF Mono", monospace; }
  .log .log-msg { color: var(--fg-2); font-size: 13px; min-width: 0; flex: 1; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  .pill-work  { background: rgba(245, 158, 11, 0.15); color: var(--accent); }
  .pill-err, .pill-error { background: rgba(239, 68, 68, 0.15); color: var(--red); }
  .pill-block { background: rgba(251, 191, 36, 0.15); color: var(--amber); }
  .pill-ready { background: rgba(16, 185, 129, 0.15); color: var(--green); }

  .ftr { margin-top: 48px; color: var(--muted); font-size: 12px; text-align: center; }
  .ftr a { color: var(--muted); }
  .ftr a:hover { color: var(--fg-2); }
  .ftr .dot { margin: 0 10px; }
`;
