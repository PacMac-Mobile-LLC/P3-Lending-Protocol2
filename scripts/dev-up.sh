#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
STRIPE_FORWARD_URL="http://localhost:${BACKEND_PORT}/webhooks/stripe"

PIDS=()

cleanup() {
  echo ""
  echo "[dev-up] Shutting down background services..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

trap cleanup EXIT INT TERM

run_bg() {
  local name="$1"
  local log_file="$2"
  shift 2

  echo "[dev-up] Starting ${name}..."
  "$@" >"$log_file" 2>&1 &
  local pid=$!
  PIDS+=("$pid")
  echo "[dev-up] ${name} pid=${pid} log=${log_file}"
}

if command -v supabase >/dev/null 2>&1 && [ -f "$ROOT_DIR/supabase/config.toml" ]; then
  echo "[dev-up] Starting local Supabase stack"
  (cd "$ROOT_DIR" && supabase start)
else
  echo "[dev-up] Skipping Supabase local start (CLI missing or supabase/config.toml not present)."
fi

if command -v anvil >/dev/null 2>&1; then
  run_bg "anvil" "$LOG_DIR/anvil.log" anvil
elif [ -f "$ROOT_DIR/contracts/hardhat.config.js" ]; then
  run_bg "hardhat-node" "$LOG_DIR/hardhat.log" npm --prefix "$ROOT_DIR/contracts" exec hardhat -- node
else
  echo "[dev-up] Skipping local chain (anvil and hardhat node are unavailable)."
fi

run_bg "backend" "$LOG_DIR/backend.log" npm --prefix "$ROOT_DIR/server" run dev
run_bg "frontend" "$LOG_DIR/frontend.log" npm --prefix "$ROOT_DIR" run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"

if [ "${ENABLE_STRIPE_LISTENER:-0}" = "1" ]; then
  if command -v stripe >/dev/null 2>&1; then
    run_bg "stripe-listener" "$LOG_DIR/stripe.log" stripe listen --forward-to "$STRIPE_FORWARD_URL"
  else
    echo "[dev-up] ENABLE_STRIPE_LISTENER=1 but Stripe CLI is not installed."
  fi
fi

echo "[dev-up] Services are running."
echo "[dev-up] Frontend: http://localhost:${FRONTEND_PORT}"
echo "[dev-up] Backend:  http://localhost:${BACKEND_PORT}"
echo "[dev-up] Press Ctrl+C to stop all services started by this script."

wait
