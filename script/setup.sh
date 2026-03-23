#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SENTINEL_FILE="$ROOT_DIR/.setup-done"
LOCK_DIR="$ROOT_DIR/.setup-lock"
DEFAULT_WEB_SERVER_URL="http://localhost:5000"
AUTH_BOOTSTRAP_INPUT=$'y\ny\ny\ny\ny\n'

log() {
  printf '[setup] %s\n' "$1"
}

finish() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

get_web_server_url() {
  if [[ -n "${REPLIT_DEV_DOMAIN:-}" ]]; then
    printf 'https://%s\n' "$REPLIT_DEV_DOMAIN"
  else
    printf '%s\n' "$DEFAULT_WEB_SERVER_URL"
  fi
}

get_emulate_url() {
  if [[ -n "${REPLIT_DEV_DOMAIN:-}" ]]; then
    printf 'https://%s/google-emulate\n' "$REPLIT_DEV_DOMAIN"
  else
    printf 'http://localhost:4002\n'
  fi
}

refresh_convex_env_cache() {
  CONVEX_ENV_CACHE="$(npx convex env list 2>/dev/null || true)"
}

has_convex_env_var() {
  local name="$1"
  printf '%s\n' "$CONVEX_ENV_CACHE" | grep -q "^${name}="
}

set_convex_env_var() {
  local name="$1"
  local value="$2"
  local attempt

  for attempt in 1 2 3; do
    if npx convex env set "$name" "$value"; then
      return 0
    fi

    sleep 1
  done

  return 1
}

cd "$ROOT_DIR"

if [[ -f "$SENTINEL_FILE" ]]; then
  log "Setup already completed once. Validating and repairing configuration if needed."
fi

if mkdir "$LOCK_DIR" 2>/dev/null; then
  trap finish EXIT
else
  log "Another setup process is already running. Waiting for it to finish."
  while [[ -d "$LOCK_DIR" ]]; do
    sleep 2
  done

  mkdir "$LOCK_DIR"
  trap finish EXIT
fi

if [[ ! -d node_modules ]]; then
  log "Installing dependencies..."
  npm install
else
  log "Dependencies already installed."
fi

if [[ -f .env.local ]] && grep -q '^VITE_CONVEX_URL=' .env.local; then
  log "Existing Convex settings found in .env.local."
else
  log "Starting one-time Convex setup. Follow the prompts in this terminal."
  npx convex dev --once --tail-logs=disable
fi

WEB_SERVER_URL="$(get_web_server_url)"
EMULATE_URL="$(get_emulate_url)"

refresh_convex_env_cache

if has_convex_env_var "JWT_PRIVATE_KEY" && has_convex_env_var "JWKS"; then
  log "Convex Auth keys already configured."
else
  log "Configuring Convex Auth keys..."
  printf '%s' "$AUTH_BOOTSTRAP_INPUT" | \
    npx @convex-dev/auth --skip-git-check --allow-dirty-git-state --web-server-url "$WEB_SERVER_URL"
  refresh_convex_env_cache
fi

log "Setting SITE_URL to ${WEB_SERVER_URL}..."
set_convex_env_var SITE_URL "$WEB_SERVER_URL"

log "Setting AUTH_GOOGLE_EMULATE_URL to ${EMULATE_URL}..."
set_convex_env_var AUTH_GOOGLE_EMULATE_URL "$EMULATE_URL"

date -u +"%Y-%m-%dT%H:%M:%SZ" > "$SENTINEL_FILE"
log "Setup complete. You can rerun this script any time to repair local or Replit dev auth."
