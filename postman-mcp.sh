#!/usr/bin/env bash
# Launcher Postman MCP для Cursor. Копируется в .cursor/postman-mcp.sh проекта.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

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
  for file in "$ROOT/.env.postman" "$ROOT/ai/.env.postman"; do
    [[ -f "$file" ]] || continue
    local key val
    for key in POSTMAN_API_KEY POSTMAN_MCP_MODE POSTMAN_API_BASE_URL; do
      if [[ -z "${!key:-}" ]]; then
        val="$(read_env_value "$key" "$file" || true)"
        [[ -n "$val" ]] && export "$key=$val"
      fi
    done
    return 0
  done
  return 1
}

load_env || true

if [[ -z "${POSTMAN_API_KEY:-}" ]]; then
  echo "Postman MCP: POSTMAN_API_KEY не задан." >&2
  echo "  Создайте .env.postman из .env.postman.example" >&2
  echo "  Ключ: https://go.postman.co/settings/me/api-keys" >&2
  exit 1
fi

MODE="${POSTMAN_MCP_MODE:-code}"
ARGS=(-y @postman/postman-mcp-server)
case "$MODE" in
  minimal) ;;
  code) ARGS+=(--code) ;;
  full) ARGS+=(--full) ;;
  *)
    echo "Postman MCP: неизвестный POSTMAN_MCP_MODE=$MODE (minimal|code|full)" >&2
    exit 1
    ;;
esac

if [[ "${POSTMAN_API_BASE_URL:-}" == *".eu.postman.com"* ]]; then
  ARGS+=(--region eu)
fi

exec npx "${ARGS[@]}"
