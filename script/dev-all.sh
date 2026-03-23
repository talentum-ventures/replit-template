#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDS=()

cleanup() {
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
}

monitor_children() {
  while true; do
    for pid in "${PIDS[@]}"; do
      if ! kill -0 "$pid" 2>/dev/null; then
        return 1
      fi
    done

    sleep 1
  done
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"

if ! grep -q '^VITE_CONVEX_URL=' "$ROOT_DIR/.env.local" 2>/dev/null; then
  echo "[dev-all] First-time setup detected. Running setup..."
  bash "$ROOT_DIR/script/setup.sh"
fi

echo "[dev-all] Starting Google emulate, Convex, and Vite..."

npm run dev:emulate &
PIDS+=($!)

npm run dev:backend &
PIDS+=($!)

npm run dev &
PIDS+=($!)

monitor_children
