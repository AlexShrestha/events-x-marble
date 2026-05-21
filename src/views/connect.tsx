import type { FC } from "hono/jsx";
import { BASE_CSS, Fig, Footer, NavBar, Page, PageHead, SectionBig } from "./theme.tsx";

interface Props {
  /** Auto-detected from UA at render time. */
  os: "macos" | "linux" | "windows" | "other";
  /** Public site URL (e.g. https://events.timesmarble.com). */
  siteUrl: string;
  /** Server-side geo from Vercel edge headers; null on dev/non-Vercel hosts. */
  geo: {
    city: string | null;
    country: string | null;
    timezone: string | null;
  };
}

export const Connect: FC<Props> = ({ os, siteUrl, geo }) => (
  <html lang="en">
    <head>
      <PageHead title="connect — events × marble" />
      <style>{BASE_CSS}</style>
      <style>{CONNECT_CSS}</style>
    </head>
    <body>
      <Page>
        <NavBar activePath="/connect" />

        <section class="hero">
          <Fig id="00">one command · ~5–8 min · KG never leaves your laptop</Fig>
          <h1 class="hero-h1">
            <span>connect your</span>
            <span class="serif-italic">marble</span>
          </h1>
          <p class="lede-line">
            Your graph and your key stay on your laptop. We see only what you push.
          </p>
        </section>

        <section class="step">
          <SectionBig num="01" title="copy this command" />
          <div class="meta-row">
            <span class="meta-chip" data-os={os}>
              <span class="meta-label">os</span>
              <span class="meta-value">{osLabel(os)}</span>
              {os === "other" || os === "windows" ? (
                <span class="meta-warn"> · macOS &amp; Linux only</span>
              ) : null}
            </span>
            {/* City chip only renders when the edge actually resolved one — no blunt assumption. */}
            <span class="meta-chip" id="cityChip" style={geo.city ? "" : "display:none"}>
              <span class="meta-label">city</span>
              <span class="meta-value" id="cityValue">
                {geo.city ?? ""}
              </span>
            </span>
          </div>

          <div class="cmd-wrap">
            <pre
              class="cmd"
              id="cmd"
              data-template={`curl -fsSL '${siteUrl.replace(/\/$/, "")}/install?session=__SESSION__' | bash`}
            >
              <span class="prompt">$ </span>
              <span class="cmd-body" id="cmdBody">
                {`curl -fsSL '${siteUrl.replace(/\/$/, "")}/install?session=`}
                <span class="ph">…</span>{`' | bash`}
              </span>
            </pre>
            <button class="copy" id="copyBtn" type="button">copy</button>
          </div>
          <p class="hint">
            Open Terminal · paste · hit Enter. Your laptop will install events × marble,
            build your marble KG from your data, score this week's events, and push the
            result here. This tab updates live.
          </p>

          <details class="advanced">
            <summary>what marble looks at on your laptop</summary>
            <div class="advanced-body">
              <p>
                marble auto-discovers everything it can learn from. No file
                picker, no pre-staging. We sweep:
              </p>
              <ul class="caveats">
                <li>
                  <code>~/.claude/projects/</code> · Claude Code session logs
                  (every coding conversation you've had).
                </li>
                <li>
                  <code>~/Library/Application Support/Anthropic/</code> +{" "}
                  <code>~/Library/Application Support/Claude/</code> · Claude
                  desktop conversations.
                </li>
                <li>
                  <code>~/Downloads/conversations*.json</code> ·{" "}
                  <code>chatgpt-*.json</code> · any ChatGPT export.
                </li>
                <li>
                  <code>~/Downloads/*.json</code> with chat-message shape ·
                  generic captures.
                </li>
                <li>
                  <code>~/Documents/Journal/</code> ·{" "}
                  <code>Notes/</code> · <code>Obsidian/</code> · any{" "}
                  <code>.md</code> / <code>.txt</code> you've written.
                </li>
              </ul>
              <p style="margin-top: 14px">
                marble's full pipeline runs locally: ingest → learn (L1.5 →
                L2 → L3) → investigate → learn. ~5–8 min total. Nothing
                leaves your laptop except the sanitized rent payload (picks
                + interest labels + a 3-color palette).
              </p>
            </div>
          </details>

          <details class="advanced">
            <summary>data in a non-standard location?</summary>
            <div class="advanced-body">
              <p>
                If you keep your stuff somewhere we don't sweep, prefix the
                install command with <code>EXM_BUILD_FROM=…</code> to add a
                specific path to the discovered set:
              </p>
              <div class="cmd-wrap">
                <pre
                  class="cmd cmd-mini"
                  id="cmdAlt"
                  data-template={`EXM_BUILD_FROM=~/path/to/your-data.json curl -fsSL '${siteUrl.replace(/\/$/, "")}/install?session=__SESSION__' | bash`}
                >
                  <span class="prompt">$ </span>
                  <span class="cmd-body" id="cmdAltBody">
                    {`EXM_BUILD_FROM=~/path/to/your-data.json curl -fsSL '${siteUrl.replace(/\/$/, "")}/install?session=`}
                    <span class="ph">…</span>{`' | bash`}
                  </span>
                </pre>
                <button class="copy" id="copyAltBtn" type="button">copy</button>
              </div>
              <p style="margin-top: 14px">
                Works alongside auto-discovery — your path gets added to
                whatever else we find.
              </p>
            </div>
          </details>

          <details class="advanced">
            <summary>prerequisites</summary>
            <div class="advanced-body">
              <ul class="caveats">
                <li>macOS or Linux (Windows isn't supported yet).</li>
                <li>Node.js 18+ (<code>brew install node</code>).</li>
                <li>git (<code>xcode-select --install</code> on macOS).</li>
                <li>
                  one LLM API key in your shell:{" "}
                  <code>OPENCODE_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>,
                  or <code>OPENAI_API_KEY</code>. OpenCode Zen recommended for
                  cost:{" "}
                  <a href="https://opencode.ai/zen" target="_blank" rel="noopener">
                    opencode.ai/zen
                  </a>
                  .
                </li>
              </ul>
            </div>
          </details>
        </section>

        <section class="step" id="step2">
          <SectionBig num="02" title="watching for your laptop" />
          <div class="status" id="status">
            <div class="spinner" id="spinner" />
            <div class="status-text" id="statusText">
              waiting for the install to complete · this tab refreshes every
              2&nbsp;seconds
            </div>
          </div>
        </section>

        <Footer />
      </Page>

      {/* Bootstrap script — same polling logic as before, restyled */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var cmdBody = document.getElementById('cmdBody');
  var cmdEl   = document.getElementById('cmd');
  var copyBtn = document.getElementById('copyBtn');
  var cmdAltBody = document.getElementById('cmdAltBody');
  var cmdAltEl   = document.getElementById('cmdAlt');
  var copyAltBtn = document.getElementById('copyAltBtn');
  var cityValue  = document.getElementById('cityValue');
  var statusText = document.getElementById('statusText');
  var spinner = document.getElementById('spinner');
  var step2   = document.getElementById('step2');
  var pollHandle = null;
  var sessionId = null;
  var template = cmdEl.getAttribute('data-template');
  var templateAlt = cmdAltEl ? cmdAltEl.getAttribute('data-template') : null;

  function renderCmd(sid){
    cmdBody.textContent = template.replace('__SESSION__', sid);
    if (cmdAltBody && templateAlt) {
      cmdAltBody.textContent = templateAlt.replace('__SESSION__', sid);
    }
  }
  function setStatus(text, kind){
    statusText.textContent = text;
    spinner.classList.remove('done','err','block');
    step2.classList.remove('done','err','block');
    if (kind === 'connected') { spinner.classList.add('done'); step2.classList.add('done'); }
    else if (kind === 'error')  { spinner.classList.add('err');  step2.classList.add('err'); }
    else if (kind === 'block')  { spinner.classList.add('block');step2.classList.add('block'); }
  }
  function copyText(text, btn){
    if (!navigator.clipboard) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e){}
      ta.remove();
    } else { navigator.clipboard.writeText(text); }
    var orig = btn.textContent;
    btn.textContent = 'copied';
    setTimeout(function(){ btn.textContent = orig; }, 1400);
  }
  copyBtn.addEventListener('click', function(){ copyText(cmdBody.textContent.trim(), copyBtn); });
  if (copyAltBtn) copyAltBtn.addEventListener('click', function(){ copyText(cmdAltBody.textContent.trim(), copyAltBtn); });

  var STATE_LABEL = {
    new:           'connecting your laptop…',
    pending:       'waiting for the install command to run…',
    key_missing:   'your LLM API key isn\\'t set on your laptop. Export it in your shell and re-run \`events-x-marble run\`.',
    kg_missing:    'no marble KG yet — prefix the install command with EXM_BUILD_FROM=… to bootstrap one.',
    ingesting:     'building your knowledge graph from your data… (~1–2 min)',
    learning:      'marble inference pipeline running… (~3–6 min)',
    scoring:       'scoring this week\\'s events against your KG…',
    pushing:       'uploading your picks…',
    ready:         'done — redirecting to your dashboard…',
    error:         'something went wrong.'
  };
  var ERROR_HELP = {
    key_invalid:   'Your LLM gateway rejected the API key. Double-check the env var and re-run.',
    kg_load_failed:'We couldn\\'t read your marble-kg.json. Check it\\'s valid JSON.',
    kg_invalid:    'The KG file doesn\\'t look like a marble user object.',
    ingest_failed: 'Marble failed to ingest your data. Email us with the error below.',
    learn_failed:  'Marble crashed during the learn step. Email us.',
    score_failed:  'The scoring LLM call failed (not auth-related). Try re-running.',
    push_failed:   'Couldn\\'t upload your picks. Check your connection and re-run.',
    network:       'Network error reaching the server. Check your connection.',
    unknown:       'An unexpected error. Please email us so we can dig in.'
  };

  function renderError(category, msg){
    spinner.classList.add('err'); step2.classList.add('err');
    statusText.innerHTML =
      '<strong>setup failed.</strong>' +
      escapeHtml(ERROR_HELP[category] || ERROR_HELP.unknown) +
      (msg ? '<div class="err-detail">' + escapeHtml(msg) + '</div>' : '') +
      '<div class="err-help">' +
        'email <a href="mailto:alex@timesmarble.com?subject=events-x-marble%20setup%20issue&body=session%3A%20' +
        encodeURIComponent(sessionId) + '%0Acategory%3A%20' + encodeURIComponent(category) + '%0Adetail%3A%20' +
        encodeURIComponent(msg) + '">alex@timesmarble.com</a> ' +
        'with session id <code>' + escapeHtml(sessionId) + '</code>' +
      '</div>';
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function startPolling(){
    var lastSubState = null;
    pollHandle = setInterval(async function(){
      try {
        var res = await fetch('/api/v1/connect/status?session=' + encodeURIComponent(sessionId), { cache: 'no-store' });
        if (res.status === 410) { setStatus('this setup session expired (30 min). refresh to start over.', 'error'); clearInterval(pollHandle); return; }
        if (!res.ok) return;
        var body = await res.json();
        if (!body) return;
        if (body.status === 'ready' && body.redirect) {
          clearInterval(pollHandle);
          setStatus(STATE_LABEL.ready, 'connected');
          setTimeout(function(){ window.location.href = body.redirect; }, 700);
          return;
        }
        if (body.status === 'error') {
          clearInterval(pollHandle);
          renderError(body.error_category || 'unknown', body.message || '');
          return;
        }
        if (body.status === 'working') {
          var sub = body.sub_state || 'pending';
          if (sub === lastSubState) return;
          lastSubState = sub;
          var label = STATE_LABEL[sub] || ('working — ' + sub);
          setStatus(label, (sub === 'key_missing' || sub === 'kg_missing') ? 'block' : 'pending');
          return;
        }
        if (body.status === 'pending' && lastSubState !== 'pending') {
          lastSubState = 'pending';
          setStatus(STATE_LABEL.pending, 'pending');
        }
      } catch(e) {}
    }, 2000);
  }

  fetch('/api/v1/connect/new', { method: 'POST' })
    .then(function(r){ return r.json(); })
    .then(function(b){
      if (!b || !b.session_id) throw new Error('no session id');
      sessionId = b.session_id;
      try { localStorage.setItem('exm.connectSession', sessionId); } catch(e){}
      renderCmd(sessionId);
      // Reveal the city chip ONLY when the edge actually resolved a city —
      // we don't presume on the user when geo data is incomplete.
      var cityChip = document.getElementById('cityChip');
      if (cityValue && cityChip && b.geo && b.geo.city) {
        cityValue.textContent = b.geo.city;
        cityChip.style.display = '';
      }
      startPolling();
    })
    .catch(function(err){
      setStatus('couldn\\'t start a connect session — refresh to try again.', 'error');
      console.error(err);
    });
})();
`,
        }}
      />
    </body>
  </html>
);

function osLabel(os: Props["os"]): string {
  switch (os) {
    case "macos": return "macOS";
    case "linux": return "Linux";
    case "windows": return "Windows";
    default: return "Unknown";
  }
}

const CONNECT_CSS = `
  .hero { padding: 24px 0 56px; }
  .hero-h1 {
    font-family: var(--serif); font-weight: 300;
    font-size: clamp(48px, 9vw, 80px); line-height: 1; letter-spacing: -0.03em;
    margin: 24px 0 0 0; display: flex; flex-direction: column;
  }
  .hero-h1 .serif-italic { font-style: italic; color: var(--accent); }
  .hero .lede-line {
    font-family: var(--serif); font-style: italic; font-weight: 300;
    font-size: 20px; line-height: 1.4;
    max-width: 540px; margin: 32px 0 0 0; color: var(--fg-2);
    display: block;
  }

  .step { padding: 56px 0; border-top: 1px solid var(--line); }

  .meta-row {
    display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .meta-chip {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--line);
    padding: 6px 12px;
    font-family: var(--mono); font-size: 11px;
    background: var(--bg-2);
  }
  .meta-chip.dim { opacity: 0.6; }
  .meta-chip .meta-label { color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .meta-chip .meta-value { color: var(--fg); font-weight: 500; }
  .meta-chip .meta-warn { color: var(--warn); }
  .meta-chip[data-os="macos"] { border-color: var(--accent-dim); }
  .meta-chip[data-os="macos"] .meta-value { color: var(--accent); }

  .hint {
    margin-top: 14px; font-size: 13px; color: var(--muted); max-width: 580px;
  }

  .advanced {
    margin-top: 16px; padding-top: 14px;
    border-top: 1px dashed var(--line);
  }
  .advanced summary {
    color: var(--muted); cursor: pointer; font-size: 13px;
    text-transform: lowercase;
    user-select: none; padding: 4px 0;
    font-family: var(--mono); letter-spacing: 0.02em;
  }
  .advanced summary:hover { color: var(--fg); }
  .advanced[open] summary { color: var(--fg); }
  .advanced-body { padding: 12px 0 6px; }
  .advanced-body p { color: var(--fg-2); font-size: 13px; margin: 0 0 14px; }
  .advanced-body .caveats { list-style: none; padding: 0; margin: 14px 0 0; }
  .advanced-body .caveats li {
    padding: 8px 0; color: var(--fg-2); font-size: 13px;
    border-bottom: 1px dashed var(--line);
  }
  .advanced-body .caveats li:last-child { border-bottom: 0; }
  .advanced-body a { color: var(--fg); }
  .cmd-mini { font-size: 12px; padding-right: 76px; }

  /* Status block */
  .status {
    display: flex; align-items: center; gap: 16px;
    border: 1px solid var(--line); background: var(--bg-2);
    padding: 22px 22px;
  }
  .spinner {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid var(--line); border-top-color: var(--fg);
    animation: spin 1s linear infinite;
  }
  .spinner.done { animation: none; border: 0; background: var(--accent); position: relative; }
  .spinner.done::after {
    content: ""; position: absolute; inset: 0; background: var(--bg);
    clip-path: polygon(20% 50%, 45% 75%, 80% 30%, 75% 25%, 45% 65%, 25% 45%);
  }
  .spinner.err   { animation: none; border: 0; background: var(--err); }
  .spinner.block { animation: none; border: 0; background: var(--warn); position: relative; }
  .spinner.block::after {
    content: "!"; position: absolute; inset: 0; color: var(--bg);
    font-weight: 700; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .status-text { color: var(--fg-2); font-size: 14px; }
  .status-text strong { color: var(--fg); display: block; margin-bottom: 4px; font-size: 15px; }
  .step.done .status-text { color: var(--fg); }
  .step.err  .status-text { color: var(--fg); }
  .status-text .err-detail {
    margin-top: 12px; padding: 10px 12px; background: var(--bg-3);
    font-family: var(--mono); font-size: 11px; color: var(--fg-2);
    border-left: 2px solid var(--err); word-break: break-word;
  }
  .status-text .err-help { margin-top: 12px; font-size: 13px; color: var(--fg-2); }
  .status-text .err-help a { color: var(--fg); }
  .status-text code { font-size: 11px; }
`;
