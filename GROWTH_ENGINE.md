# Growth Engine

Shared autonomous promotion layer for every product created with the App Factory.

## Goal

A product registers once. The Growth Engine can then:

1. ingest product/brand context;
2. collect trend signals through approved data sources;
3. generate and rank content ideas;
4. select a format (faceless, slideshow, product demo, UGC/avatar, text/social post);
5. render through a provider;
6. run QA and policy checks;
7. route to review or autopilot;
8. publish through authorized platform APIs;
9. collect performance/conversion metrics;
10. learn which hooks, formats, personas and languages produce revenue.

## Important boundary

Social-account creation itself is not bot-automated. A human creates/verifies the platform account and completes OAuth once. After authorization, content generation, scheduling, publishing, analytics and iteration can be automated subject to platform rules and configured approval policy.

## Default architecture

```text
Product/App Factory
      |
      v
Cloudflare Growth Orchestrator
      |
      +--> D1: products, ideas, experiments, posts, metrics
      +--> R2: screenshots, clips, renders, exports
      +--> Queues: render/publish/analytics jobs
      +--> Workflows: durable multi-step campaigns
      |
      +--> MoneyPrinterTurbo sidecar (VPS)  [faceless video]
      +--> Slideshow renderer                [provider]
      +--> UGC/avatar renderer               [provider]
      +--> Demo recorder                     [provider]
      |
      +--> TikTok / YouTube / Instagram / X publishers
```

## Autonomy modes

- `review`: every publish requires approval.
- `assisted`: low-risk/high-confidence items can publish automatically; uncertain or risky items require review.
- `autopilot`: publishing is automatic inside explicit product/platform rules, budgets and daily caps.

New products should start in `review` mode.

## MoneyPrinterTurbo

MoneyPrinterTurbo is the first video renderer, not the Growth Engine itself. It runs separately on a small VPS/container. The Cloudflare side calls its API through an authenticated gateway, polls the task, copies the output into R2, then continues the durable workflow.

Do **not** expose a stock MoneyPrinterTurbo API directly to the public internet. The upstream v1 router currently has its auth dependency commented out. Put the sidecar behind Cloudflare Access, a private network, or another authenticated reverse proxy.

## Files

- `src/types.ts` — shared domain types.
- `src/config.ts` — default autonomy and safety policy.
- `src/orchestrator.ts` — workflow planning logic.
- `src/qa.ts` — QA/risk gates.
- `src/scoring.ts` — idea/experiment ranking primitives.
- `src/providers/renderers/*` — rendering adapters.
- `src/providers/publishers/*` — platform publishing adapters.
- `src/providers/trends/*` — trend-signal adapters.
- `db/migrations/001_growth_engine.sql` — initial D1 schema.
- `sidecar/docker-compose.moneyprinter.yml` — MoneyPrinterTurbo sidecar example.
- `examples/product-profile.json` — product brain example.

## What remains product/provider-specific

Credentials and approval are deliberately not hardcoded. Before production, implement/test the providers you actually use, obtain platform API approval where required, connect attribution/analytics, and complete the main `RELEASE_CHECKLIST.md` plus `packages/growth-engine/RELEASE_CHECKLIST.md`.

See `packages/growth-engine/ARCHITECTURE.md` for the detailed design.


## Trend Scout + Content Brain

The shared Growth Engine now includes a pluggable Trend Scout and Content Brain. Trend Scout normalizes/ranks fresh signals; Content Brain converts selected trends into scored multilingual concepts and experiments with a cost-sensitive AI route plus deterministic fallback. Detailed implementation: `packages/growth-engine/TREND_SCOUT_CONTENT_BRAIN.md`.

## Implemented discovery layer

Trend Scout + Content Brain are now implemented under `packages/growth-engine/`. The Scout supports manual, YouTube Data API, generic RSS/Atom, optional Google Trends RSS, normalized JSON feeds, and optional Responses API web-search discovery. It sanitizes untrusted source text, deduplicates, scores for product relevance/freshness/velocity/volume/engagement, and diversifies by source. Content Brain uses the shared model interface, produces multilingual hooks/scripts/format plans, creates conversion-oriented experiments, and falls back to deterministic templates if the model fails.

See `packages/growth-engine/TREND_SCOUT_CONTENT_BRAIN.md`.

## Autonomous operating loop

The Growth Engine now contains two Cloudflare Workflows:

- `DailyGrowthWorkflow`: scheduled trend -> content -> QA -> render -> review/autopublish -> metrics -> learn loop.
- `ApprovalPublishWorkflow`: publishes a specific review item only after an explicit human approval.

Detailed setup: `packages/growth-engine/AUTONOMOUS_DAILY_WORKFLOW.md`.
