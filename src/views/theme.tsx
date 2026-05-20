/**
 * Shared design tokens + base CSS for events × marble — aligned to the
 * timesmarble.com visual language.
 *
 * Family:
 *   Fraunces  — display serif (headlines, abstract numbers like 001/02)
 *   Geist     — sans-serif (body text)
 *   Geist Mono — monospace (code, data, the CLI command)
 *
 * Palette:
 *   --bg     #0a0a0a   near-black
 *   --bg-2   #141414   subtle elevation
 *   --fg     #f5f5f4   off-white body
 *   --muted  #737373   secondary text
 *   --line   #262626   hairline borders / dividers
 *   --accent #f5f5f4   no chromatic accent — accent IS the bright white,
 *                      paired with hairline borders. Matches timesmarble's
 *                      minimalism. (Use --warn / --err sparingly for state.)
 *   --warn   #fbbf24
 *   --err    #ef4444
 *   --ok     #10b981
 *
 * Voice:
 *   - Numbered sections "01 — primitives" / "02 — anatomy" via a small
 *     `<SectionLabel>` helper component.
 *   - Lowercase, factual, minimal punctuation.
 *   - Brand mark: "events × marble" (× is U+00D7 MULTIPLICATION SIGN).
 *
 * All views import `BASE_CSS` and inline it into their own <style> blocks.
 * They can ADD page-specific styles after, but should not redefine the
 * tokens here.
 */
import type { FC, PropsWithChildren } from "hono/jsx";

export const BRAND_MARK = "events × marble";

/** Google Fonts CDN link — loads Fraunces + Geist + Geist Mono. */
export const FONTS_LINK = `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700&family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;700&display=swap`;

export const BASE_CSS = `
  :root {
    --bg:     #0a0a0a;
    --bg-2:   #141414;
    --bg-3:   #1a1a1a;
    --fg:     #f5f5f4;
    --fg-2:   #d4d4d4;
    --muted:  #737373;
    --muted-2:#525252;
    --line:   #262626;
    --line-2: #1a1a1a;
    --warn:   #fbbf24;
    --err:    #ef4444;
    --ok:     #10b981;
    --serif:  "Fraunces", "Times New Roman", Times, serif;
    --sans:   "Geist", -apple-system, "Helvetica Neue", Arial, sans-serif;
    --mono:   "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body { min-height: 100vh; }

  /* Editorial typography */
  h1, h2, h3, h4 { font-family: var(--serif); font-weight: 400; letter-spacing: -0.015em; line-height: 1.05; margin: 0; }
  h1 { font-size: clamp(40px, 7vw, 72px); font-weight: 300; }
  h2 { font-size: 28px; font-weight: 400; }
  h3 { font-size: 18px; font-weight: 500; }
  p  { margin: 0; color: var(--fg-2); }

  a { color: var(--fg); text-decoration: none; border-bottom: 1px solid var(--line); transition: border-color 0.15s; }
  a:hover { border-color: var(--fg); }
  a.bare { border: 0; }

  code, pre {
    font-family: var(--mono);
    font-size: 0.94em;
    color: var(--fg);
  }
  code {
    background: var(--bg-2);
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid var(--line);
    font-size: 0.88em;
  }

  /* "001 — abstract" style section number marker */
  .section-num {
    display: inline-flex; align-items: center; gap: 12px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .section-num .num { color: var(--fg); font-weight: 500; }
  .section-num .dash { color: var(--muted-2); }

  /* Shared layout container */
  .page { max-width: 880px; margin: 0 auto; padding: 32px 24px 96px; }
  .page-wide { max-width: 1100px; margin: 0 auto; padding: 32px 24px 96px; }

  /* Header bar */
  .nav {
    display: flex; justify-content: space-between; align-items: baseline;
    padding-bottom: 32px; margin-bottom: 56px;
    border-bottom: 1px solid var(--line);
  }
  .nav .brand {
    font-family: var(--sans);
    font-size: 14px; font-weight: 500;
    border: 0; color: var(--fg);
  }
  .nav .brand .x { color: var(--muted); }
  .nav .links { display: flex; gap: 24px; align-items: center; }
  .nav .links a { font-size: 13px; color: var(--muted); border: 0; }
  .nav .links a:hover { color: var(--fg); }

  /* CTA button */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--fg); color: var(--bg) !important;
    padding: 12px 22px;
    font-size: 14px; font-weight: 500;
    border: 1px solid var(--fg) !important;
    border-radius: 0; /* slabby, editorial — not pill */
    transition: opacity 0.15s;
  }
  .btn:hover { opacity: 0.88; border-color: var(--fg) !important; }
  .btn-ghost {
    background: transparent; color: var(--fg) !important;
    border: 1px solid var(--line) !important;
  }
  .btn-ghost:hover { border-color: var(--fg) !important; }

  /* Mono command pre block (the install line on /connect) */
  .cmd {
    font-family: var(--mono); font-size: 13px; line-height: 1.6;
    background: var(--bg-2);
    border: 1px solid var(--line);
    padding: 18px 80px 18px 18px;
    margin: 0; position: relative;
    overflow-x: auto;
    color: var(--fg);
    white-space: pre-wrap; word-break: break-all;
  }
  .cmd .prompt { color: var(--muted); user-select: none; margin-right: 4px; }
  .cmd .ph     { color: var(--muted); }
  .cmd-wrap { position: relative; }
  .copy {
    position: absolute; top: 12px; right: 12px;
    background: var(--fg); color: var(--bg);
    border: 0; padding: 6px 12px;
    font-family: var(--sans); font-size: 11px; font-weight: 500;
    cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .copy:hover { opacity: 0.88; }

  /* Footer */
  footer.ftr {
    margin-top: 96px; padding-top: 32px;
    border-top: 1px solid var(--line);
    color: var(--muted); font-size: 12px;
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  footer.ftr a { color: var(--muted); border: 0; }
  footer.ftr a:hover { color: var(--fg-2); }

  /* Print + small-screen adjustments */
  @media (max-width: 640px) {
    .nav { flex-direction: column; align-items: flex-start; gap: 12px; }
    h1 { font-size: 44px; }
  }
`;

/** Reusable header — used by every page. */
export const NavBar: FC<{ activePath?: string }> = ({ activePath }) => (
  <nav class="nav">
    <a href="/" class="brand bare">
      events <span class="x">×</span> marble
    </a>
    <div class="links">
      <a href="/events" class={activePath === "/events" ? "active" : ""}>events</a>
      <a href="/connect" class={activePath === "/connect" ? "active" : ""}>connect</a>
      <a href="https://timesmarble.com" target="_blank" rel="noopener" class="bare" style="color: var(--muted)">timesmarble ↗</a>
    </div>
  </nav>
);

/** Reusable footer */
export const Footer: FC = () => (
  <footer class="ftr">
    <span>open source · MIT · KG stays on your laptop</span>
    <span>
      <a href="https://github.com/AlexShrestha/events-x-marble" target="_blank" rel="noopener">github</a>
      {" · "}
      <a href="https://timesmarble.com" target="_blank" rel="noopener">timesmarble</a>
    </span>
  </footer>
);

/** Numbered section label, e.g. <SectionLabel num="01" title="install" /> */
export const SectionLabel: FC<{ num: string; title: string }> = ({ num, title }) => (
  <div class="section-num">
    <span class="num">{num}</span>
    <span class="dash">—</span>
    <span>{title}</span>
  </div>
);

/** Standard <head> with fonts pre-loaded + meta + title. */
export const PageHead: FC<{ title: string; description?: string }> = ({ title, description }) => (
  <>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description ? <meta name="description" content={description} /> : null}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link rel="stylesheet" href={FONTS_LINK} />
  </>
);

/** Lightweight `<PropsWithChildren>` wrapper so views look like JSX components. */
export const Page: FC<PropsWithChildren<{ wide?: boolean }>> = ({ wide, children }) => (
  <main class={wide ? "page-wide" : "page"}>{children}</main>
);
