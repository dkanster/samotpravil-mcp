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
