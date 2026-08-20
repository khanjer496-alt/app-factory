# Cloudflare App Factory

**Status:** runnable SaaS starter + optional Design, Agent, Vision and Growth layers.

The **factory repository** is a Turborepo monorepo. The actual product template lives in `apps/starter-web/`. When you start a business, `npm run new-app` exports that template as a **standalone app repository**; your launched products do not need Turborepo.

Start with `START_HERE.md`. For monorepo rules, read `TURBOREPO.md`. For the standalone SaaS runtime, read `RUNTIME.md`.

## Default launch stack

The generated app intentionally keeps the runtime small:

- React 19 + Vite frontend
- Cloudflare Worker + Hono API
- Cloudflare D1 database
- Cloudflare R2 private file storage
- Cloudflare Email Service for transactional email
- Cloudflare Turnstile for abuse-sensitive auth/public flows
- Cloudflare Web Analytics + Analytics Engine
- Better Auth using D1
- Stripe when the product charges customers

Cloudflare Queues, Workflows, Browser Run, Firecrawl, Page Agent, Boneyard, MCP and the Growth Engine are optional. Do not add them unless the product spec actually needs them.

## Factory layout

```text
apps/
  starter-web/             standalone Cloudflare SaaS template
packages/
  growth-engine/           optional shared autonomous growth system
PROMPTS/                    coding-agent prompt pack
design/                     Design Engine guidance
integrations/               optional provider/reference adapters
skills/vision/              vendored /vision governance skill
scripts/                    factory/export/security tooling
```

Turborepo orchestrates factory development across `apps/` and `packages/`, including caching and affected-task execution. It does **not** replace Cloudflare and it is not required by exported products.

## Develop the factory

```bash
npm install
npm run check
npm run test
npm run build
```

Run the template locally:

```bash
cp apps/starter-web/.dev.vars.example apps/starter-web/.dev.vars
cp apps/starter-web/.env.example apps/starter-web/.env.local
npm run db:migrate:local
npm run dev
```

Useful Turborepo commands:

```bash
npm run affected   # check/test/build only affected workspaces
npm run graph      # inspect the resolved Turbo task graph
```

Remote caching is optional. Do not make Vercel or another hosted cache a production dependency just to use Turborepo.

## Start a new product

```bash
npm run new-app -- \
  --name="My Product" \
  --slug="my-product" \
  --description="The one sentence reason the product exists" \
  --destination="../my-product"
```

The exporter copies `apps/starter-web` plus the minimum security/design/vision governance files into a separate directory, then personalizes product identity and Cloudflare resource names.

Then:

```bash
cd ../my-product
npm install
npm run check
npm run db:migrate:local
npm run dev
```

Inside that generated app, the familiar standalone layout is:

```text
src/                     React application
worker/                  Hono Worker API
  routes/                billing, files, account, admin
  services/              email, Stripe, analytics, audit
  auth.ts                Better Auth configuration
db/migrations/           D1 schema
public/                   static headers/assets
product.config.ts        product identity/plans/flags
wrangler.jsonc           Cloudflare bindings/configuration
```

## What the standalone runtime includes

- signup, sign-in and sign-out
- required email verification
- password reset
- optional Google OAuth
- optional Turnstile protection through Better Auth
- authenticated dashboard shell
- Stripe subscription Checkout
- Stripe Customer Portal
- verified/idempotent Stripe webhook processing
- D1 subscription/entitlement mirror
- private R2 upload, authenticated download and delete
- account data export and deletion
- server-enforced admin APIs
- feature flags
- health endpoint
- Cloudflare Analytics Engine helper
- Cloudflare Email Service adapter
- privacy/terms placeholders that must be reviewed before launch
- D1 migrations
- security/deploy/E2E workflows
- disaster-recovery and environment guidance

## Cloudflare resources for a generated app

From the generated app directory:

```bash
npx wrangler login
npx wrangler d1 create my-product-db
npx wrangler r2 bucket create my-product-files
```

Put the returned D1 ID into `wrangler.jsonc`, then:

```bash
npm run db:migrate:remote
```

Keep `/api/*` Worker-first before static SPA fallback so auth/OAuth callbacks and API navigation reach the Worker.

## Production secrets

At minimum:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
```

For paid apps:

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_PRICE_PRO_MONTHLY
npx wrangler secret put STRIPE_PRICE_PRO_ANNUAL
```

For Turnstile:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

The Turnstile site key is public and belongs in frontend environment config.

## Transactional email

Cloudflare Email Service is the default. Better Auth sends verification/reset messages through the generated app's `worker/services/email.ts`. Do not add Resend/SendGrid/etc. unless a measured requirement justifies another vendor.

## Billing

`product.config.ts` defines customer-facing plans. Worker-side Stripe price IDs remain server-side. Never trust browser-provided prices.

Implemented endpoints include Checkout, Customer Portal, subscription status and signed webhooks.

## Development rules

Read `AGENTS.md` before asking a coding agent to modify the factory. Important defaults:

- Cloudflare-first infrastructure
- no new paid service without a concrete requirement
- server-side authorization for every private resource
- private R2 objects by default
- no client-controlled prices/user IDs
- cost telemetry around expensive AI/API work
- security/release gate before production
- run `/vision` only after a product has meaningful history
- do not put unrelated launched businesses inside the factory monorepo
- keep `apps/starter-web` independently exportable

## Optional systems

### Design Engine

Read `design/DESIGN_ENGINE.md`. The curated external set is intentionally small: 21st.dev, Component Gallery, beUI and Agentation. Boneyard is conditional for data-heavy loading states.

### Web/agent capabilities

- Firecrawl: optional web intelligence
- Alibaba Page Agent: optional natural-language control of the product UI
- MCP: optional public/agent tool interface

### Growth Engine

`packages/growth-engine/` contains the optional trend scouting, Content Brain, rendering/publishing and learning loop. Enable it only for products that need autonomous promotion.

## Validation

See `BUILD_VALIDATION.md` for exactly what was verified in the packaged factory and what still requires live credentials or first-install checks.


## Job SaaS blueprint

For a continuous job-search/application product, use `npm run new-job-saas`. It overlays the generic starter with the Career Brain, multi-source job discovery, GPT-5.6 Luna scoring/tailoring, truth checking, application queue/state machine, LinkedIn alert/URL ingestion, mobile job UI, guarded autopilot, a scoped `/v1` developer API, remote `/mcp` tools, a developer key console, quickstarts and MCP Registry metadata. See `blueprints/job-saas/` and `blueprints/job-saas/AGENT_DISTRIBUTION.md`.

## Job SaaS trust model

The Job SaaS blueprint includes an Employable-style trust layer: simple 3-step onboarding, Workday as a first-class browser-backed source, private proof-of-submission screenshots, and outcome tracking. See `blueprints/job-saas/EMPLOYABLE_PRODUCT_REFERENCE.md` and `PROMPTS/24_JOB_SAAS_EMPLOYABLE_CORE.md`.


## Global-first product rule

All generated SaaS products target a global market by default. See `GLOBAL_FIRST.md`. Regional positioning is opt-in and must be explicit in the product spec.
