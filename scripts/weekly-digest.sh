#!/usr/bin/env bash
# Autonomous weekly delivery — refresh Tier 0 corpus, score with marble, send via SMTP.
# Invoked by launchd (see scripts/install-launchd.sh) every Sunday 8am local.
#
# Logs to /tmp/events-x-marble-weekly.log so failures don't disappear.
#
# Repo path is derived from this script's own location, so contributors don't
# have to edit it for their machine. Bun is looked up via PATH; override with
# EXM_BUN=/path/to/bun if your shell can't find it (e.g. in launchd contexts).

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUN="${EXM_BUN:-$(command -v bun || echo /opt/homebrew/bin/bun)}"
LOG="${EXM_LOG:-/tmp/events-x-marble-weekly.log}"

echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') === weekly digest starting" >> "$LOG"

cd "$REPO" || {
  echo "  ✗ repo not found at $REPO" >> "$LOG"
  exit 1
}

# Refresh the cheap corpus (Tier 0 only — iCal/JSON, no LLM cost).
echo "  refreshing Tier 0 corpus…" >> "$LOG"
"$BUN" run pipeline --city barcelona --tier 0 --days 30 >> "$LOG" 2>&1 || \
  echo "  ⚠ tier-0 refresh hit an error; continuing with stale corpus" >> "$LOG"

# Score + render + send.
echo "  scoring + sending…" >> "$LOG"
if "$BUN" run deliver --city barcelona --days 14 --threshold 0.85 --notes "weekly auto-digest" --send >> "$LOG" 2>&1; then
  echo "  ✓ delivered" >> "$LOG"
else
  echo "  ✗ deliver failed (see lines above)" >> "$LOG"
  exit 1
fi

# Push the sanitized "rent payload" (picks + emoji palette + accent colors) to
# Vercel-at-rest so events.timesmarble.com can render personalized. Failure here
# is non-fatal — the site falls back to public mode if no payload is present.
echo "  pushing rent payload to Turso…" >> "$LOG"
if "$BUN" run push-picks --city barcelona --threshold 0.85 >> "$LOG" 2>&1; then
  echo "  ✓ rent payload pushed" >> "$LOG"
else
  echo "  ⚠ push-picks failed; site stays in public mode this week" >> "$LOG"
fi

# KG-aware source scouting. Asks the free LLM cascade for niche Barcelona sources
# that match the laptop's KG-derived interest brief; the verify step drops dead
# URLs; survivors persist as enabled=false rows for manual review. Re-runs are
# idempotent — persistCandidates dedupes by URL.
echo "  scouting new sources from KG…" >> "$LOG"
if "$BUN" run scout:kg --city barcelona --top 8 >> "$LOG" 2>&1; then
  echo "  ✓ scout:kg completed" >> "$LOG"
else
  echo "  ⚠ scout:kg failed; continuing" >> "$LOG"
fi

echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') === done" >> "$LOG"
echo "" >> "$LOG"
