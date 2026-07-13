#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash -n "$ROOT/samotpravil-mcp.sh"
bash -n "$ROOT/swagger-mcp.sh"
bash -n "$ROOT/setup.sh"
echo "OK: shell scripts syntax"

npm run build --prefix "$ROOT"
echo "OK: TypeScript build"

node "$ROOT/scripts/check-docs.mjs"
echo "OK: docs helpers"

node "$ROOT/scripts/check-safety.mjs"
echo "OK: safety helpers"

node "$ROOT/scripts/check-resources.mjs"
echo "OK: MCP resources"

node "$ROOT/scripts/check-v12.mjs"
echo "OK: v1.2 auto tools and prompts"

node "$ROOT/scripts/check-postman.mjs"
echo "OK: postman helpers"

node "$ROOT/scripts/check-smithery.mjs"
echo "OK: Smithery metadata"

node "$ROOT/scripts/check-openapi.mjs"
echo "OK: OpenAPI drift"

node "$ROOT/scripts/check-snapshot-age.mjs"
echo "OK: snapshot age"

node "$ROOT/scripts/check-org-migration.mjs"
echo "OK: org migration interim state"

node "$ROOT/scripts/check-promo-versions.mjs"
echo "OK: promo version alignment"

node "$ROOT/scripts/check-sdk-parity.mjs"
echo "OK: SDK parity"

node "$ROOT/scripts/check-upstream-wishlist.mjs"
echo "OK: upstream wishlist tracking"

node "$ROOT/scripts/check-tool-catalog.mjs"
echo "OK: tool catalog"

node "$ROOT/scripts/check-mcp-integration.mjs"
echo "OK: MCP integration"

node "$ROOT/scripts/check-tools-manifest.mjs"
echo "OK: tools manifest"

node --test "$ROOT/test/"*.test.mjs
echo "OK: unit tests"

node "$ROOT/scripts/export-openapi.mjs"
echo "OK: OpenAPI export"

if [ -d "$ROOT/docusaurus/node_modules" ]; then
  node "$ROOT/scripts/check-docusaurus.mjs"
  echo "OK: Docusaurus build"
else
  echo "SKIP: Docusaurus (run npm run docusaurus:install locally or npm ci --prefix docusaurus in CI)"
fi
