#!/usr/bin/env bash
# Launcher Samotpravil MCP для Cursor. Копируется в .cursor/samotpravil-mcp.sh проекта.
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
  for file in "$ROOT/.env.samotpravil" "$ROOT/ai/.env.samotpravil" "$ROOT/.env.postman" "$ROOT/ai/.env.postman"; do
    [[ -f "$file" ]] || continue
    local key val
    for key in SAMOTPRAVIL_API_KEY POSTMAN_API_KEY POSTMAN_COLLECTION_UID POSTMAN_API_BASE_URL; do
      if [[ -z "${!key:-}" ]]; then
        val="$(read_env_value "$key" "$file" || true)"
        [[ -n "$val" ]] && export "$key=$val"
      fi
    done
    [[ -n "${SAMOTPRAVIL_API_KEY:-}" || -n "${POSTMAN_API_KEY:-}" ]] && return 0
  done
  return 1
}

load_env || true

run_samotpravil_mcp() {
  local candidates=(
    "$ROOT/dist/index.js"
    "$SAMOTPRAVIL_MCP_HOME/dist/index.js"
  )

  for entry in "${candidates[@]}"; do
    if [[ -f "$entry" ]]; then
      exec node "$entry"
    fi
  done

  echo "Samotpravil MCP: не найден dist/index.js." >&2
  echo "  Запустите setup.sh из репозитория samotpravil-mcp или соберите проект:" >&2
  echo "  cd samotpravil-api-mcp && npm install && npm run build" >&2
  exit 1
}

run_samotpravil_mcp
