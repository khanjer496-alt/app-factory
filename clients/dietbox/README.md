# Dietbox — redesign + web app

Client project built on the App Factory starter (Cloudflare Workers + D1 + Better Auth + Stripe). Standalone: it has its own `package.json` and is not part of the factory workspaces.

| Read first | |
| --- | --- |
| `BRAND_GUIDELINES.md` | The reimagined brand system (logo usage, colour, type, motion, voice, applications). |
| `PRODUCT_SPEC.md` | Market, flows, business rules, content to verify. |
| `DESIGN_DIRECTION.md` | Implementation brief for the UI. |

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # set BETTER_AUTH_SECRET; leave STRIPE_SECRET_KEY empty and keep DEMO_CHECKOUT=true for a no-payment demo
npm run db:migrate:local
npm run dev                      # http://localhost:5173
```

Verification emails are written to `.wrangler/tmp/email/…` locally (path printed in the dev log). Sign up with the `ADMIN_EMAIL` address to see `/admin`.

## Where things live

- `shared/catalog.ts` — menu, programmes, pricing, delivery calendar, rotating daily menus (used by UI **and** Worker).
- `shared/nutrition.ts` — calorie/macro calculator.
- `worker/routes/plans.ts`, `worker/services/plans.ts` — orders, checkout, plan management.
- `worker/routes/admin.ts` — kitchen production sheet.
- `db/migrations/0002_meal_plans.sql` — addresses, orders, delivery days, selections.
- `src/pages/*` — Landing, Menu, Builder, Dashboard, Auth, Admin.
- `public/brand/` — logo files taken from dietbox.ae (raster; request vectors), `public/meals/` + `public/scenes/` — Diet Box's own menu photos (from its talabat listing; see `ASSET_CREDITS.md`). `MENU_NUTRITION.md` — nutrition and allergen review sheet for the kitchen.

## Client preview (workers.dev)

Cloudflare **Workers Builds** redeploys the preview on every push, so no API token lives outside Cloudflare. In the Cloudflare account that should host it, go to Workers & Pages → Create → Import a repository (or, for an existing Worker, Settings → Build → Connect), then set:

| Setting | Value |
| --- | --- |
| Project / Worker name | `dietbox-preview` |
| Repository | `khanjer496-alt/app-factory` |
| Branch | the branch to preview (`main` once merged) |
| Root directory | `clients/dietbox` |
| Build command | `npm run build:preview` |
| Deploy command | `npm run deploy:preview` |
| Build watch paths | include `clients/dietbox/*` |
| Non-production branch builds | off |

`npm run deploy:preview` (`scripts/deploy-preview-ci.sh`) works in any account:
- it finds or creates the `dietbox-preview-db` D1 database and applies migrations;
- it points `APP_URL` / `BETTER_AUTH_URL` at that account's `https://dietbox-preview.<subdomain>.workers.dev`;
- it creates `BETTER_AUTH_SECRET` (random) and `DEMO_CHECKOUT=true` on the first deploy.

To move the preview to another account, connect the repo there. The new account gets a new URL and an empty database.

Manual alternative from a machine with a token:

```bash
export CLOUDFLARE_API_TOKEN=…   # Workers Scripts:Edit + D1:Edit
export CLOUDFLARE_ACCOUNT_ID=…
./scripts/deploy-preview.sh      # prints https://dietbox-preview.<subdomain>.workers.dev
```

The `preview` environment has its own D1 database. Sign-ups skip email verification there (no email binding), and checkout runs in demo mode (no card needed). Don't use it for real customers.

## Payments

Plans are Stripe subscriptions that renew every 1, 2 or 4 weeks. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` and point a Stripe webhook at `/api/billing/webhook` with these events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`. In Stripe, turn on the customer portal (payment method updates) and Smart Retries. The daily cron (`triggers.crons`, 09:00 UAE) sends reminders and keeps charge dates aligned with skips and pauses. In demo mode it also "charges" due renewals, so the preview shows renewals without Stripe. `DEMO_CHECKOUT` only works when `APP_ENV=development` **and** Stripe is not configured.

## Tests

```bash
npm test            # pricing, calendar, menu rules, nutrition
npm run test:e2e    # public pages + anonymous API rejection
```
