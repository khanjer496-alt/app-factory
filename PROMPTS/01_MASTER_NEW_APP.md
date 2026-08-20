# Master Prompt — Start a New App

You are the lead product engineer for this repository.

## Product idea

[REPLACE THIS WITH THE PRODUCT IDEA]

## Mission

Turn the product idea above into a production-oriented MVP using this App Factory as the foundation. Reuse the existing Cloudflare-first architecture. Do not rebuild infrastructure that already exists in this starter.

## Before coding

Read, in this order:

1. `AGENTS.md`
2. `START_HERE.md`
3. `ARCHITECTURE.md`
4. `SECURITY.md`
5. `COSTS.md`
6. `PRODUCT_SPEC_TEMPLATE.md`
7. `VISION.md` if it exists

Then inspect the repository structure and existing implementation before deciding what to change.

## Your first output

Create or update `PRODUCT_SPEC.md` based on `PRODUCT_SPEC_TEMPLATE.md`.

The spec must define:

- product name and one-sentence value proposition;
- target user;
- painful problem being solved;
- primary user journey;
- MVP features;
- explicit non-goals;
- data model;
- routes/screens;
- API/service boundaries;
- expensive operations and unit-economics assumptions;
- authentication and authorization requirements;
- file/storage requirements;
- AI tasks and model-routing requirements;
- background jobs/workflows;
- external integrations;
- billing model if relevant;
- growth-engine connection if relevant;
- acceptance criteria.

Do not invent a `VISION.md` for a brand-new product. The product spec is the active scope until enough product history exists for `/vision`.

## Architecture requirements

Default to the existing stack:

- React + TypeScript for UI;
- Cloudflare Worker/Hono for backend;
- D1 for relational application data;
- R2 for persistent files;
- Queues for simple asynchronous jobs;
- Workflows for durable/retryable/multi-step jobs;
- Better Auth + D1 for authentication;
- shared AI service/model router for model calls;
- shared Stripe billing and Cloudflare Email Service;
- MCP/API only when they expose meaningful product outcomes.

Do not add Supabase, Firebase, Redis, another database, another storage provider, a VPS, or another hosting platform unless the feature genuinely requires it and you document the reason and cost impact.

## Security requirements

Every endpoint and agent tool must explicitly define:

1. authentication;
2. authorization/ownership;
3. server-side validation;
4. rate/usage limits;
5. sensitive data returned;
6. error behavior;
7. audit behavior for high-impact actions.

Never trust user IDs, roles, plan names, prices, permissions, filenames, MIME types, model outputs, webhooks, or tool arguments from the client.

## Build behavior

After writing `PRODUCT_SPEC.md`:

1. produce a short implementation plan ordered by dependency;
2. begin implementing immediately;
3. make reasonable product/engineering defaults when they are reversible;
4. do not stop after scaffolding — implement the working vertical slice;
5. run type checks/tests/build throughout;
6. fix failures rather than merely reporting them;
7. update docs when architecture/cost/security behavior changes;
8. do not deploy or perform irreversible external actions unless credentials/environment are available and the user has asked for deployment.

## Definition of first milestone

The first milestone is complete only when a new user can complete the core product journey end-to-end in a local/dev environment with realistic mock/test data and the repository passes its available validation commands.

At the end, report:

- what was built;
- what remains mocked;
- external credentials/services still needed;
- current monthly-cost assumptions;
- exact commands to run locally;
- the next highest-value build step.


## Global-first requirement

Treat the product as serving a global market by default. Do not introduce a regional positioning, city/country defaults, regional language assumptions, or regional-only UX unless the Product Spec explicitly requires it. Use English as the default language, USD as the reference pricing currency, and locale-aware formatting.
