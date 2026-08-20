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


## Trend Scout + Content Brain

The Growth Engine now includes the first autonomous discovery layer. Trend Scout collects signals from pluggable providers, ranks them by product relevance/freshness/velocity/volume/engagement, and diversifies the final feed by source. Content Brain turns the selected trends into scored content ideas and conversion-oriented experiments. See `TREND_SCOUT_CONTENT_BRAIN.md`.

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
- `src/trends/scout.ts` — normalization, dedupe, product relevance and trend ranking.
- `src/content/brain.ts` — AI/fallback idea generation and experiment creation.
- `src/learning/performance.ts` — conversion/revenue feedback memory.
- `TREND_SCOUT_CONTENT_BRAIN.md` — detailed discovery/content architecture.
- `db/migrations/001_growth_engine.sql` — initial D1 schema.
- `db/migrations/002_trend_scout_content_brain.sql` — Scout/Brain runs, scores, experiments and learnings.
- `sidecar/docker-compose.moneyprinter.yml` — MoneyPrinterTurbo sidecar example.
- `examples/product-profile.json` — product brain example.

## What remains product/provider-specific

Credentials and approval are deliberately not hardcoded. Before production, implement/test the providers you actually use, obtain platform API approval where required, connect attribution/analytics, and complete the main `RELEASE_CHECKLIST.md` plus `growth-engine/RELEASE_CHECKLIST.md`.

## Autonomous Daily Workflow

The discovery layer is now connected to a durable scheduled execution layer.

Files:

- `src/cloudflare/daily-workflow.ts` — scheduled full growth loop.
- `src/cloudflare/approval-workflow.ts` — publish after human approval.
- `src/cloudflare/runtime.ts` — Cloudflare provider/runtime wiring.
- `src/daily.ts` — platform/format selection helpers.
- `src/storage/daily.ts` — D1 run, QA, approval, cost, metrics and learning persistence.
- `src/providers/metrics/*` — normalized attribution metrics provider seam.
- `db/migrations/003_daily_growth_workflow.sql` — scheduled-run/approval/budget state.
- `wrangler.daily.example.jsonc` — current Workflow binding/schedule example.
- `AUTONOMOUS_DAILY_WORKFLOW.md` — setup and operations guide.

The default schedule example runs once per day. Run new products in `review` mode first, then move to `assisted` or `autopilot` only after the social publishers, credential vault, attribution and claims policy have been verified.
