#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SENTINEL_FILE="$ROOT_DIR/.setup-done"
LOCK_DIR="$ROOT_DIR/.setup-lock"
DEFAULT_WEB_SERVER_URL="http://localhost:5000"

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

cd "$ROOT_DIR"

if [[ -f "$SENTINEL_FILE" ]]; then
  log "Setup already completed. Skipping."
  exit 0
fi

if mkdir "$LOCK_DIR" 2>/dev/null; then
  trap finish EXIT
else
  log "Another setup process is already running. Waiting for it to finish."
  while [[ -d "$LOCK_DIR" ]]; do
    sleep 2
  done

  if [[ -f "$SENTINEL_FILE" ]]; then
    log "Setup completed by another process."
    exit 0
  fi

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

log "Configuring Convex Auth keys..."
npx @convex-dev/auth --skip-git-check --allow-dirty-git-state --web-server-url "$WEB_SERVER_URL"

if [[ -n "${REPLIT_DEV_DOMAIN:-}" ]]; then
  log "Setting SITE_URL for this Replit workspace..."
  npx convex env set SITE_URL "https://${REPLIT_DEV_DOMAIN}"
fi

date -u +"%Y-%m-%dT%H:%M:%SZ" > "$SENTINEL_FILE"
log "Setup complete. Future boots will skip these steps unless .setup-done is removed."
