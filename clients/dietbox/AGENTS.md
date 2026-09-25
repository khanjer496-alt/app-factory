# Coding Agent Instructions

This repository is a standalone product exported from App Factory. Keep it simple.

## Global-first product rule

Read `GLOBAL_FIRST.md`.

- Treat every new product as global unless `PRODUCT_SPEC.md` explicitly defines a regional market.
- Do not infer any regional positioning from examples, founder location, prior projects, or sample data.
- Default public pricing examples to USD; keep Stripe price IDs authoritative.
- Default product language to English and make localization additive.
- Use locale-aware formatting and UTC storage.
- Do not hard-code city/country defaults into onboarding.

## Vision governance

Read `VISION_GOVERNANCE.md`.

- If `VISION.md` exists, read it before proposing or implementing any material feature, integration, user segment, monetization change, infrastructure expansion, or autonomous-agent capability.
- Classify significant changes as `aligned`, `resisted`, or `ambiguous` against the actual acceptance criteria in `VISION.md`.
- If a request is clearly resisted, do not silently build around the vision. Explain the conflict and require an explicit product-owner decision.
- If the change is ambiguous, surface the real tradeoff and ask for a decision; `/vision` may be used to recalibrate the boundary.
- Never rewrite `VISION.md` merely to make a requested feature appear aligned. Vision changes belong to the product owner and should be evidence-backed.
- If `VISION.md` does not exist yet, use the product spec as the active scope. Do not fabricate a placeholder vision. Suggest `/vision` only after meaningful repository/product history exists.
- Keep the durable verdict/answers record created by `/vision` next to the approved vision.

The vendored skill lives at `skills/vision/`.

## Architectural rules

- Frontend: `src/`.
- Backend/API: `worker/`.
- Database: D1 through bindings. Prefer prepared statements. Do not add a second database without a real requirement.
- Files: R2. Never rely on local disk for persistent user files.
- Simple async work: Cloudflare Queues.
- Multi-step/retryable/long-running work: Cloudflare Workflows.
- Authentication: Better Auth + D1. Do not build custom password/session crypto.
- AI: keep model calls behind a shared service when AI is enabled; do not scatter provider calls across feature code.
- Billing: keep Stripe/billing calls behind the billing service/routes, never directly in UI features.
- Email: Cloudflare Email Service is the default. Use `worker/services/email.ts`; use the `EMAIL` Worker binding and patterns in `integrations/cloudflare-email/`. Do not add another transactional-email provider without a documented requirement.
- Agent interface: expose a few goal-oriented MCP tools, not a 1:1 mirror of REST endpoints.

## Agent distribution rules

For products that expose capabilities to external AI agents, especially `blueprints/job-saas/`:

- The consumer UI, REST API and MCP server call the same user-scoped service layer. Do not maintain separate business logic for agents.
- Keep public REST under `/v1` and remote MCP under `/mcp`; documentation UI must use a different path such as `/mcp-docs`.
- API keys are shown once, stored only as a one-way hash, revocable, attributable to one user/account, and scope-limited.
- Separate `read`, `prepare/write`, and `submit` authority. Never bundle `applications:submit` into a default developer key.
- A submit-capable credential is not sufficient by itself: server-side truth checks, unresolved-question checks, ownership checks, confirmation and product limits still apply.
- Meter REST and MCP operations separately so agent-channel usage, cost and conversion can be measured.
- Registry metadata and public docs must match the tools actually exposed in production.
- Do not claim an ATS/job-board partnership merely because a public posting endpoint or hosted application form is supported.
- API-key auth is acceptable for the initial developer launch. Before broad public/marketplace MCP distribution, implement the documented OAuth 2.1 protected-resource flow rather than distributing long-lived user API keys widely.
- Treat MCP clients as untrusted callers. Tool arguments are validated exactly like REST input and cannot bypass authorization.

## Cost rules

- Static assets should stay static; do not invoke Workers unnecessarily.
- Use bindings for D1/R2/Queues rather than Cloudflare REST APIs from Workers.
- Filter/validate deterministically before using LLMs.
- Track AI/third-party usage in `usage_events`.
- Avoid adding Redis, Kafka, Elasticsearch, Docker clusters, or another hosting provider by default.

## Security rules

Security is a release requirement. Read `SECURITY.md` before implementing authentication, billing, file handling, public APIs, MCP tools, or agent actions.

Never:

- expose server secrets to the client;
- commit `.env` files, API keys, private keys, or tokens;
- trust client-provided user IDs, roles, plan names, prices, credit balances, or permissions;
- query user-owned data by object ID alone when ownership can be part of the query;
- expose R2 customer-private objects publicly by default;
- trust filenames, MIME types, webhook bodies, model output, or tool arguments without validation;
- allow the model itself to decide whether it has permission for a tool;
- log secrets or raw access tokens;
- bypass validation/rate limits because a route is "internal" unless access is cryptographically restricted.

Every new endpoint must define:

1. authentication requirement;
2. authorization/ownership rule;
3. server-side input schema;
4. rate/usage limit when relevant;
5. data returned and sensitive-field filtering;
6. error behavior;
7. audit behavior for high-impact actions.

Additional rules:

- Payments, deletion, external writes, and irreversible agent actions are high-impact.
- Stripe prices/entitlements are resolved server-side and webhook signatures are verified.
- R2 private downloads require authorization or short-lived signed access.
- AI structured output must be schema-validated before use.
- MCP/API scopes must be checked server-side for every private/write-capable tool.
- Add or update tests when security behavior changes.

Before production, run `./scripts/security-check.sh` and complete `RELEASE_CHECKLIST.md`.

## Email rules

- Default to Cloudflare Email Service for verification, password reset, magic links, welcome, billing, usage, and operational notifications.
- Never expose a mail credential/token to the browser. The normal Worker path uses the `send_email` binding, not an API key.
- Keep templates/provider calls behind one shared adapter so product features are provider-agnostic.
- Rate limit verification/reset resends and avoid account-enumeration leaks.
- Treat inbound routed email as untrusted external content.
- Add a non-Cloudflare email provider only when the product spec documents the missing capability, cost impact, and migration reason.

## New product workflow

1. Read `VISION.md` if it exists and classify the requested change against it.
2. Update the template/product `product.config.ts` (`product.config.ts`).
3. Add product tables via a new numbered migration.
4. Add product services under the app `worker/services/`.
5. Add API routes in the app `worker/index.ts` or `worker/routes/`.
6. Build UI under the app `src/`.
7. Add only the MCP tools that represent useful agent outcomes.
8. Add usage tracking and rate limits for expensive operations.
9. Define authentication, authorization, validation, ownership, and audit behavior for each endpoint.
10. Run the global-first review in `PROMPTS/25_GLOBAL_FIRST_REVIEW.md` for new/ported products.
11. Run `./scripts/security-check.sh`.
12. Complete `RELEASE_CHECKLIST.md` before production deploy.


## Cost discipline

When implementing features:

- prefer existing Cloudflare primitives over adding new paid services;
- never store persistent user files on local disk; use R2;
- meter expensive AI/API/browser operations;
- use deterministic filtering before LLM calls;
- keep asynchronous work in Queues unless durable workflow semantics are required;
- do not add Redis, another database, S3, or a separate server without an explicit architecture reason;
- update `COSTS.md` and the product spec if a feature materially changes unit economics.

## Growth Engine rules

The Growth Engine is optional and is not included in this standalone export. Add it from the App Factory only when autonomous promotion is a real product/company requirement, then follow its own README and release checklist.

## Loading-state discipline

- Read `design/BONEYARD_LOADING_STATES.md` before hand-building skeletons for data-heavy async screens.
- Boneyard is approved as a **conditional** dependency. Do not install it globally or in static/simple products.
- Skeletons must mirror the real resolved layout and be regenerated after meaningful layout changes.
- Prefer non-sensitive fixtures for authenticated capture flows. Never commit production cookies/tokens to skeleton tooling.
- Skeleton loading does not replace explicit empty, error, retry, or partial-success states.

## External-tool discipline

Before adding a third-party UI, web-intelligence, hosting or agent package, read `ESSENTIAL_EXTERNAL_TOOLS.md`. The default approved external set is intentionally small. Do not introduce overlapping libraries/services just because they are convenient. Use 21st.dev/Component Gallery/beUI/Agentation for the design workflow, Boneyard conditionally for data-heavy loading states, Firecrawl only when normal fetch or official APIs are insufficient, and Page Agent only when the product genuinely benefits from natural-language UI operation. Any additional vendor requires an explicit product/cost justification.

## Analytics discipline

- Cloudflare Web Analytics is the default page-traffic/RUM layer.
- Workers Analytics Engine is the default first-party product/usage/cost event layer.
- Do not add PostHog, GA, Mixpanel, Amplitude, Hotjar, LaunchDarkly, Sentry, or another analytics/experimentation vendor by default.
- Product/business events are emitted server-side through `integrations/cloudflare-analytics/analytics.ts` where practical.
- Never write email addresses, names, auth/session tokens, private document text, chat bodies, payment-card data, sensitive application answers or arbitrary scraped content into Analytics Engine.
- Use internal pseudonymous actor/account IDs and coarse dimensions.
- Stripe/D1 remain the source of truth for subscription, payment, entitlement and durable audit records.
- If a specialist tool is necessary (for example session replay), document the exact requirement, privacy/data flow and monthly cost before adding it.

## Turnstile discipline

- Use Cloudflare Turnstile for selected public/abuse-sensitive actions, not as a blanket challenge on normal authenticated product usage.
- Client-side Turnstile completion is never sufficient; validate the token with Siteverify in the Worker before the protected action.
- Keep the sitekey public and the secret key server-only.
- Keep rate limits, entitlement checks and authorization even on Turnstile-protected endpoints.
- Use `integrations/cloudflare-turnstile/turnstile.ts` instead of introducing reCAPTCHA/hCaptcha by default.

