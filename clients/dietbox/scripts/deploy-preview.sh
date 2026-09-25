#!/usr/bin/env bash
# Manual alternative to Workers Builds (see README): builds and deploys the client preview from this machine.
# Needs CLOUDFLARE_API_TOKEN (Workers Scripts:Edit, D1:Edit) and CLOUDFLARE_ACCOUNT_ID.
# Safe to re-run: it reuses the D1 database and secrets it created the first time.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"
npm run build:preview
npm run deploy:preview
