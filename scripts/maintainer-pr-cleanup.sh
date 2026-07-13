#!/usr/bin/env bash
# Maintainer helper: commands to close superseded PRs after v1.7.0 release.
# Run locally with gh auth as repo admin (cloud agent lacks close permission).

set -euo pipefail

echo "=== Superseded feature PRs (close with comment) ==="
for pr in 23 24 25 37; do
  echo "gh pr close $pr --comment 'Superseded by #38 (v1.7.0 unified release, merged to main).'"
done

echo ""
echo "=== Superseded Dependabot PRs (merged in #52) ==="
for pr in 39 40 41 42 43 46; do
  echo "gh pr close $pr --comment 'Consolidated in #52 (safe dependency bumps).'"
done

echo ""
echo "=== Deferred Dependabot PRs (close with deferral note) ==="
DEFERRAL="https://github.com/dkanster/samotpravil-mcp/blob/main/docs/DEPENDENCY_DEFERRALS.md"
for pr in 44 45 47 48 49; do
  echo "gh pr close $pr --comment 'Deferred — see $DEFERRAL. Revisit for v1.8.0.'"
done

echo ""
echo "Copy-paste the lines above, or run: bash scripts/maintainer-pr-cleanup.sh | grep '^gh' | bash"
