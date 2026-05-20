import type { FC } from "hono/jsx";

interface Props {
  /** Auto-detected from UA at render time. */
  os: "macos" | "linux" | "windows" | "other";
  /** Public site URL (e.g. https://events.timesmarble.com). */
  siteUrl: string;
}

export const Connect: FC<Props> = ({ os, siteUrl }) => {
  // The install command embeds a freshly-minted connect session id at runtime
  // (the client script fetches /api/v1/connect/new on load and substitutes it
  // into the visible command + the Copy button output).
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Connect — Events × Marble</title>
        <style>{css}</style>
      </head>
      <body>
        <main class="page">
          <header class="hdr">
            <a class="brand" href="/">Events × Marble</a>
            <a class="hdr-link" href="/events">Browse events</a>
          </header>

          <section class="hero">
            <h1>Connect your marble</h1>
            <p class="lede">
              One command. Your knowledge graph and LLM key stay on your laptop —
              we only ever see your weekly picks.
            </p>
          </section>

          <section class="step">
            <div class="step-hd">
              <span class="step-num">1</span>
              <h2>Copy the install command</h2>
            </div>
            <div class="os-pill" data-os={os}>
              {osLabel(os)} detected
              {os === "other" || os === "windows" ? (
                <span class="os-warn"> · only macOS &amp; Linux work today</span>
              ) : null}
            </div>
            <div class="cmd-wrap">
              <pre
                class="cmd"
                id="cmd"
                data-template={`curl -fsSL ${siteUrl.replace(/\/$/, "")}/install?session=__SESSION__ | bash`}
              >
                <span class="prompt">$ </span>
                <span class="cmd-body" id="cmdBody">
                  curl -fsSL {siteUrl.replace(/\/$/, "")}/install?session=
                  <span class="ph">…</span> | bash
                </span>
              </pre>
              <button class="copy" id="copyBtn" type="button">
                Copy
              </button>
            </div>
            <p class="hint">Open Terminal · paste this line · hit Enter.</p>
          </section>

          <section class="step" id="step2">
            <div class="step-hd">
              <span class="step-num">2</span>
              <h2>Waiting for your laptop…</h2>
            </div>
            <div class="status" id="status">
              <div class="spinner" id="spinner" />
              <div class="status-text" id="statusText">
                Watching for the install to complete (auto-refresh every 2&nbsp;seconds).
              </div>
            </div>
          </section>

          <section class="reassurance">
            <h3>What happens when you run that command</h3>
            <ul>
              <li>
                <code>events-x-marble</code> installs into{" "}
                <code>~/.events-x-marble/</code> on your laptop.
              </li>
              <li>
                Your marble knowledge graph and LLM API key stay on your laptop —
                never sent to our server.
              </li>
              <li>
                After install, the laptop sends only a sanitized "picks" payload
                (event IDs + short rationales) to your row on this site.
              </li>
              <li>
                This tab refreshes itself the moment the laptop checks in — no
                need to copy any URL back.
              </li>
            </ul>
          </section>

          <footer class="ftr">
            <a href="/events">Browse public events instead</a>
            <span class="dot">·</span>
            <a href="/privacy">Privacy</a>
          </footer>
        </main>

        {/* Bootstrap script — fetches a connect session id, fills the command, polls for completion */}
        <script
          // eslint-disable-next-line react/no-danger -- intentional inline boot script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var cmdBody = document.getElementById('cmdBody');
  var cmdEl   = document.getElementById('cmd');
  var copyBtn = document.getElementById('copyBtn');
  var statusText = document.getElementById('statusText');
  var spinner = document.getElementById('spinner');
  var step2   = document.getElementById('step2');
  var pollHandle = null;
  var sessionId = null;
  var template = cmdEl.getAttribute('data-template');

  function renderCmd(sid){
    var line = template.replace('__SESSION__', sid);
    cmdBody.textContent = line;
  }
  function setStatus(text, kind){
    statusText.textContent = text;
    // Reset modifier classes so transitions back to 'pending' work
    spinner.classList.remove('done','err','block');
    step2.classList.remove('done','err','block');
    if (kind === 'connected') {
      spinner.classList.add('done');
      step2.classList.add('done');
    } else if (kind === 'error') {
      spinner.classList.add('err');
      step2.classList.add('err');
    } else if (kind === 'block') {
      // User needs to take an action on the laptop (set the key, install marble)
      spinner.classList.add('block');
      step2.classList.add('block');
    }
  }
  copyBtn.addEventListener('click', function(){
    var text = cmdBody.textContent.trim();
    if (!navigator.clipboard) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e){}
      ta.remove();
    } else {
      navigator.clipboard.writeText(text);
    }
    copyBtn.textContent = 'Copied';
    setTimeout(function(){ copyBtn.textContent='Copy'; }, 1400);
  });

  var STATE_LABEL = {
    new:           'Connecting your laptop…',
    pending:       'Waiting for the install command to run…',
    key_missing:   'Your LLM API key isn\\'t set on your laptop. Export it and re-run \`events-x-marble run\`.',
    kg_missing:    'We couldn\\'t find your marble KG file. Run marble first, or use \`events-x-marble add-data\` (coming soon).',
    ingesting:     'Building your knowledge graph from your data… (this can take a few minutes)',
    learning:      'Synthesising patterns in your KG… (this takes a few minutes)',
    scoring:       'Scoring this week\\'s events against your KG…',
    pushing:       'Uploading your picks…',
    ready:         'Done — redirecting to your dashboard…',
    error:         'Something went wrong.'
  };

  var ERROR_HELP = {
    key_invalid:   'Your LLM gateway rejected the API key. Double-check the value of the env var and re-run \`events-x-marble run\`.',
    kg_load_failed:'We couldn\\'t read your marble-kg.json. Check the file is valid JSON and re-run.',
    kg_invalid:    'The KG file didn\\'t look like a marble user object. Re-run marble to rebuild it.',
    ingest_failed: 'Marble failed to ingest your data. Email us with the error message below.',
    learn_failed:  'Marble failed during the learn step. Email us with the error message below.',
    score_failed:  'The scoring LLM call failed (not auth-related). Email us with the error below.',
    push_failed:   'Couldn\\'t upload your picks. Check your connection and re-run \`events-x-marble run\`.',
    network:       'Network error reaching the server. Check your connection and re-run.',
    unknown:       'An unexpected error. Please email us so we can fix it.'
  };

  function startPolling(){
    var lastSubState = null;
    pollHandle = setInterval(async function(){
      try {
        var res = await fetch('/api/v1/connect/status?session=' + encodeURIComponent(sessionId), { cache: 'no-store' });
        if (res.status === 410) { setStatus('This setup session expired (30 min). Refresh this page to start over.', 'error'); clearInterval(pollHandle); return; }
        if (!res.ok) { return; /* keep polling */ }
        var body = await res.json();
        if (!body) return;

        // States from the server:
        //   status='pending'  → CLI not registered yet
        //   status='working'  → CLI registered, sub_state in [key_missing|kg_missing|ingesting|learning|scoring|pushing]
        //   status='ready'    → CLI reported ready, server returns redirect URL
        //   status='error'    → CLI reported error, body has error_category + message
        if (body.status === 'ready' && body.redirect) {
          clearInterval(pollHandle);
          setStatus(STATE_LABEL.ready, 'connected');
          setTimeout(function(){ window.location.href = body.redirect; }, 700);
          return;
        }
        if (body.status === 'error') {
          clearInterval(pollHandle);
          var cat = body.error_category || 'unknown';
          renderError(cat, body.message || '');
          return;
        }
        if (body.status === 'working') {
          var sub = body.sub_state || 'pending';
          if (sub === lastSubState) return;
          lastSubState = sub;
          var label = STATE_LABEL[sub] || ('Working… (' + sub + ')');
          if (sub === 'key_missing' || sub === 'kg_missing') {
            setStatus(label, 'block');
          } else {
            setStatus(label, 'pending');
          }
          return;
        }
        if (body.status === 'pending') {
          if (lastSubState !== 'pending') {
            lastSubState = 'pending';
            setStatus(STATE_LABEL.pending, 'pending');
          }
        }
      } catch(e) { /* swallow; retry next tick */ }
    }, 2000);
  }

  function renderError(category, msg){
    spinner.classList.add('err');
    step2.classList.add('err');
    statusText.innerHTML =
      '<strong>Setup failed.</strong><br>' +
      escapeHtml(ERROR_HELP[category] || ERROR_HELP.unknown) +
      (msg ? '<div class="err-detail">' + escapeHtml(msg) + '</div>' : '') +
      '<div class="err-help">' +
        'Email <a href="mailto:alex@timesmarble.com?subject=events-x-marble%20setup%20issue&body=session%20id%3A%20' +
        encodeURIComponent(sessionId) + '%0Acategory%3A%20' + encodeURIComponent(category) + '%0Adetail%3A%20' +
        encodeURIComponent(msg) + '">alex@timesmarble.com</a> ' +
        'and we\\'ll help. Include this session id: <code>' + escapeHtml(sessionId) + '</code>' +
      '</div>';
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  fetch('/api/v1/connect/new', { method: 'POST' })
    .then(function(r){ return r.json(); })
    .then(function(b){
      if (!b || !b.session_id) throw new Error('no session id');
      sessionId = b.session_id;
      try { localStorage.setItem('exm.connectSession', sessionId); } catch(e){}
      renderCmd(sessionId);
      startPolling();
    })
    .catch(function(err){
      setStatus('Could not start a connect session — refresh the page to try again.', 'error');
      console.error(err);
    });
})();
`,
          }}
        />
      </body>
    </html>
  );
};

function osLabel(os: Props["os"]): string {
  switch (os) {
    case "macos": return "macOS";
    case "linux": return "Linux";
    case "windows": return "Windows";
    default: return "Unknown OS";
  }
}

const css = `
  :root {
    --bg:    #0d0f13;
    --bg-2:  #131720;
    --fg:    #e7e9ee;
    --fg-2:  #b6bcc8;
    --muted: #6c7384;
    --accent:#f59e0b;
    --green: #10b981;
    --red:   #ef4444;
    --border:#1f2430;
    --card:  #161a23;
    --pill:  #1c2233;
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background: var(--bg); color: var(--fg);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    line-height: 1.5; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.92em;
    background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px; color: var(--fg); }

  .page { max-width: 720px; margin: 0 auto; padding: 32px 24px 80px; }

  .hdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 56px; }
  .brand { font-weight: 700; font-size: 16px; letter-spacing: -0.01em; color: var(--fg); }
  .brand:hover { color: var(--accent); text-decoration: none; }
  .hdr-link { font-size: 13px; color: var(--muted); }

  .hero h1 { font-size: 40px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.1; }
  .hero .lede { color: var(--fg-2); font-size: 16px; max-width: 560px; margin: 0; }

  .step { margin-top: 48px; }
  .step-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent); color: #0d0f13; font-weight: 700; font-size: 14px;
  }
  .step.done .step-num { background: var(--green); }
  .step.err  .step-num { background: var(--red); }
  .step h2 { font-size: 20px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }

  .os-pill {
    display: inline-block; background: var(--pill); border: 1px solid var(--border);
    border-radius: 999px; padding: 4px 12px; font-size: 12px; color: var(--fg-2);
    margin-bottom: 16px;
  }
  .os-warn { color: var(--red); }

  .cmd-wrap { position: relative; }
  .cmd {
    background: var(--bg-2); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px 56px 18px 18px; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 14px; overflow-x: auto; margin: 0;
    color: var(--fg);
  }
  .cmd .prompt { color: var(--muted); user-select: none; }
  .cmd .cmd-body { white-space: pre-wrap; word-break: break-all; }
  .cmd .ph { color: var(--muted); }
  .copy {
    position: absolute; top: 12px; right: 12px;
    background: var(--accent); color: #0d0f13; border: 0; border-radius: 6px;
    padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: inherit;
  }
  .copy:hover { filter: brightness(1.1); }
  .hint { color: var(--muted); font-size: 13px; margin-top: 10px; }

  .status {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 20px; display: flex; align-items: center; gap: 16px;
  }
  .spinner {
    width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%;
    border: 2.5px solid var(--border); border-top-color: var(--accent);
    animation: spin 1s linear infinite;
  }
  .spinner.done { animation: none; border: 0; background: var(--green);
    position: relative; }
  .spinner.done::after {
    content: ""; position: absolute; inset: 0; background: #0d0f13;
    clip-path: polygon(20% 50%, 45% 75%, 80% 30%, 75% 25%, 45% 65%, 25% 45%);
  }
  .spinner.err { animation: none; border: 0; background: var(--red); }
  .spinner.block { animation: none; border: 0; background: #fbbf24; position: relative; }
  .spinner.block::after {
    content: "!"; position: absolute; inset: 0; color: #0d0f13;
    font-weight: 800; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .status-text { color: var(--fg-2); font-size: 14px; }
  .status-text strong { color: var(--fg); display: block; margin-bottom: 4px; font-size: 15px; }
  .step.done .status-text { color: var(--fg); }
  .step.err  .status-text { color: var(--fg); }
  .status-text .err-detail {
    margin-top: 12px; padding: 10px 12px; background: var(--bg-2); border-radius: 6px;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px;
    color: var(--fg-2); border-left: 2px solid var(--red); word-break: break-word;
  }
  .status-text .err-help { margin-top: 12px; font-size: 13px; color: var(--fg-2); }
  .status-text .err-help a { color: var(--accent); }
  .status-text code { font-size: 11px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .reassurance {
    margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--border);
  }
  .reassurance h3 { font-size: 13px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px 0; }
  .reassurance ul { margin: 0; padding: 0; list-style: none; }
  .reassurance li {
    padding: 10px 0; border-bottom: 1px dashed var(--border); color: var(--fg-2);
    font-size: 14px;
  }
  .reassurance li:last-child { border-bottom: 0; }

  .ftr { margin-top: 64px; color: var(--muted); font-size: 12px; text-align: center; }
  .ftr .dot { margin: 0 10px; }
`;
