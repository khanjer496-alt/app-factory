#!/usr/bin/env bash
# Manual alternative to Workers Builds (see README). Deploys the client preview to https://dietbox-preview.<your-subdomain>.workers.dev
# Needs CLOUDFLARE_API_TOKEN (Workers Scripts:Edit, D1:Edit) and CLOUDFLARE_ACCOUNT_ID.
# Safe to re-run: it reuses the D1 database and secrets it created the first time.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"

DB_NAME="dietbox-preview-db"
WORKER="dietbox-preview"

echo "→ D1 database"
db_id() { npx wrangler d1 list --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s).find(x=>x.name===process.argv[1]);process.stdout.write(r?r.uuid:"")})' "$DB_NAME"; }
ID="$(db_id)"
if [ -z "$ID" ]; then npx wrangler d1 create "$DB_NAME" >/dev/null; ID="$(db_id)"; fi
[ -n "$ID" ] || { echo "Could not create or find $DB_NAME"; exit 1; }

echo "→ workers.dev subdomain"
SUB="$(curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/subdomain" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).result?.subdomain||""))')"
[ -n "$SUB" ] || { echo "No workers.dev subdomain yet: open Workers & Pages in the Cloudflare dashboard once to claim one."; exit 1; }
URL="https://$WORKER.$SUB.workers.dev"

# Write the preview URL into the preview block of wrangler.jsonc (the database is found by name).
node - "$URL" <<'NODE'
const fs = require("fs");
const [url] = process.argv.slice(2);
const s = fs.readFileSync("wrangler.jsonc", "utf8");
fs.writeFileSync("wrangler.jsonc", s.replace(/https:\/\/dietbox-preview[^"]*/g, url));
NODE

echo "→ build, migrations, deploy"
npm run build:preview
npm run deploy:preview

echo "→ secrets (first run only)"
EXISTING="$(npx wrangler secret list --env preview 2>/dev/null || true)"
echo "$EXISTING" | grep -q BETTER_AUTH_SECRET || openssl rand -hex 32 | npx wrangler secret put BETTER_AUTH_SECRET --env preview
echo "$EXISTING" | grep -q DEMO_CHECKOUT || echo "true" | npx wrangler secret put DEMO_CHECKOUT --env preview

echo "✓ Preview live at $URL"
