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

node "$ROOT/scripts/export-openapi.mjs"
echo "OK: OpenAPI export"
