#!/usr/bin/env bash
# audit-leaks.sh — scan the committed codebase for personal-data leaks before any push.
#
# Run from repo root. Exits 0 = clean, non-zero = leaks found.
# Add new patterns as you notice deployment-specific things that should never leak.

set -u
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# Files in the working tree, excluding gitignored ones.
TRACKABLE=$(git ls-files 2>/dev/null)

if [ -z "$TRACKABLE" ]; then
  echo "[audit-leaks] not a git repo or no tracked files — nothing to scan"
  exit 0
fi

# Patterns that must NEVER appear in committed code. Extend as needed.
PATTERNS=(
  # Known personal email of the maintainer (placeholder — replace if forked).
  "alex\.shrestha88@gmail\.com"
  # Common KG file-name shapes; if these are referenced in code, you're about to leak a path.
  "alex-marble-kg"
  "marble-kg\.json"
  # Generic API key shapes (OpenAI / Anthropic / Stripe — paranoia).
  "sk-[A-Za-z0-9_]{20,}"
  "sk_live_[A-Za-z0-9]{20,}"
  # Bearer tokens hardcoded.
  "Bearer\s+[A-Za-z0-9._-]{30,}"
)

FAILED=0
echo "[audit-leaks] scanning $(echo "$TRACKABLE" | wc -l | tr -d ' ') tracked files…"
echo

for pat in "${PATTERNS[@]}"; do
  HITS=$(echo "$TRACKABLE" | xargs -I{} grep -EnH "$pat" "{}" 2>/dev/null | grep -v "audit-leaks.sh" || true)
  if [ -n "$HITS" ]; then
    echo "✗ pattern: $pat"
    echo "$HITS" | sed 's/^/    /'
    echo
    FAILED=1
  fi
done

if [ "$FAILED" -eq 0 ]; then
  echo "✓ clean — no leak patterns matched."
  exit 0
else
  echo "✗ leaks found above. Move secrets to .env (gitignored) or rewrite code to use process.env."
  exit 1
fi
