import type { FC, PropsWithChildren } from "hono/jsx";
import { FONTS_LINK } from "./theme.tsx";

interface AccentPalette {
  primary: string;
  rare: string;
  card: string;
}

interface LayoutProps {
  title?: string;
  /** Optional KG-derived palette. Null → default theme. */
  accent?: AccentPalette | null;
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ title, accent, children }) => {
  // KG-derived accent overrides the bright fg color used on chips/badges so
  // each user's dashboard inherits a subtle personalization tint. We do NOT
  // override --bg or --fg (those are part of the brand palette).
  const overrideCss = accent
    ? `:root { --kg-accent: ${accent.primary}; --kg-rare: ${accent.rare}; }`
    : "";
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title ?? "events × marble"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link rel="stylesheet" href={FONTS_LINK} />
        <style>{css}</style>
        {overrideCss ? <style>{overrideCss}</style> : null}
      </head>
      <body>{children}</body>
    </html>
  );
};

const css = `
  :root {
    --bg:     #0a0a0a;
    --bg-2:   #141414;
    --bg-3:   #1a1a1a;
    --fg:     #f5f5f4;
    --fg-2:   #d4d4d4;
    --muted:  #737373;
    --muted-2:#525252;
    --line:   #262626;
    --warn:   #fbbf24;
    --err:    #ef4444;
    --ok:     #10b981;
    /* KG-personalized accents — defaulted to white if no KG payload. Override
       via the optional <Layout accent={...}> prop. */
    --kg-accent: #f5f5f4;
    --kg-rare:   #fbbf24;
    --serif:  "Fraunces", "Times New Roman", Times, serif;
    --sans:   "Geist", -apple-system, "Helvetica Neue", Arial, sans-serif;
    --mono:   "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg);
    font-family: var(--sans); font-size: 15px; line-height: 1.55;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  a { color: inherit; text-decoration: none; }

  /* Top bar (events dashboard) */
  header { padding: 28px 24px 24px; border-bottom: 1px solid var(--line);
    display: flex; gap: 16px; align-items: baseline; flex-wrap: wrap;
    max-width: 1100px; margin: 0 auto; }
  header h1 { font-family: var(--serif); font-size: 30px; margin: 0;
    font-weight: 300; letter-spacing: -0.02em; }
  header .sub { color: var(--muted); font-size: 13px; }
  header .stats { font-variant-numeric: tabular-nums; }

  main { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }

  /* Filter bar */
  form.filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
  form.filters label { font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 4px;
    text-transform: uppercase; letter-spacing: 0.06em; font-family: var(--mono); }
  form.filters select, form.filters input {
    background: var(--bg-2); color: var(--fg); border: 1px solid var(--line);
    padding: 8px 10px; font: inherit; font-family: var(--sans); min-width: 140px;
    border-radius: 0;
  }
  form.filters select:focus, form.filters input:focus { outline: none; border-color: var(--fg); }
  form.filters button {
    background: var(--fg); color: var(--bg); border: 0;
    padding: 9px 18px; font-weight: 500; cursor: pointer; align-self: flex-end;
    text-transform: lowercase; font-size: 13px;
  }
  form.filters button:hover { opacity: 0.88; }

  .day { margin-bottom: 32px; }
  .day h2 {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    color: var(--muted); margin: 0 0 14px 0;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .event {
    background: var(--bg-2); border: 1px solid var(--line);
    padding: 16px 18px; margin-bottom: 6px;
    display: flex; gap: 16px; align-items: flex-start;
    transition: border-color 0.15s;
  }
  .event:hover { border-color: var(--line); background: var(--bg-3); }
  .event .time { color: var(--muted); font-family: var(--mono);
    font-size: 12px; min-width: 56px; padding-top: 3px; }
  .event .body { flex: 1; min-width: 0; }
  .event .title { font-weight: 500; margin-bottom: 4px; font-size: 15px; }
  .event .meta { color: var(--muted); font-size: 12px; }
  .event .meta a { color: var(--fg); border-bottom: 1px solid var(--line); }
  .event .meta a:hover { border-color: var(--fg); }

  .event .rarity {
    display: inline-block; font-family: var(--mono); font-size: 9px;
    padding: 2px 6px; border: 1px solid var(--line);
    margin-left: 8px; vertical-align: middle;
    font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--muted);
  }
  .rarity-muted { color: var(--muted-2); }
  .rarity-amber { color: var(--warn); border-color: rgba(251,191,36,0.4); }
  .rarity-rare  { color: var(--fg); border-color: var(--fg); }
  .rarity-ultra { color: var(--bg); background: var(--fg); border-color: var(--fg); }

  .source-badge {
    display: inline-block; background: transparent; color: var(--muted);
    font-family: var(--mono); font-size: 10px;
    padding: 2px 6px; border: 1px solid var(--line);
    margin-right: 8px; vertical-align: middle;
    font-weight: 400; letter-spacing: 0.02em; white-space: nowrap;
    max-width: 160px; overflow: hidden; text-overflow: ellipsis;
  }

  .filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
  .filter-label { font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }

  .chip {
    display: inline-block; padding: 5px 12px; font-size: 12px;
    background: var(--bg-2); border: 1px solid var(--line); color: var(--muted);
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
    text-transform: lowercase;
  }
  .chip:hover { border-color: var(--fg); color: var(--fg); }
  .chip-active { background: var(--fg); color: var(--bg); border-color: var(--fg); font-weight: 500; }
  .chip-cat.chip-active { background: var(--fg); color: var(--bg); border-color: var(--fg); }
  .filter-row-wrap { gap: 6px; }

  .empty { color: var(--muted); padding: 64px 0; text-align: center;
    font-family: var(--serif); font-style: italic; font-size: 18px; }

  footer {
    color: var(--muted); font-size: 12px; padding: 32px 24px;
    text-align: center; border-top: 1px solid var(--line); margin-top: 64px;
    font-family: var(--mono); letter-spacing: 0.04em;
  }

  /* --- Personalization layer --- */
  .me-badge {
    display: inline-block; font-family: var(--mono); font-size: 10px;
    padding: 2px 8px; border: 1px solid var(--kg-accent); color: var(--kg-accent);
    margin-left: 10px; font-weight: 500; letter-spacing: 0.06em;
    text-transform: uppercase; vertical-align: middle;
  }
  .picks {
    margin: 16px 0 32px 0; padding: 24px 24px;
    border: 1px solid var(--kg-accent);
    background: var(--bg-2);
  }
  .picks-header { display: flex; gap: 12px; align-items: baseline; margin-bottom: 16px; }
  .picks-header h2 {
    font-family: var(--mono); font-size: 11px; font-weight: 500; color: var(--kg-accent);
    margin: 0; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .picks-sub { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .picks-list { display: flex; flex-direction: column; gap: 6px; }
  .pick {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 14px 14px; background: var(--bg); border: 1px solid var(--line);
    transition: border-color 0.15s;
  }
  .pick:hover { border-color: var(--kg-accent); }
  .pick-rank {
    font-family: var(--serif); font-size: 22px; font-weight: 300; font-style: italic;
    color: var(--kg-accent); min-width: 26px; text-align: center; padding-top: 0;
  }
  .pick-body { flex: 1; min-width: 0; }
  .pick-title { font-weight: 500; margin-bottom: 4px; font-size: 15px; }
  .pick-emoji { margin-right: 6px; }
  .pick-rationale {
    font-family: var(--serif); font-style: italic; font-size: 13px;
    color: var(--fg-2); margin-bottom: 6px; line-height: 1.4;
  }
  .pick-meta { color: var(--muted); font-family: var(--mono); font-size: 11px; }
  .title-emoji { margin-right: 6px; }
  .event-picked {
    border-color: var(--kg-accent);
    box-shadow: inset 2px 0 0 0 var(--kg-accent);
  }
`;
