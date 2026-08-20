# App Factory + Autonomous Growth Engine — Start Here

This repository is the reusable **factory**, not a collection of your production businesses.

The factory itself is a Turborepo monorepo. The standalone SaaS template is `apps/starter-web/`. New products are exported into their own directory/repository with `npm run new-app`.

## Fastest path to a new app

1. Read `GLOBAL_FIRST.md`, `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `COSTS.md` and `TURBOREPO.md`.
2. Use `PROMPTS/01_MASTER_NEW_APP.md` with your coding agent, or a product-specific kickoff prompt such as `PROMPTS/12_JOB_AGENT_KICKOFF.md`.
3. Export a standalone app:

```bash
npm install
npm run new-app -- \
  --name="My Product" \
  --slug="my-product" \
  --description="What the product does" \
  --destination="../my-product"
```

4. Move into the generated directory:

```bash
cd ../my-product
npm install
npm run check
```

5. Review `product.config.ts` and `wrangler.jsonc` there.
6. Create D1/R2 resources and apply migrations.
7. Build only the unique product capability.
8. Use `PROMPTS/20_LAUNCH_RUNTIME_SETUP.md` for the final launch pass.
9. Complete `LAUNCH_CHECKLIST.md` and `RELEASE_CHECKLIST.md` before production.

## Working on the factory itself

Use Turborepo from the root:

```bash
npm run dev
npm run check
npm run test
npm run build
npm run affected
```

Read `TURBOREPO.md` before changing repository boundaries. Do not add launched products under `apps/`.

## Core standalone SaaS runtime

`apps/starter-web/` contains:

- React/Vite frontend
- Cloudflare Worker + Hono API
- Better Auth on D1
- email/password + verification + reset
- optional Google OAuth
- optional Turnstile
- Stripe subscriptions, Customer Portal and signed/idempotent webhooks
- D1 entitlement mirror
- private R2 upload/download/delete
- account export/deletion
- server-enforced admin APIs
- Cloudflare Email Service adapter
- Analytics Engine adapter
- privacy/terms templates
- migrations and deployment/E2E workflow patterns

Read `RUNTIME.md` for implementation details.

## Default platform policy

Prefer the existing Cloudflare platform before adding another service:

```text
Cloudflare Workers
D1
R2
Email Service
Turnstile
Web Analytics / Analytics Engine
Queues / Workflows only when needed
```

External core dependencies are intentionally limited to Better Auth and Stripe when billing is enabled.

## Optional layers

### Design Engine

Use `design/DESIGN_ENGINE.md` for substantial interface work. Boneyard is conditional for data-heavy async loading states.

### Web/in-app agent tools

- Firecrawl: optional web intelligence
- Alibaba Page Agent: optional natural-language UI control
- MCP: only when external agents need useful product outcomes

### Growth Engine

`packages/growth-engine/` contains Product Brain, Trend Scout, Content Brain, experiments, QA, rendering/publishing adapters, attribution, conversion/revenue learning, and review/assisted/autopilot workflows.

Do not enable it automatically for every product.

## Vision governance

Do not invent `VISION.md` on day one.

1. Build from the Product Spec.
2. Accumulate meaningful commits/PR decisions.
3. Run the vendored `/vision` skill.
4. Approve/stress-test the resulting `VISION.md`.
5. Future agents must check major scope changes against it.

Read `VISION_GOVERNANCE.md`.

## Important prompts

- `PROMPTS/01_MASTER_NEW_APP.md` — any new product
- `PROMPTS/03_MVP_BUILD.md` — first implementation
- `PROMPTS/12_JOB_AGENT_KICKOFF.md` — job-search/application product
- `PROMPTS/13_DESIGN_ENGINE.md` — substantial UI work
- `PROMPTS/17_CLOUDFLARE_EMAIL_SETUP.md` — transactional email
- `PROMPTS/18_CLOUDFLARE_ANALYTICS_SETUP.md` — Cloudflare analytics
- `PROMPTS/19_CLOUDFLARE_TURNSTILE_SETUP.md` — abuse protection
- `PROMPTS/20_LAUNCH_RUNTIME_SETUP.md` — final launch readiness
- `PROMPTS/21_TURBOREPO_FACTORY_WORKFLOW.md` — changes to the factory monorepo
- `PROMPTS/22_JOB_SAAS_LOOPCV_BUILD.md` — continuous job-search/application engine
- `PROMPTS/23_AGENT_DISTRIBUTION_POSTIZ.md` — REST + remote MCP + agent distribution

## Main docs

- `README.md`
- `TURBOREPO.md`
- `RUNTIME.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `COSTS.md`
- `LAUNCH_CHECKLIST.md`
- `RELEASE_CHECKLIST.md`
- `DISASTER_RECOVERY.md`
- `ENVIRONMENTS.md`
- `ADMIN.md`
- `AGENTS.md`
- `ESSENTIAL_EXTERNAL_TOOLS.md`
- `AGENT_DISTRIBUTION.md`
- `VISION_GOVERNANCE.md`
- `packages/growth-engine/README.md`

## Validation boundary

`BUILD_VALIDATION.md` records what was checked in this packaged factory. Live email delivery, live Stripe/OAuth, social-platform approvals and external providers still require real credentials.


## Build the job-search SaaS

For the LoopCV-class product discussed in this factory, do not start from the generic starter manually. Run:

```bash
npm run new-job-saas -- \
  --name="ApplyFlow" \
  --description="Your AI job-search and application agent" \
  --destination="../applyflow"
```

The export includes Career Brain, multi-source job discovery, AI match scoring, tailored resume + truth QA, application queue/state machine, LinkedIn signal ingestion, guarded autopilot, mobile job UI, scoped REST API, remote MCP endpoint, developer API-key console, agent examples and registry metadata.

Then use:

1. `PROMPTS/22_JOB_SAAS_LOOPCV_BUILD.md` for the core job workflow.
2. `PROMPTS/23_AGENT_DISTRIBUTION_POSTIZ.md` for the Postiz-style agent distribution layer.

Inside the generated job product, read `AGENT_DISTRIBUTION.md`. The launch implementation uses scoped API keys. Before broad public/marketplace MCP distribution, implement the OAuth 2.1 upgrade described there.
