#!/usr/bin/env bash
# TradieCheck pre-commit hook
# TD-013: Reject process.env in vite.config.js define block
# TD-010: Basic secret pattern check on staged files
#
# Install after cloning:
#   cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# Or add to your onboarding script / Makefile target.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
FAILED=0

# ---------------------------------------------------------------------------
# Check 1 (TD-013): vite.config.js must not expose process.env in define block
# ---------------------------------------------------------------------------
VITE_CONFIG="$REPO_ROOT/vite.config.js"

# Get the staged version of vite.config.js if it is staged; otherwise use the
# working-tree copy so the check is always enforced, not only on config changes.
if git diff --cached --name-only | grep -q "^vite.config.js$"; then
  STAGED_CONTENT="$(git show ":vite.config.js" 2>/dev/null || true)"
elif [ -f "$VITE_CONFIG" ]; then
  STAGED_CONTENT="$(cat "$VITE_CONFIG")"
else
  STAGED_CONTENT=""
fi

if [ -n "$STAGED_CONTENT" ]; then
  # Match: define block that references process.env in any form
  if echo "$STAGED_CONTENT" | grep -qE "define\s*[:({\[][^}]*process\s*\.\s*env" || \
     echo "$STAGED_CONTENT" | grep -qE "'process\.env"; then
    echo ""
    echo "SECURITY ERROR (TD-013): vite.config.js contains a define block that"
    echo "references 'process.env'. This inlines backend env variable VALUES into"
    echo "the compiled frontend bundle and can expose secrets like API keys."
    echo ""
    echo "Fix: Remove process.env.* from the vite.config.js 'define:' section."
    echo "     Use VITE_* prefixed variables for anything the frontend needs."
    echo "     Backend-only vars (TRADES_API_KEY, HRW_API_KEY, etc.) must NEVER"
    echo "     appear in a define block."
    echo ""
    FAILED=1
  fi
fi

# ---------------------------------------------------------------------------
# Check 2 (TD-010): Basic secret pattern scan on staged files
# Looks for long alphanumeric strings adjacent to secret-like key names.
# Intentionally conservative to keep false-positive rate low.
# ---------------------------------------------------------------------------
STAGED_FILES="$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)"

if [ -n "$STAGED_FILES" ]; then
  SECRET_PATTERN='(API_KEY|API_SECRET|CLIENT_SECRET|PRIVATE_KEY|ACCESS_TOKEN|AUTH_TOKEN)[[:space:]]*[:=][[:space:]]*['"'"'"]?[A-Za-z0-9/+_-]{20,}'

  while IFS= read -r file; do
    # Skip binary assets, lock files, and placeholder example files
    case "$file" in
      *.png|*.jpg|*.jpeg|*.gif|*.ico|*.woff|*.woff2|*.ttf|*.eot|*.pdf|\
      package-lock.json|*.example|*.sample)
        continue ;;
    esac

    # Check staged content, not working tree
    STAGED_FILE_CONTENT="$(git show ":$file" 2>/dev/null || true)"
    [ -z "$STAGED_FILE_CONTENT" ] && continue

    MATCH="$(echo "$STAGED_FILE_CONTENT" | grep -E "$SECRET_PATTERN" | \
             grep -iv "example\|placeholder\|your[_-]\|xxx\|changeme\|todo\|fixme\|<\|>" || true)"

    if [ -n "$MATCH" ]; then
      echo ""
      echo "SECURITY WARNING (TD-010): Possible secret detected in staged file: $file"
      echo ""
      echo "Matching line(s):"
      echo "$MATCH" | head -5 | sed 's/^/  /'
      echo ""
      echo "Fix: Remove real credentials from source files."
      echo "     Store secrets in .env (already in .gitignore)."
      echo "     Use placeholder values in .env.example."
      echo ""
      FAILED=1
    fi
  done <<< "$STAGED_FILES"
fi

# ---------------------------------------------------------------------------
if [ "$FAILED" -eq 1 ]; then
  echo "Pre-commit hook FAILED. Commit aborted."
  echo "Run 'npm run pre-commit' to re-run the vite.config.js check locally."
  exit 1
fi

exit 0
