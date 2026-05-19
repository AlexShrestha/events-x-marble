#!/usr/bin/env bash
# Autonomous weekly delivery — refresh Tier 0 corpus, score with marble, send via SMTP.
# Invoked by launchd (see scripts/install-launchd.sh) every Sunday 8am local.
#
# Logs to /tmp/events-x-marble-weekly.log so failures don't disappear.

set -uo pipefail

REPO="/Users/skela/Documents/events x marble"
BUN="/opt/homebrew/bin/bun"
LOG="/tmp/events-x-marble-weekly.log"

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

echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') === done" >> "$LOG"
echo "" >> "$LOG"
