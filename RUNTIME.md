# SaaS Runtime

The runnable Cloudflare-native SaaS starter lives at `apps/starter-web/` inside the factory. `npm run new-app` exports it so these same files become the root of a standalone product repository.

## Runtime architecture

```text
Browser
  ↓
React/Vite static assets
  ↓ /api/*
Cloudflare Worker / Hono
  ├─ Better Auth → D1
  ├─ Billing → Stripe + D1 mirror
  ├─ Private files → R2 + D1 ownership metadata
  ├─ Transactional email → Cloudflare Email Service
  ├─ Product events → Analytics Engine
  └─ Admin/account operations → D1
```

The template `apps/starter-web/wrangler.jsonc` (or `wrangler.jsonc` after export) uses SPA fallback for normal frontend navigation and `assets.run_worker_first: ["/api/*"]` so API/auth callback navigations always execute Worker code first.

## First local run

```bash
npm install
cp apps/starter-web/.dev.vars.example apps/starter-web/.dev.vars
cp apps/starter-web/.env.example apps/starter-web/.env.local
npm run db:migrate:local
npm run dev
```

Generate a unique 32+ byte auth secret. Do not reuse it across products or environments.

## Better Auth

Implemented in `apps/starter-web/worker/auth.ts` in the factory (`worker/auth.ts` after export):

- email/password
- required verification
- password reset
- session revocation after reset
- optional Google provider
- optional Cloudflare Turnstile CAPTCHA plugin
- `role` field used by the starter admin middleware

The auth database tables are already defined in `apps/starter-web/db/migrations/0001_core.sql` in the factory (`db/migrations/0001_core.sql` after export); there is no separate setup endpoint.

## Stripe

Configure Stripe only for paid products. The starter supports:

- Checkout subscription creation
- Customer Portal
- webhook signature verification
- webhook idempotency
- D1 subscription mirror
- cancellation during account deletion

Configure product price IDs as Worker secrets/variables. Browser code only sends an allowed plan ID, never an amount.

## R2 private files

Files are stored in R2 under a user-prefixed key. D1 stores ownership metadata. Download/delete routes always query by both `id` and authenticated `user_id`.

The default starter upload cap is 25 MB. Change it only when the product needs larger objects and update cost/abuse rules accordingly.

## Email

Cloudflare Email Service is the default outbound provider. In local development, if the binding is unavailable, the adapter logs the email subject, recipient and link to the console.

Before production, configure SPF/DKIM/DMARC and verify real delivery for verification and reset messages.

## Analytics

Use Cloudflare Web Analytics for traffic/RUM. Use the `ANALYTICS` Analytics Engine binding for first-party product events and cost telemetry. Never put CVs, messages, prompts, auth tokens, email bodies, secrets or other sensitive content into analytics blobs.

## Admin

`/api/admin/*` is protected server-side. A user is an admin if either:

- Better Auth's stored role is `admin`, or
- the signed-in email exactly matches `ADMIN_EMAIL`.

Do not rely on hiding the admin link in the frontend as authorization.

## Local versus production

Local secrets live in `.dev.vars` and frontend-public Vite values in `.env.local`.

Production secrets use `wrangler secret put` from the standalone product directory. Public environment values and binding names live in that product's `wrangler.jsonc`.

Read `ENVIRONMENTS.md` before creating preview/production resources.
