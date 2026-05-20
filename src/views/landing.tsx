import type { FC } from "hono/jsx";
import { BASE_CSS, Fig, Footer, NavBar, Page, PageHead, SectionBig } from "./theme.tsx";

interface Props {
  /**
   * Geo from Vercel edge headers — if absent (dev / non-Vercel), we don't
   * presume to show "N events in X" because we have no idea where the
   * visitor is. The hero stays clean, single-CTA.
   */
  geo?: {
    city: string | null;
    country: string | null;
  };
}

export const Landing: FC<Props> = ({ geo: _geo }) => (
  <html lang="en">
    <head>
      <PageHead
        title="events × marble — the events worth showing up for"
        description="Your knowledge graph, applied to the week. Silenced unless something crosses the bar."
      />
      <style>{BASE_CSS}</style>
      <style>{LANDING_CSS}</style>
    </head>
    <body>
      <Page>
        <NavBar activePath="/" />

        {/* Hero — oversized magazine-spread treatment */}
        <section class="hero">
          <Fig id="00">a subdomain of ×marble · curation, not feed</Fig>
          <h1 class="hero-h1">
            <span>The events</span>
            <span class="serif-italic">worth showing</span>
            <span>up for.</span>
          </h1>
          <p class="lede">
            <span class="lede-line">Your knowledge graph, applied to the week.</span>
            <span class="lede-line">Most weeks, the answer is silence.</span>
          </p>
          <div class="cta-row">
            <a href="/connect" class="btn btn-accent">connect your marble →</a>
            <span class="cta-hint">~5–8 min · one terminal command · KG stays local</span>
          </div>
        </section>

        {/* The graph figure — small, technical, sits between hero and content */}
        <section class="figure">
          <pre class="graph-art">{`
   your KG ──●──┐
                │
                ●  marble — selection
                │
                ●──→  the irresistible few
`}</pre>
          <Fig id="01">weekly verdict · most events fail the bar · n→0 by design</Fig>
        </section>

        {/* 01 — selection */}
        <section class="block">
          <SectionBig num="01" title="selection" />
          <p class="block-lede">
            Marble grades each upcoming event against your graph.
            Most don't pass. The ones that do reach you with their reasoning
            attached.
          </p>
          <div class="grid">
            <div class="grid-item">
              <span class="grid-num">i</span>
              <h3>weekly verdict</h3>
              <p>Every Sunday, your laptop scores the week. You see the
              survivors, not the slush pile.</p>
            </div>
            <div class="grid-item">
              <span class="grid-num">ii</span>
              <h3>local-only</h3>
              <p>Graph, model, and scoring run on your machine. We see the
              picks, not the math.</p>
            </div>
            <div class="grid-item">
              <span class="grid-num">iii</span>
              <h3>silence is the default</h3>
              <p>Most weeks reach you empty. That's not a bug — it's the
              point.</p>
            </div>
            <div class="grid-item">
              <span class="grid-num">iv</span>
              <h3>reasoning attached</h3>
              <p>Each pick names the specific interest, belief, or identity
              it matched. No black box.</p>
            </div>
          </div>
        </section>

        {/* 02 — boundary */}
        <section class="block">
          <SectionBig num="02" title="boundary" />
          <p class="block-lede">We hold less than you'd think.</p>
          <table class="stays">
            <tr>
              <td class="cell-stays">stays on your laptop</td>
              <td class="cell-leaves">reaches our server</td>
            </tr>
            <tr>
              <td>your raw knowledge graph</td>
              <td>—</td>
            </tr>
            <tr>
              <td>your LLM API key</td>
              <td>—</td>
            </tr>
            <tr>
              <td>any data you let marble learn from</td>
              <td>—</td>
            </tr>
            <tr>
              <td>—</td>
              <td>~12 coarse interest labels</td>
            </tr>
            <tr>
              <td>—</td>
              <td>top picks (event ids + 120-char reasons)</td>
            </tr>
            <tr>
              <td>—</td>
              <td>a 3-color palette derived from your graph</td>
            </tr>
          </table>
        </section>

        {/* 03 — connect */}
        <section class="block">
          <SectionBig num="03" title="connect" />
          <p class="block-lede">
            One command. Five to eight minutes. The tab tells you when
            you're in.
          </p>
          <ol class="install-steps">
            <li>
              <span class="step-num">i</span>
              <div>
                <strong>open /connect</strong>
                <p>
                  We detect your location at the edge. No pickers, no
                  questions, no permission popups.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">ii</span>
              <div>
                <strong>paste one line</strong>
                <p>
                  Installs <code>events × marble</code> on your laptop, pulls
                  marble's library, builds your knowledge graph from your data,
                  and scores this week.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">iii</span>
              <div>
                <strong>your tab redirects</strong>
                <p>
                  The dashboard is ready when the laptop says so. No URLs to
                  copy. No tokens to paste.
                </p>
              </div>
            </li>
          </ol>
          <div class="install-cta">
            <a href="/connect" class="btn btn-accent">connect your marble →</a>
          </div>
        </section>

        <Footer />
      </Page>
    </body>
  </html>
);

const LANDING_CSS = `
  .hero { padding: 32px 0 56px; }
  .hero-h1 {
    font-family: var(--serif);
    font-weight: 300;
    font-size: clamp(48px, 9vw, 96px);
    line-height: 0.98;
    letter-spacing: -0.03em;
    margin: 40px 0 0 0;
    display: flex; flex-direction: column;
  }
  .hero-h1 span { display: block; }
  .hero-h1 .serif-italic {
    font-style: italic;
    color: var(--accent);
  }
  .lede {
    margin: 40px 0 0 0;
    display: flex; flex-direction: column; gap: 6px;
    max-width: 580px;
  }
  .lede-line {
    font-family: var(--serif); font-style: italic;
    font-size: 21px; font-weight: 300;
    color: var(--fg-2); line-height: 1.35;
  }
  .lede-line:nth-child(1) { color: var(--fg); }

  .cta-row {
    display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
    margin-top: 48px;
  }
  .cta-hint {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); letter-spacing: 0.02em;
  }
  .btn-accent {
    background: var(--accent); color: var(--bg) !important;
    border: 1px solid var(--accent) !important;
  }
  .btn-accent:hover { background: var(--accent-2); border-color: var(--accent-2) !important; opacity: 1; }

  /* Figure block — abstract diagram between hero and content */
  .figure {
    padding: 32px 0 56px;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    margin: 24px 0;
    display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
  }
  .graph-art {
    font-family: var(--mono); font-size: 13px; line-height: 1.4;
    color: var(--muted);
    margin: 0; padding: 0;
    white-space: pre;
  }
  .graph-art ●,
  .graph-art {
    /* Highlight the active node glyphs via ::before isn't possible; instead, just hint */
  }

  .block { padding: 64px 0; border-top: 1px solid var(--line); }
  .block-lede {
    font-family: var(--serif); font-size: 22px; font-style: italic;
    font-weight: 300;
    color: var(--fg-2); margin: 0 0 36px 0; max-width: 580px;
    line-height: 1.35;
  }

  /* 2x2 grid of selection points — each card has a small roman numeral */
  .grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line); margin-top: 32px;
  }
  .grid-item {
    background: var(--bg); padding: 32px 28px;
    position: relative; transition: background 0.15s;
  }
  .grid-item:hover { background: var(--bg-2); }
  .grid-num {
    position: absolute; top: 16px; right: 20px;
    font-family: var(--serif); font-style: italic; font-weight: 300;
    font-size: 18px; color: var(--accent);
    opacity: 0.6;
  }
  .grid-item h3 {
    font-family: var(--sans); font-size: 14px; font-weight: 500;
    text-transform: lowercase; letter-spacing: 0;
    margin: 0 0 12px 0;
  }
  .grid-item p { font-size: 14px; color: var(--fg-2); line-height: 1.55; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

  .stays {
    width: 100%; border-collapse: collapse;
    margin-top: 16px; font-size: 14px;
  }
  .stays td {
    padding: 14px 16px; border-bottom: 1px solid var(--line);
    color: var(--fg-2); vertical-align: top;
  }
  .stays td:first-child { width: 50%; border-right: 1px solid var(--line); }
  .stays .cell-stays, .stays .cell-leaves {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em;
    padding-bottom: 12px;
  }
  .stays .cell-leaves { color: var(--accent); }
  .stays tr:first-child td { border-top: 1px solid var(--line); }
  .stays tr:nth-child(2) td { padding-top: 24px; }

  .install-steps {
    list-style: none; padding: 0; margin: 0;
    border-top: 1px solid var(--line);
  }
  .install-steps li {
    display: flex; gap: 24px; padding: 28px 0;
    border-bottom: 1px solid var(--line);
    transition: padding-left 0.2s;
  }
  .install-steps li:hover { padding-left: 8px; }
  .install-steps .step-num {
    flex-shrink: 0;
    font-family: var(--serif); font-size: 32px; font-weight: 300;
    color: var(--accent); min-width: 36px;
    font-style: italic;
  }
  .install-steps strong {
    display: block; font-family: var(--sans); font-weight: 500;
    font-size: 16px; margin-bottom: 6px;
  }
  .install-steps p { color: var(--fg-2); font-size: 14px; max-width: 540px; }
  .install-cta { margin-top: 48px; }
`;
