#!/usr/bin/env bash
#
# MASGARTI Fit — single dev entrypoint
#
# Architecture (POC):
#   Backend  → Dedicated Node API (apps/backend)
#   Frontend → Expo mobile app (apps/mobile) with a development build (not App Store Expo Go).
#
# SDK 56 requires a dev client — App Store Expo Go does not support this project.
#
# Usage:
#   ./dev.sh              # Metro for dev client (after first native build)
#   ./dev.sh --ios        # Build & run iOS dev client (first time) or open simulator
#   ./dev.sh --android    # Build & run Android dev client
#   ./dev.sh --local      # local backend API + Expo
#   ./dev.sh --web        # Expo web preview
#   ./dev.sh --help
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ENV_FILE="$MOBILE_DIR/.env.local"
ENV_EXAMPLE="$MOBILE_DIR/.env.example"
IOS_DIR="$MOBILE_DIR/ios"
ANDROID_DIR="$MOBILE_DIR/android"

BACKEND="${FITOWN_BACKEND:-hosted}"
EXPO_ARGS=(--dev-client)
RUN_NATIVE=0
PLATFORM=""

print_help() {
  cat <<'EOF'
MASGARTI Fit dev orchestrator

SDK 56 does NOT work with the App Store version of Expo Go.
This project uses an Expo development build (your own native app + Metro).

First time on iOS simulator:
  ./dev.sh --ios          # builds & installs the dev client (~2–5 min)

Daily development:
  ./dev.sh --ios          # opens simulator + Metro
  ./dev.sh                # Metro only (simulator already has dev client)

Commands:
  ./dev.sh              Dev server for development build
  ./dev.sh --ios        iOS simulator (builds native app if needed)
  ./dev.sh --android    Android emulator (builds native app if needed)
  ./dev.sh --local      Local backend API + Expo
  ./dev.sh --web        Web preview

Environment:
  FITOWN_BACKEND=hosted|local   Override backend mode
  apps/mobile/.env.local        EXPO_PUBLIC_BACKEND_URL
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      print_help
      exit 0
      ;;
    --local)
      BACKEND="local"
      shift
      ;;
    --ios)
      RUN_NATIVE=1
      PLATFORM="ios"
      shift
      ;;
    --android)
      RUN_NATIVE=1
      PLATFORM="android"
      shift
      ;;
    --web)
      EXPO_ARGS+=(--web)
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      print_help
      exit 1
      ;;
  esac
done

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  MASGARTI Fit Dev Stack                                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm is required. Install: npm install -g pnpm" >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  echo "→ Installing dependencies..."
  (cd "$ROOT_DIR" && pnpm install)
fi

configure_local_backend_env() {
  export EXPO_PUBLIC_BACKEND_URL="${EXPO_PUBLIC_BACKEND_URL:-http://127.0.0.1:8787}"
  echo "→ Backend: dedicated local API"
  echo "   API URL : $EXPO_PUBLIC_BACKEND_URL"
}

validate_hosted_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "WARNING: $ENV_FILE not found."
    if [[ -f "$ENV_EXAMPLE" ]]; then
      echo "         Copy and fill in: cp apps/mobile/.env.example apps/mobile/.env.local"
    fi
    echo ""
    return
  fi

  set -a && source "$ENV_FILE" && set +a

  if [[ -z "${EXPO_PUBLIC_BACKEND_URL:-}" ]]; then
    echo "ERROR: apps/mobile/.env.local must set EXPO_PUBLIC_BACKEND_URL" >&2
    exit 1
  fi

  if [[ "$EXPO_PUBLIC_BACKEND_URL" == *"api.example.com"* ]]; then
    echo "ERROR: Replace placeholder backend URL in apps/mobile/.env.local" >&2
    exit 1
  fi

  echo "→ Backend: dedicated API"
  echo "   API URL : $EXPO_PUBLIC_BACKEND_URL"
}

case "$BACKEND" in
  local) configure_local_backend_env ;;
  hosted) validate_hosted_env ;;
  *)
    echo "ERROR: FITOWN_BACKEND must be 'hosted' or 'local' (got: $BACKEND)" >&2
    exit 1
    ;;
esac

echo ""
echo "→ Frontend: Expo development build (@fitown/mobile)"
echo "   NOT compatible with App Store Expo Go (SDK 56)."
echo ""

cd "$ROOT_DIR"

if [[ "$RUN_NATIVE" -eq 1 ]]; then
  NATIVE_DIR="$IOS_DIR"
  RUN_CMD=(pnpm --filter @fitown/mobile exec expo run:ios --no-bundler)
  if [[ "$PLATFORM" == "android" ]]; then
    NATIVE_DIR="$ANDROID_DIR"
    RUN_CMD=(pnpm --filter @fitown/mobile exec expo run:android --no-bundler)
  fi

  if [[ ! -d "$NATIVE_DIR" ]]; then
    echo "→ First native build: generating ios/android project and installing dev client..."
    echo "   This takes a few minutes once; later launches are much faster."
    echo ""
  fi

  "${RUN_CMD[@]}"
  echo ""
  echo "→ Native build finished. Starting Metro for live refresh..."
  if [[ "$PLATFORM" == "ios" ]]; then
    EXPO_ARGS+=(--ios)
  elif [[ "$PLATFORM" == "android" ]]; then
    EXPO_ARGS+=(--android)
  fi
fi

echo "→ Starting Metro (development build mode)"
echo "   Run ./dev.sh --ios or ./dev.sh --android if no dev client is installed yet."
echo ""

exec pnpm --filter @fitown/mobile exec expo start "${EXPO_ARGS[@]}"
