import type { FC } from "hono/jsx";
import { BASE_CSS, Footer, NavBar, Page, PageHead, SectionLabel } from "./theme.tsx";

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
  new: "hold on — your laptop hasn't checked in yet",
  key_missing: "set your LLM API key",
  kg_missing: "no marble KG yet",
  ingesting: "building your knowledge graph",
  learning: "marble inference pipeline running",
  scoring: "scoring this week's events",
  pushing: "uploading your picks",
  error: "something went wrong",
  ready: "ready",
};

const STATE_BODY: Record<string, string> = {
  new: "We registered your account but your events × marble install hasn't reported back. If you've just pasted the install command, give it ~30 seconds. If nothing happens, the install probably failed silently — re-run from /connect.",
  key_missing:
    "Your laptop is installed and registered, but the LLM API key env var isn't set in your shell. Export it and re-run `events-x-marble run`.",
  kg_missing:
    "Your laptop is registered but has no marble knowledge graph. Re-run from /connect with `EXM_BUILD_FROM=/path/to/your-data.json` to bootstrap one.",
  ingesting:
    "Your laptop is feeding your data into marble (~1–2 min). This page refreshes automatically.",
  learning:
    "Marble's inference pipeline is running locally: L1.5 insight swarm → L2 inference → L3 clone evolution → adaptive committee → second learn pass. Total ~3–6 min.",
  scoring:
    "Scoring this week's events against your KG. ~30 seconds.",
  pushing: "Uploading your picks. Almost done.",
  error: "",
  ready: "",
};

const ERROR_HELP: Record<string, string> = {
  key_invalid:
    "The LLM gateway rejected your API key. Verify the env var matches what your provider gave you, then re-run.",
  kg_load_failed:
    "We couldn't read your marble-kg.json. Check the file exists and is valid JSON.",
  kg_invalid: "Your KG file is shaped wrong. Re-run with EXM_BUILD_FROM to rebuild.",
  ingest_failed:
    "Marble couldn't ingest your data. Email us with the message below.",
  learn_failed: "Marble crashed during the learn step. Email us.",
  score_failed:
    "The scoring LLM call failed for a non-auth reason. Try re-running; if persistent, email us.",
  push_failed: "Couldn't upload your picks. Check your connection and re-run.",
  network: "Network error reaching the server.",
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
  const title = STATE_TITLE[state] ?? `state: ${state}`;
  const body = STATE_BODY[state] ?? "";
  const isError = state === "error";
  const isWorking = ["ingesting", "learning", "scoring", "pushing", "new"].includes(state);
  const isBlocked = ["key_missing", "kg_missing"].includes(state);
  const errorHelpText = isError ? ERROR_HELP[errorCategory ?? "unknown"] ?? ERROR_HELP.unknown : "";
  const supportLink = buildSupportLink({ state, errorCategory, message, displayName });

  return (
    <html lang="en">
      <head>
        <PageHead title={`${title} · events × marble`} />
        {isWorking ? <meta http-equiv="refresh" content="5" /> : null}
        <style>{BASE_CSS}</style>
        <style>{ME_STATE_CSS}</style>
      </head>
      <body>
        <Page>
          <NavBar activePath="/me" />

          <section class={`state-card kind-${kindClass(state)}`}>
            <SectionLabel num="01" title={state} />
            <div class="indicator-row">
              <div class="indicator">
                {isWorking ? <div class="spinner" /> : null}
                {isError ? <div class="x-mark">✗</div> : null}
                {isBlocked ? <div class="bang">!</div> : null}
              </div>
              <h1>{title}</h1>
            </div>
            {body ? <p class="body">{body}</p> : null}

            {isError ? (
              <>
                <p class="body">{errorHelpText}</p>
                {message ? <pre class="err-msg">{message}</pre> : null}
                <a class="btn" href={supportLink}>email us about this</a>
              </>
            ) : null}

            {isBlocked ? (
              <p class="hint">
                Re-run <code>events-x-marble run</code> on your laptop once you've
                fixed this. The page will refresh automatically when your laptop
                reports back.
              </p>
            ) : null}

            {updatedAt ? (
              <p class="ts">last update from your laptop: {formatTimeAgo(updatedAt)}</p>
            ) : null}
          </section>

          {log && log.length > 0 ? (
            <details class="log">
              <summary>recent activity log (newest first)</summary>
              <ol>
                {log.map((entry) => (
                  <li>
                    <span class={`pill pill-${kindClass(entry.state)}`}>{entry.state}</span>
                    {entry.error_category ? (
                      <span class="pill pill-err">{entry.error_category}</span>
                    ) : null}
                    <span class="log-msg">{entry.message ?? ""}</span>
                    <time>{entry.created_at}</time>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}

          <Footer />
        </Page>
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
  const subject = `events × marble setup issue (${errorCategory ?? state})`;
  const body = [
    `Hi,`,
    ``,
    `I'm having trouble with events × marble.`,
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

const ME_STATE_CSS = `
  .state-card {
    border: 1px solid var(--line);
    padding: 40px 32px;
    background: var(--bg-2);
    margin-top: 24px;
  }
  .state-card.kind-work  { border-left: 2px solid var(--fg); }
  .state-card.kind-err   { border-left: 2px solid var(--err); }
  .state-card.kind-block { border-left: 2px solid var(--warn); }
  .state-card.kind-ready { border-left: 2px solid var(--ok); }

  .indicator-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .indicator { display: inline-flex; align-items: center; }
  .spinner { width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid var(--line); border-top-color: var(--fg);
    animation: spin 1s linear infinite; }
  .x-mark, .bang {
    width: 20px; height: 20px; border-radius: 50%;
    color: var(--bg); font-weight: 700; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .x-mark { background: var(--err); }
  .bang   { background: var(--warn); }
  @keyframes spin { to { transform: rotate(360deg); } }

  .state-card h1 { font-size: 36px; font-weight: 300; }
  .state-card .body { color: var(--fg-2); font-size: 15px; margin: 0 0 16px 0; max-width: 600px; }
  .state-card .hint { color: var(--muted); font-size: 13px; margin: 16px 0 0; }
  .state-card .ts   { color: var(--muted); font-size: 12px; margin-top: 20px; font-family: var(--mono); }

  .err-msg {
    background: var(--bg-3); padding: 12px;
    font-family: var(--mono); font-size: 12px;
    color: var(--fg-2); border-left: 2px solid var(--err);
    overflow-x: auto; margin: 12px 0; white-space: pre-wrap; word-break: break-word;
  }

  .log { margin-top: 48px; }
  .log summary {
    font-family: var(--mono); color: var(--muted); font-size: 12px;
    cursor: pointer; text-transform: lowercase; padding: 6px 0;
  }
  .log summary:hover { color: var(--fg); }
  .log ol { list-style: none; padding: 12px 0 0; margin: 0; }
  .log li {
    padding: 8px 0; border-bottom: 1px solid var(--line);
    font-size: 13px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .log time { color: var(--muted); font-family: var(--mono); font-size: 11px; margin-left: auto; }
  .log .log-msg { color: var(--fg-2); flex: 1; min-width: 0; }
  .pill {
    display: inline-block; padding: 2px 8px; font-size: 10px;
    font-family: var(--mono); font-weight: 500;
    border: 1px solid var(--line); text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .pill-work  { color: var(--fg); }
  .pill-err   { color: var(--err); border-color: rgba(239,68,68,0.4); }
  .pill-block { color: var(--warn); border-color: rgba(251,191,36,0.4); }
  .pill-ready { color: var(--ok); border-color: rgba(16,185,129,0.4); }
`;
