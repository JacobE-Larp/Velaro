#!/usr/bin/env bash
set -euo pipefail

cd /repo

export VILARO_STATE_DIR="/tmp/vilaro-test"
export VILARO_CONFIG_PATH="${VILARO_STATE_DIR}/vilaro.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${VILARO_STATE_DIR}/credentials"
mkdir -p "${VILARO_STATE_DIR}/agents/main/sessions"
echo '{}' >"${VILARO_CONFIG_PATH}"
echo 'creds' >"${VILARO_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${VILARO_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm vilaro reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${VILARO_CONFIG_PATH}"
test ! -d "${VILARO_STATE_DIR}/credentials"
test ! -d "${VILARO_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${VILARO_STATE_DIR}/credentials"
echo '{}' >"${VILARO_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm vilaro uninstall --state --yes --non-interactive

test ! -d "${VILARO_STATE_DIR}"

echo "OK"
