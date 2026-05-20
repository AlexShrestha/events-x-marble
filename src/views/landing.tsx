import type { FC } from "hono/jsx";
import { BASE_CSS, Footer, NavBar, Page, PageHead, SectionLabel } from "./theme.tsx";

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

export const Landing: FC<Props> = ({ geo }) => (
  <html lang="en">
    <head>
      <PageHead
        title="events × marble"
        description="Your week, judged by your graph. Silenced unless something crosses the bar."
      />
      <style>{BASE_CSS}</style>
      <style>{LANDING_CSS}</style>
    </head>
    <body>
      <Page>
        <NavBar activePath="/" />

        <section class="hero">
          <p class="kicker">a subdomain of ×marble</p>
          <h1>
            The events worth
            <br />
            showing up for.
          </h1>
          <p class="lede">
            Your marble decides. Most weeks, the answer is silence.
          </p>
          <div class="cta-row">
            <a href="/connect" class="btn">connect your marble →</a>
          </div>
        </section>

        <section class="block">
          <SectionLabel num="01" title="selection" />
          <div class="grid">
            <div class="grid-item">
              <h3>weekly verdict</h3>
              <p>
                Marble grades each upcoming event against your graph.
                Most don't pass.
              </p>
            </div>
            <div class="grid-item">
              <h3>local-only</h3>
              <p>
                Graph, model, scoring — all on your laptop. We see only the
                picks.
              </p>
            </div>
            <div class="grid-item">
              <h3>silence is the default</h3>
              <p>
                Most weeks reach you empty. That's the bar working.
              </p>
            </div>
            <div class="grid-item">
              <h3>reasons attached</h3>
              <p>
                Each pick names the specific interest, belief, or identity it
                matched. No black box.
              </p>
            </div>
          </div>
        </section>

        <section class="block">
          <SectionLabel num="02" title="boundary" />
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
              <td>top picks (ids + 120-char reasons)</td>
            </tr>
            <tr>
              <td>—</td>
              <td>3-color accent derived from your graph</td>
            </tr>
          </table>
        </section>

        <section class="block">
          <SectionLabel num="03" title="connect" />
          <p class="block-lede">One command. Five minutes. The tab tells you when you're in.</p>
          <ol class="install-steps">
            <li>
              <span class="step-num">i</span>
              <div>
                <strong>open /connect</strong>
                <p>
                  We detect your location from the edge. No pickers, no questions.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">ii</span>
              <div>
                <strong>paste one line</strong>
                <p>
                  The installer pulls events × marble + marble onto your
                  laptop, builds your graph from your data, scores this week.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">iii</span>
              <div>
                <strong>your tab redirects</strong>
                <p>
                  When the laptop is done, the dashboard is ready. No URLs to
                  copy, no tokens to paste.
                </p>
              </div>
            </li>
          </ol>
          <div class="install-cta">
            <a href="/connect" class="btn">connect your marble →</a>
          </div>
        </section>

        <Footer />
      </Page>
    </body>
  </html>
);

// Keep the geo param's signature so callers can pass it; we just don't
// surface a city-specific CTA on the hero today. If we add a "your city's
// events →" CTA later, it'll be gated behind a high-confidence geo match
// AND an explicit user permission gesture, not blunt browser-IP detection.
void Landing;

const LANDING_CSS = `
  .hero { padding: 24px 0 80px; }
  .hero .kicker {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); text-transform: lowercase;
    letter-spacing: 0.08em; margin-bottom: 32px;
  }
  .hero h1 {
    font-weight: 300;
  }
  .hero .lede {
    font-family: var(--serif);
    font-size: 22px; font-weight: 300; font-style: italic;
    line-height: 1.35; max-width: 540px;
    margin: 36px 0 0 0; color: var(--fg-2);
  }
  .cta-row {
    display: flex; gap: 12px; flex-wrap: wrap; margin-top: 48px;
  }

  .block { padding: 64px 0; border-top: 1px solid var(--line); }
  .block-lede {
    font-family: var(--serif); font-size: 20px; font-style: italic;
    color: var(--fg-2); margin: 0 0 32px 0; max-width: 540px;
    line-height: 1.4;
  }

  .grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line); margin-top: 32px;
  }
  .grid-item { background: var(--bg); padding: 32px 28px; }
  .grid-item h3 {
    font-family: var(--sans); font-size: 14px; font-weight: 500;
    text-transform: lowercase; letter-spacing: 0;
    margin: 0 0 12px 0;
  }
  .grid-item p { font-size: 14px; color: var(--fg-2); line-height: 1.55; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

  .stays {
    width: 100%; border-collapse: collapse;
    margin-top: 24px; font-size: 14px;
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
  .stays tr:first-child td { border-top: 1px solid var(--line); }
  .stays tr:nth-child(2) td { padding-top: 24px; }

  .install-steps {
    list-style: none; padding: 0; margin: 0;
    border-top: 1px solid var(--line);
  }
  .install-steps li {
    display: flex; gap: 24px; padding: 24px 0;
    border-bottom: 1px solid var(--line);
  }
  .install-steps .step-num {
    flex-shrink: 0;
    font-family: var(--serif); font-size: 28px; font-weight: 300;
    color: var(--muted); min-width: 32px;
    font-style: italic;
  }
  .install-steps strong {
    display: block; font-family: var(--sans); font-weight: 500;
    font-size: 16px; margin-bottom: 6px;
  }
  .install-steps p { color: var(--fg-2); font-size: 14px; max-width: 540px; }
  .install-cta { margin-top: 40px; }
`;
