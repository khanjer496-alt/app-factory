#!/usr/bin/env bash
# Deploy step for the client preview. Workers Builds runs it as `npm run deploy:preview` after `npm run build:preview`.
# Works in any Cloudflare account, so the preview can be moved by connecting the repo in another account:
#   1. finds or creates the dietbox-preview-db D1 database and pins its id in the built config;
#   2. points APP_URL / BETTER_AUTH_URL at this account's workers.dev address;
#   3. applies D1 migrations, deploys, and creates missing secrets (random BETTER_AUTH_SECRET, DEMO_CHECKOUT=true).
# Needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID with Workers Scripts:Edit and D1:Edit (Workers Builds provides both).
set -euo pipefail
cd "$(dirname "$0")/.."

CONFIG="dist/dietbox/wrangler.json"
DB_NAME="dietbox-preview-db"
WORKER="${WRANGLER_CI_OVERRIDE_NAME:-dietbox-preview}"
[ -f "$CONFIG" ] || { echo "No $CONFIG. Run npm run build:preview first."; exit 1; }

echo "→ D1 database $DB_NAME"
db_id() { npx wrangler d1 list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s).find(x=>x.name===process.argv[1]);process.stdout.write(r?r.uuid:"")})' "$DB_NAME"; }
ID="$(db_id)"
if [ -z "$ID" ]; then npx wrangler d1 create "$DB_NAME" >/dev/null; ID="$(db_id)"; fi
[ -n "$ID" ] || { echo "Could not create or find $DB_NAME"; exit 1; }

echo "→ workers.dev address"
URL=""
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  SUB="$(curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/subdomain" \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).result?.subdomain||""))' || true)"
  [ -n "$SUB" ] && URL="https://$WORKER.$SUB.workers.dev"
fi
[ -n "$URL" ] || echo "  Could not read the workers.dev subdomain; keeping APP_URL from wrangler.jsonc."

node scripts/pin-preview-config.mjs "$CONFIG" "$ID" "$URL"

echo "→ migrations"
npx wrangler d1 migrations apply "$DB_NAME" --remote -c "$CONFIG"

echo "→ deploy"
npx wrangler deploy -c "$CONFIG"

echo "→ secrets (created once, kept afterwards)"
EXISTING="$(npx wrangler secret list -c "$CONFIG" 2>/dev/null || true)"
echo "$EXISTING" | grep -q BETTER_AUTH_SECRET || node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))' | npx wrangler secret put BETTER_AUTH_SECRET -c "$CONFIG"
echo "$EXISTING" | grep -q DEMO_CHECKOUT || printf "true" | npx wrangler secret put DEMO_CHECKOUT -c "$CONFIG"

echo "✓ Preview live at ${URL:-the APP_URL in wrangler.jsonc}"
