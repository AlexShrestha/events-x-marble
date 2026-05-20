import type { FC } from "hono/jsx";
import { BASE_CSS, Footer, NavBar, Page, PageHead, SectionLabel } from "./theme.tsx";

interface Props {
  eventCount: number;
  cityName: string;
}

/**
 * Landing page — aligned to timesmarble.com editorial design.
 *
 * Structure (mirrors timesmarble.com's section pattern):
 *   nav
 *   hero          (h1 + abstract sub + CTA)
 *   001 — abstract
 *   01  — what it does
 *   02  — what stays local
 *   03  — install
 *   footer
 */
export const Landing: FC<Props> = ({ eventCount, cityName }) => (
  <html lang="en">
    <head>
      <PageHead
        title="events × marble — hyper-personal event discovery"
        description="A personalization graph for your city. Marble scores every upcoming event in your city against your local knowledge graph. Only the irresistible ones reach you."
      />
      <style>{BASE_CSS}</style>
      <style>{LANDING_CSS}</style>
    </head>
    <body>
      <Page>
        <NavBar activePath="/" />

        <section class="hero">
          <div class="section-num">
            <span class="num">001</span>
            <span class="dash">—</span>
            <span>abstract</span>
          </div>
          <p class="kicker">your city · your knowledge graph · zero noise</p>
          <h1>
            Events you'd <em>die</em>
            <br />
            to go to.
          </h1>
          <p class="lede">
            Marble turns your reading + chat history into a living personalization
            graph, then scores every upcoming event in your city against it.
            Only the irresistible ones reach you. Silence is the feature.
          </p>
          <div class="cta-row">
            <a href="/connect" class="btn">connect your marble →</a>
            <a href="/events" class="btn btn-ghost">
              {eventCount} public events in {cityName} →
            </a>
          </div>
        </section>

        <section class="block">
          <SectionLabel num="01" title="what it does" />
          <div class="grid">
            <div class="grid-item">
              <h3>cold-start in one command</h3>
              <p>
                Paste a single line. We install events × marble locally, bootstrap
                a marble knowledge graph from your data, and link your laptop to
                the site. ~5–8 min.
              </p>
            </div>
            <div class="grid-item">
              <h3>scores every event against you</h3>
              <p>
                Each week, your laptop pulls the upcoming event corpus, scores
                it against your KG using your own LLM key, and pushes a sanitized
                "picks" payload to this site.
              </p>
            </div>
            <div class="grid-item">
              <h3>silence when nothing fits</h3>
              <p>
                No anniversary alerts. No "people you may know". If nothing crosses
                the irresistibility threshold this week, you see nothing.
              </p>
            </div>
            <div class="grid-item">
              <h3>your KG is yours</h3>
              <p>
                Your raw beliefs, identities, preferences, and LLM API key never
                touch our servers. Only the sanitized weekly picks reach Turso.
              </p>
            </div>
          </div>
        </section>

        <section class="block">
          <SectionLabel num="02" title="what stays local" />
          <table class="stays">
            <tr>
              <td class="cell-stays">stays on your laptop</td>
              <td class="cell-leaves">reaches our server</td>
            </tr>
            <tr>
              <td>raw marble KG (beliefs, identities, preferences)</td>
              <td>—</td>
            </tr>
            <tr>
              <td>your LLM API key</td>
              <td>—</td>
            </tr>
            <tr>
              <td>your data ingest file (chat / journal / notes)</td>
              <td>—</td>
            </tr>
            <tr>
              <td>—</td>
              <td>~12 interest labels, weekly</td>
            </tr>
            <tr>
              <td>—</td>
              <td>top picks (event ids + 120-char rationales)</td>
            </tr>
            <tr>
              <td>—</td>
              <td>3-color accent palette derived from KG</td>
            </tr>
          </table>
        </section>

        <section class="block">
          <SectionLabel num="03" title="install" />
          <p class="install-lede">
            Three steps. ~5–8 minutes. Your browser tab auto-advances as the
            laptop checks in.
          </p>
          <ol class="install-steps">
            <li>
              <span class="step-num">i</span>
              <div>
                <strong>visit /connect</strong>
                <p>
                  We auto-detect your city from your browser location. No
                  questions, no pickers.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">ii</span>
              <div>
                <strong>paste one command</strong>
                <p>
                  The installer pulls events × marble + marble onto your
                  laptop, builds your KG from your data, scores this week's
                  events.
                </p>
              </div>
            </li>
            <li>
              <span class="step-num">iii</span>
              <div>
                <strong>tab auto-redirects to /me</strong>
                <p>
                  When your laptop finishes, your dashboard is ready. No URL
                  pasting. No tokens to copy.
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

const LANDING_CSS = `
  .hero { padding: 24px 0 80px; }
  .hero .kicker {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); text-transform: lowercase;
    letter-spacing: 0.08em; margin-bottom: 32px;
  }
  .hero h1 em {
    font-style: italic; font-weight: 400; color: var(--fg-2);
  }
  .hero .lede {
    font-size: 18px; line-height: 1.6;
    max-width: 580px; margin: 36px 0 0 0; color: var(--fg-2);
  }
  .cta-row {
    display: flex; gap: 12px; flex-wrap: wrap; margin-top: 48px;
  }

  .block { padding: 64px 0; border-top: 1px solid var(--line); }

  .grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line); margin-top: 24px;
  }
  .grid-item { background: var(--bg); padding: 32px 28px; }
  .grid-item h3 {
    font-family: var(--sans); font-size: 14px; font-weight: 500;
    text-transform: lowercase; letter-spacing: 0.01em;
    margin: 0 0 12px 0;
  }
  .grid-item p { font-size: 14px; color: var(--fg-2); }
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

  .install-lede { font-size: 15px; color: var(--fg-2); margin-bottom: 32px; max-width: 540px; }
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
