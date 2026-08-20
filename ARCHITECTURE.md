# Architecture

```text
Browser / Mobile Web / External Agent
                |
                v
        Cloudflare network
                |
        +-------+--------+
        |                |
 Static React SPA     Worker / Hono
  (free asset path)       |
                         +-------------------------------+
                         |        |         |            |
                         v        v         v            v
                        D1       R2       Queue       Workflow
                         |        |         |            |
                         +--------+---------+------------+
                                      |
                              External APIs / AI
```

## Why this architecture

- One runtime and deployment platform.
- No persistent app server to manage.
- Static frontend requests avoid Worker execution.
- D1 handles normal relational app data.
- R2 handles files without filling server disks.
- Queues move single-step work out of request latency.
- Workflows handle durable multi-step jobs and retries.
- MCP shares the same business capabilities with external agents.

## When to break the pattern

Use something else only when the product actually requires it, for example:
- a database workload that exceeds D1's design envelope;
- specialized full-text/vector/search requirements;
- very long compute that does not fit Worker/Workflow constraints;
- software with a hard dependency on a traditional Linux process/runtime.

Do not migrate preemptively.


## Cost-first architecture rules

The default architecture is intentionally constrained:

- Workers for HTTP/API/server logic
- D1 for relational application data
- R2 for user files and generated artifacts
- Queues for asynchronous work
- Workflows only for durable multi-step orchestration
- Cloudflare Email Service for transactional/inbound email; external email providers only when a measured requirement justifies them
- Cloudflare Turnstile on selected abuse-sensitive public flows
- Cloudflare Web Analytics + Analytics Engine for the default traffic/product telemetry layer
- external AI/payment providers only where necessary

Do not introduce Redis, S3, a separate backend host, a second database, or a managed queue by default. Add infrastructure only after a measured product requirement justifies the extra operational and financial cost.

See [`COSTS.md`](./COSTS.md).


## Email architecture

```text
Product feature / Better Auth / billing event
                 |
                 v
        shared email service
                 |
                 v
      Worker `EMAIL` binding
                 |
                 v
     Cloudflare Email Service
          |              |
          v              v
      outbound        inbound routing
   transactional      support/contact
```

Email is a platform primitive, not feature-specific code. Product features call the shared email adapter. Cloudflare sender domains are onboarded through Cloudflare DNS, and inbound routing is enabled only for products that need it. Do not put email-provider credentials in browser code or introduce a second transactional-email vendor by default.

See `integrations/cloudflare-email/README.md`.

## Security architecture

The browser, external agents, webhook senders, and model output are untrusted inputs. The Worker is the policy enforcement layer.

```text
Browser / Agent / Webhook
          |
          v
   Authentication
          |
          v
    Authorization
          |
          v
  Schema validation
          |
          v
 Rate / usage limits
          |
          v
 Business capability
     |          |
     v          v
    D1          R2
 ownership   private-by-default
  scoped      file access
```

Rules:

- Client-supplied user IDs, roles, prices, plans, and permissions are never authoritative.
- Data access is scoped to the authenticated user or organization in the query itself where practical.
- Server-side schemas validate sensitive and mutating requests.
- R2 stores customer-private objects privately by default.
- Billing prices and entitlements are resolved server-side.
- Webhook signatures are verified and handlers are idempotent.
- Agent/MCP permissions are enforced by backend scopes, not by model judgment.
- High-impact actions generate audit events.
- AI output is validated before it mutates application state or triggers tools.

See [`SECURITY.md`](./SECURITY.md).

## Production release path

```text
feature work
   |
   v
typecheck + tests + build
   |
   v
secret/dependency scan
   |
   v
manual security checklist
   |
   v
production deploy
```

A failed security gate blocks a production-ready label even if the feature itself works.

## Shared growth architecture

New products can register with the shared `packages/growth-engine/` rather than implementing promotion separately.

```text
App Factory Product
      |
      v
Growth Engine on Cloudflare
      |
      +--> D1/R2/Queues/Workflows
      |
      +--> renderer providers
      |      \--> MoneyPrinterTurbo sidecar on VPS
      |
      +--> authorized platform publishers
      |
      \--> metrics + revenue feedback
```

Heavy media rendering stays outside Workers. Cloudflare remains the durable control plane. See [`packages/growth-engine/ARCHITECTURE.md`](./packages/growth-engine/ARCHITECTURE.md).


## Trend Scout + Content Brain

The shared Growth Engine now includes a pluggable Trend Scout and Content Brain. Trend Scout normalizes/ranks fresh signals; Content Brain converts selected trends into scored multilingual concepts and experiments with a cost-sensitive AI route plus deterministic fallback. Detailed implementation: `packages/growth-engine/TREND_SCOUT_CONTENT_BRAIN.md`.

## Daily autonomous growth execution

```text
Scheduled Cloudflare Workflow
          |
          v
    load Product Brain
          |
          +--> Trend Scout providers
          |
          +--> Content Brain + learnings
          |
          v
       QA gate
          |
    +-----+------+
    |            |
 review       auto-eligible
 queue            |
    |             v
    |         render provider
    |             |
    |         durable polling
    |             |
    |             v
    |        social publisher
    |             |
    +-------------+
          |
          v
 metrics attribution feeds
          |
          v
 revenue/conversion learnings
```

The daily Workflow and approval-publish Workflow are separate so a slow human review does not block the rest of the daily campaign execution.


## Product-governance layer

The App Factory separates current requirements from durable product identity:

```text
PRODUCT_SPEC.md -> what we are building now
VISION.md       -> what the product should and should not become
AGENTS.md       -> how coding agents enforce both
```

`VISION.md` is created only after real repository history exists, using the vendored `skills/vision/` Agent Skill. Once approved, material scope changes must be checked against it before implementation. See `VISION_GOVERNANCE.md`.

## Essential extension layers

- **Design Engine:** Component Gallery -> 21st.dev -> selective beUI -> Agentation review.
- **Web Intelligence:** normal fetch/official APIs first; Firecrawl only when richer crawling/search/extraction is needed.
- **In-app agent:** Alibaba Page Agent is optional and operates the existing authorized UI; it never replaces server-side authorization.

See `ESSENTIAL_EXTERNAL_TOOLS.md`.

## Analytics architecture

```text
Browser
  |\
  | +--> Cloudflare Web Analytics -> page views / RUM / Web Vitals
  |
  v
Worker / capability layer
  |
  +--> Workers Analytics Engine -> product/usage/cost events
  |
  +--> D1 / Stripe -> canonical business and billing records
```

Analytics Engine is optimized for high-cardinality aggregated analytics, not durable transactional state. Keep sensitive content and credentials out of analytics. Use internal pseudonymous IDs. The canonical event layout and Wrangler binding live in `integrations/cloudflare-analytics/`.

## Abuse-protection architecture

```text
Public form / anonymous expensive action
          |
          v
   Turnstile widget
          |
          v
 Worker Siteverify + rate limit
          |
          v
 auth / entitlement / business logic
```

Turnstile is selective, not universal. Authenticated normal product traffic is protected primarily by sessions, authorization, rate limits, plan caps and server-side validation.

## Repository orchestration

Turborepo organizes the factory development repository into `apps/` and `packages/` and provides a shared task graph/cache. It does not replace Cloudflare and is not required by exported products. `apps/starter-web` remains a standalone deployable template; `packages/growth-engine` is a factory-wide package. See `TURBOREPO.md`.


## Agent distribution architecture

The job SaaS blueprint treats the human app as one client of a shared capability layer:

```text
              Job / Career capability layer
                         |
          +--------------+--------------+
          |              |              |
       Web app         REST /v1       MCP /mcp
          |              |              |
          +--------------+--------------+
                         |
               D1 / R2 / Queue / AI
                         |
                 ATS/browser adapters
```

External callers never receive a privileged bypass path. REST and MCP are thin authenticated adapters over the same user-scoped services, with independent scopes and usage metering. The initial developer integration uses one-time-shown hashed API keys; broad public MCP distribution upgrades to OAuth 2.1 before marketplace-style authorization. See `blueprints/job-saas/AGENT_DISTRIBUTION.md`.
