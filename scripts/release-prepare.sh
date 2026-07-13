#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"

echo "==> Release prepare for v${VERSION}"
echo ""

npm run sync-versions
npm run pre-publish-check
npm test

echo ""
echo "--- Maintainer warnings (non-blocking) ---"
npm run check-superseded-prs || echo "WARN: superseded PRs still open"
node scripts/check-scaffold-ship.mjs --warn-only || true
node scripts/check-upstream-wishlist.mjs --fail-on-shipped || echo "WARN: shipped endpoints need typed tools"
node scripts/check-v19-readiness.mjs --warn-only || echo "WARN: v1.9 blocking criteria pending"

echo ""
echo "Ready to publish:"
echo "  git tag v${VERSION}"
echo "  git push origin v${VERSION}"
echo ""
echo "Workflows triggered:"
echo "  - Publish npm"
echo "  - Publish MCP Registry (after npm)"
echo ""
echo "Post-publish:"
echo "  npx -y samotpravil-mcp@${VERSION}"
echo "  curl registry MCP search (see docs/PUBLISH.md)"
