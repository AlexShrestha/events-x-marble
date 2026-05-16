import type { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren<{ title?: string }>> = ({ title, children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ?? "Events x Marble"}</title>
      <style>{css}</style>
    </head>
    <body>{children}</body>
  </html>
);

const css = `
  :root {
    --bg: #0f1115;
    --fg: #e5e7eb;
    --muted: #8b95a3;
    --accent: #f59e0b;
    --rare: #f43f5e;
    --card: #161922;
    --border: #232733;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
  a { color: inherit; }
  header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; gap: 16px;
    align-items: baseline; flex-wrap: wrap; }
  header h1 { font-size: 20px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
  header .sub { color: var(--muted); font-size: 13px; }
  main { max-width: 960px; margin: 0 auto; padding: 24px; }
  form.filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
  form.filters label { font-size: 12px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; }
  form.filters select, form.filters input {
    background: var(--card); color: var(--fg); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 10px; font: inherit; min-width: 140px;
  }
  form.filters button {
    background: var(--accent); color: #0f1115; border: 0; border-radius: 8px;
    padding: 10px 16px; font-weight: 600; cursor: pointer; align-self: flex-end;
  }
  .day { margin-bottom: 28px; }
  .day h2 { font-size: 14px; font-weight: 600; color: var(--muted); margin: 0 0 12px 0;
    text-transform: uppercase; letter-spacing: 0.06em; }
  .event { background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 14px 16px; margin-bottom: 8px; display: flex; gap: 14px; align-items: flex-start; }
  .event .time { color: var(--muted); font-variant-numeric: tabular-nums; font-size: 13px;
    min-width: 56px; padding-top: 2px; }
  .event .body { flex: 1; }
  .event .title { font-weight: 600; margin-bottom: 4px; }
  .event .meta { color: var(--muted); font-size: 12px; }
  .event .meta a { color: var(--accent); text-decoration: none; }
  .event .rarity { display: inline-block; font-size: 10px;
    padding: 2px 6px; border-radius: 4px; margin-left: 6px; vertical-align: middle;
    font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .rarity-muted { background: #3a3f4a; color: #8b95a3; }
  .rarity-amber { background: #92400e; color: #fbbf24; }
  .rarity-rare { background: #c2410c; color: #fed7aa; }
  .rarity-ultra { background: var(--rare); color: #fff; }
  .source-badge { display: inline-block; background: #232733; color: #8b95a3; font-size: 10px;
    padding: 2px 7px; border-radius: 4px; margin-right: 7px; vertical-align: middle;
    font-weight: 500; letter-spacing: 0.02em; white-space: nowrap; max-width: 140px;
    overflow: hidden; text-overflow: ellipsis; }
  .stats { font-variant-numeric: tabular-nums; }
  .filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .filter-label { font-size: 11px; color: var(--muted); text-transform: uppercase;
    letter-spacing: 0.06em; white-space: nowrap; }
  .chip { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px;
    background: var(--card); border: 1px solid var(--border); color: var(--muted);
    text-decoration: none; cursor: pointer; transition: border-color 0.15s; }
  .chip:hover { border-color: var(--accent); color: var(--fg); }
  .chip-active { background: var(--accent); color: #0f1115; border-color: var(--accent);
    font-weight: 600; }
  .chip-cat.chip-active { background: #6d28d9; border-color: #6d28d9; color: #fff; }
  .filter-row-wrap { gap: 6px; }
  .empty { color: var(--muted); padding: 40px 0; text-align: center; }
  footer { color: var(--muted); font-size: 12px; padding: 24px; text-align: center; }
`;
