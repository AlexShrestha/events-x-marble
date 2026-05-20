import type { FC } from "hono/jsx";

interface Props {
  eventCount: number;
  cityName: string;
}

export const Landing: FC<Props> = ({ eventCount, cityName }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Events × Marble</title>
      <meta
        name="description"
        content="Hyper-personalized event discovery for your city. Powered by your local marble knowledge graph."
      />
      <style>{css}</style>
    </head>
    <body>
      <main class="page">
        <header class="hdr">
          <span class="brand">Events × Marble</span>
          <nav class="nav">
            <a href="/events">Browse events</a>
            <a href="/connect" class="cta-small">Connect</a>
          </nav>
        </header>

        <section class="hero">
          <h1>
            Events you'd <em>die</em> to go to,
            <br />
            <span class="amber">picked by your marble.</span>
          </h1>
          <p class="lede">
            We score every upcoming event in your city against your local marble
            knowledge graph. Only the irresistible ones reach you. Silence is the
            feature.
          </p>
          <div class="cta-row">
            <a href="/connect" class="cta-primary">Connect your marble →</a>
            <a href="/events" class="cta-secondary">
              See {eventCount} public events in {cityName}
            </a>
          </div>
        </section>

        <section class="how">
          <h2>How it works</h2>
          <ol>
            <li>
              <span class="num">1</span>
              <div>
                <strong>One command, no terminal-gymnastics.</strong>
                <p>
                  Copy a single line into Terminal. We install the CLI, pull
                  marble, and link your laptop to this browser tab. ~30
                  seconds.
                </p>
              </div>
            </li>
            <li>
              <span class="num">2</span>
              <div>
                <strong>Your KG stays on your laptop.</strong>
                <p>
                  Your beliefs, identities, preferences, and LLM API key
                  never reach our servers. We only ever see the sanitized
                  weekly "picks" payload you push.
                </p>
              </div>
            </li>
            <li>
              <span class="num">3</span>
              <div>
                <strong>Weekly: marble scores, you go (or don't).</strong>
                <p>
                  Every Sunday morning the CLI runs locally, scores the
                  upcoming corpus against your KG, and pushes your picks.
                  Visit this site to see them.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section class="ctaFinal">
          <a href="/connect" class="cta-primary">Connect your marble →</a>
        </section>

        <footer class="ftr">
          <span>Open source · KG stays on your laptop · MIT licensed</span>
          <span class="dot">·</span>
          <a href="/events">Public events</a>
          <span class="dot">·</span>
          <a href="/privacy">Privacy</a>
          <span class="dot">·</span>
          <a href="https://github.com/AlexShrestha/marble" target="_blank" rel="noopener">
            What is marble?
          </a>
        </footer>
      </main>
    </body>
  </html>
);

const css = `
  :root {
    --bg: #0d0f13; --bg-2: #131720; --fg: #e7e9ee; --fg-2: #b6bcc8;
    --muted: #6c7384; --accent: #f59e0b; --border: #1f2430; --card: #161a23;
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background: var(--bg); color: var(--fg);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    line-height: 1.55; }
  a { color: var(--fg); text-decoration: none; }
  a:hover { color: var(--accent); }

  .page { max-width: 880px; margin: 0 auto; padding: 32px 24px 96px; }

  .hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 96px; }
  .brand { font-weight: 700; font-size: 16px; letter-spacing: -0.01em; }
  .nav { display: flex; gap: 24px; align-items: center; }
  .nav a { font-size: 14px; color: var(--fg-2); }
  .nav a:hover { color: var(--fg); }
  .cta-small {
    background: var(--accent); color: #0d0f13 !important;
    padding: 8px 14px; border-radius: 6px; font-weight: 600;
  }
  .cta-small:hover { filter: brightness(1.1); }

  .hero h1 {
    font-size: clamp(40px, 7vw, 64px); margin: 0 0 24px 0; line-height: 1.05;
    letter-spacing: -0.03em; font-weight: 700; max-width: 760px;
  }
  .hero h1 em { font-style: italic; color: var(--fg-2); font-weight: 700; }
  .hero h1 .amber { color: var(--accent); }
  .lede { font-size: 18px; color: var(--fg-2); max-width: 560px; margin: 0 0 36px 0; }

  .cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .cta-primary {
    background: var(--accent); color: #0d0f13 !important;
    padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .cta-primary:hover { filter: brightness(1.1); }
  .cta-secondary {
    background: transparent; color: var(--fg-2) !important;
    padding: 14px 24px; border-radius: 8px;
    border: 1px solid var(--border); font-size: 14px;
  }
  .cta-secondary:hover { border-color: var(--accent); color: var(--fg) !important; }

  .how { margin-top: 120px; padding-top: 56px; border-top: 1px solid var(--border); }
  .how h2 {
    font-size: 13px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 32px 0;
  }
  .how ol { list-style: none; padding: 0; margin: 0; }
  .how li {
    display: flex; gap: 24px; padding: 24px 0;
    border-bottom: 1px dashed var(--border);
  }
  .how li:last-child { border-bottom: 0; }
  .how .num {
    flex-shrink: 0; width: 32px; height: 32px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%; background: var(--card); color: var(--accent);
    font-weight: 700; font-size: 14px;
    border: 1px solid var(--border);
  }
  .how strong { display: block; font-size: 17px; margin-bottom: 4px; }
  .how p { margin: 0; color: var(--fg-2); font-size: 14px; max-width: 580px; }

  .ctaFinal { margin-top: 80px; text-align: center; }

  .ftr {
    margin-top: 96px; padding-top: 32px; border-top: 1px solid var(--border);
    color: var(--muted); font-size: 12px; text-align: center;
  }
  .ftr .dot { margin: 0 10px; color: var(--border); }
  .ftr a { color: var(--muted); }
  .ftr a:hover { color: var(--fg-2); }
`;
