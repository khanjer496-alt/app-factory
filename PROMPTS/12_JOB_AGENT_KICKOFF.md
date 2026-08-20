# Ready-Made Prompt — Job Agent Product Direction

You are the lead product engineer. Prefer generating the working scaffold first with `npm run new-job-saas`. Then use this document as product direction for a paid LoopCV-class job-search and job-application agent.

## Product

Create a web app where a user:

1. signs up;
2. uploads an existing CV;
3. reviews a structured Career Profile extracted from the CV;
4. defines target roles, locations, salary, seniority, industries, remote preference, work authorization and exclusions;
5. receives automatically discovered jobs;
6. sees an explainable match score for each job;
7. generates a tailored ATS-friendly CV using only verified/user-provided career facts;
8. generates cover letters/application-question drafts when appropriate;
9. reviews the full application package;
10. can approve browser/ATS application preparation/submission for supported systems;
11. tracks applications through interview/offer/rejection;
12. can enable controlled Autopilot rules.

The product is paid-only. Do not implement a permanent free plan.

## Strategic architecture

Use the existing App Factory stack:

- React + TypeScript;
- Cloudflare Worker/Hono;
- D1;
- R2;
- Queues;
- Workflows;
- Better Auth;
- shared AI router;
- usage metering;
- billing adapter;
- MCP/API capability layer.

Reuse/adapt relevant logic and concepts from `santifer/career-ops` rather than rebuilding proven job-normalization/scoring/CV/application logic from zero, while respecting its license and keeping our SaaS architecture independent.

Prioritize employer ATS/direct career sources such as Greenhouse, Lever, Ashby and company career sites. Do not make unauthorized LinkedIn/Indeed botting a core dependency.

## Career truth model

Create a canonical Career Profile/Career Brain.

Career facts have provenance states such as:

- verified;
- user_provided;
- inferred;
- unverified.

Submitted applications should use only verified/user-provided facts by default.

AI may rewrite wording but must not invent employment, achievements, education, salaries, titles, responsibilities, certifications or metrics.

Block application submission when an unsupported claim is detected unless the user explicitly confirms/corrects it.

## AI routing

Use the shared AI layer.

Default cheap/high-volume tasks to the cost-sensitive model route, including:

- extraction;
- classification;
- first-pass job scoring;
- routine application answers.

Use a stronger reasoning model only for tasks where quality justifies the additional cost.

Filter jobs deterministically before expensive AI scoring.

Track estimated AI/API/browser cost per user and per application.

## Core UI

Implement these first:

- onboarding;
- CV upload;
- Career Profile confirmation;
- job preferences;
- Home dashboard;
- Jobs list;
- Job Detail + match explanation;
- Prepare Application workflow;
- Application Package with CV preview/change summary/truth check;
- application questions requiring user input when facts are unknown;
- Applications tracker;
- Autopilot settings;
- Billing.

UX principle:

`strong job → understand why → prepare → review → apply → track`

Do not design this as an infinite-scroll job board.

## Job scoring

Expose a match score with explainable components such as:

- experience;
- skills;
- industry;
- seniority;
- location;
- compensation/work authorization where known.

Show strengths and gaps rather than only a percentage.

## Application automation

Default mode:

- discover automatically;
- score automatically;
- prepare automatically;
- submit only after user approval.

Autopilot submission must be separate opt-in with:

- minimum match score;
- daily cap;
- supported ATS/platform list;
- explicit permissions;
- guardrails for unknown questions, salary, visa/work authorization and unverified claims;
- audit trail;
- kill switch.

Use durable Cloudflare Workflows for multi-step application jobs and browser-side providers/workers where needed rather than trying to run heavy browser automation inside a normal Worker request.

## API / agents

Design capabilities API-first so the web app, public REST API and MCP tools share the same services.

Initial agent-facing outcomes:

- `search_jobs`
- `score_job`
- `tailor_resume`
- `prepare_application`
- `get_application_status`

Do not expose `submit_application` to third-party agents by default. It requires an explicit permission scope.

Meter API usage so the same backend can later be sold to other AI-agent companies on a usage basis.

## Growth Engine

Register this product with the Growth Engine in `review` mode.

Initial content angles:

- stop sending the same CV to every job;
- AI finds jobs while you sleep;
- before/after tailored CV;
- explainable job-match score;
- application prepared in minutes;
- English default; add localized variants only when a product requirement or measured demand justifies them;
- product-demo screen recordings;
- slideshow content;
- UGC-style content through a provider interface;
- trend-based adaptations.

Optimize growth learning against signup → paid conversion/revenue, not views alone.

## First build milestone

Deliver a working vertical slice where a test user can:

1. sign up;
2. upload a CV;
3. confirm extracted Career Profile data;
4. browse seeded/real normalized jobs;
5. open one job and see an explainable match;
6. generate a tailored CV grounded in career facts;
7. review the change summary/truth check;
8. create an Application record in the tracker.

Application submission/browser automation can initially use a provider seam/mock if real ATS credentials/runtime are not available, but the interfaces and workflow boundaries must be production-ready.

## Execution instructions

Before coding read:

- `AGENTS.md`
- `START_HERE.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `COSTS.md`
- `PRODUCT_SPEC_TEMPLATE.md`
- Growth Engine docs
- `VISION.md` if it exists

Then create `PRODUCT_SPEC.md`, produce a concise implementation plan, and immediately begin the first vertical slice.

Do not stop after planning. Make reasonable reversible defaults and continue.

Run available typecheck/tests/build/security validation and fix failures.


Global-first: support job seekers and job markets worldwide. Do not hard-code a country, city, language, currency, or work-authorization regime into the default UX.
