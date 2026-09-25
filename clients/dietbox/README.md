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
- `public/brand/` — logo files taken from dietbox.ae (raster; request vectors), `public/meals/` + `public/scenes/` — placeholder photography (Unsplash).

## Client preview (workers.dev)

```bash
export CLOUDFLARE_API_TOKEN=…   # Workers Scripts:Edit + D1:Edit
export CLOUDFLARE_ACCOUNT_ID=…
./scripts/deploy-preview.sh      # prints https://dietbox-preview.<subdomain>.workers.dev
```

The `preview` environment has its own D1 database. Sign-ups skip email verification there (no email binding), and checkout runs in demo mode (no card needed). Don't use it for real customers.

## Payments

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, point a Stripe webhook at `/api/billing/webhook` (`checkout.session.completed`). `DEMO_CHECKOUT` only works when `APP_ENV=development` **and** Stripe is not configured.

## Tests

```bash
npm test            # pricing, calendar, menu rules, nutrition
npm run test:e2e    # public pages + anonymous API rejection
```
