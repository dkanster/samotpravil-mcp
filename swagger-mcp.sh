#!/usr/bin/env bash
# Launcher Swagger-MCP (Vizioz) для Cursor. Копируется в .cursor/swagger-mcp.sh проекта.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SAMOTPRAVIL_MCP_HOME="${SAMOTPRAVIL_MCP_HOME:-__SAMOTPRAVIL_MCP_HOME__}"
if [[ "$SAMOTPRAVIL_MCP_HOME" == "__SAMOTPRAVIL_MCP_HOME__" ]]; then
  SAMOTPRAVIL_MCP_HOME="$ROOT"
fi

read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 1
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -n "$line" ]] || continue
    if [[ "$line" == "$key="* ]]; then
      local val="${line#*=}"
      val="${val#"${val%%[![:space:]]*}"}"
      val="${val%"${val##*[![:space:]]}"}"
      if [[ ${#val} -ge 2 && ( ( "$val" == \"*\" && "$val" == *\" ) || ( "$val" == \'*\' && "$val" == *\' ) ) ]]; then
        val="${val:1:${#val}-2}"
      fi
      printf '%s' "$val"
      return 0
    fi
  done < "$file"
  return 1
}

load_env() {
  local file
  for file in "$ROOT/.env.samotpravil" "$ROOT/ai/.env.samotpravil" "$ROOT/.env.swaggerhub"; do
    [[ -f "$file" ]] || continue
    local key val
    for key in SAMOTPRAVIL_SWAGGER_URL SWAGGERHUB_OWNER SWAGGERHUB_API_NAME SWAGGERHUB_VERSION SWAGGERHUB_IS_PRIVATE; do
      if [[ -z "${!key:-}" ]]; then
        val="$(read_env_value "$key" "$file" || true)"
        [[ -n "$val" ]] && export "$key=$val"
      fi
    done
  done
}

load_env || true

BUILD_MARKER="$SAMOTPRAVIL_MCP_HOME/vendor/swagger-mcp/build/index.js"
if [[ ! -f "$BUILD_MARKER" ]]; then
  npm run prepare-swagger-mcp --prefix "$SAMOTPRAVIL_MCP_HOME" >/dev/null
fi

exec node "$SAMOTPRAVIL_MCP_HOME/scripts/swagger-mcp-launcher.mjs"
