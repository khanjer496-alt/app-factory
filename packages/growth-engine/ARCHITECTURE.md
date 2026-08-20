# Growth Engine Architecture

## Control plane vs media plane

### Cloudflare control plane

Cloudflare owns:
- product registration;
- trend and content state;
- AI planning/orchestration;
- queues/workflows;
- approvals;
- R2 media handoff;
- publishing credentials/tokens;
- rate limits, budgets and audit logs;
- analytics and learning state.

### Media plane

Heavy rendering runs outside Workers:
- MoneyPrinterTurbo on a VPS/container;
- optional UGC/avatar APIs;
- optional browser/demo recorder;
- optional specialized render services.

Workers should orchestrate heavy compute, not run FFmpeg-style pipelines themselves.

## Campaign workflow

```text
register product
      |
      v
refresh product brain
      |
      v
collect trend signals + product events
      |
      v
generate candidate ideas
      |
      v
score by relevance x novelty x proof x conversion fit x cost
      |
      v
select experiment set
      |
      v
render in multiple formats/languages
      |
      v
QA: factual + brand + platform + disclosure + technical
      |
      +------ risky/uncertain ------> review queue
      |
      v
publish queue
      |
      v
platform APIs
      |
      v
metrics + attribution
      |
      v
update winners/losers memory
```

## Product Brain

Each product supplies:
- positioning;
- target audiences;
- claims that are allowed;
- claims that require proof;
- prohibited claims;
- supported languages;
- brand style;
- screenshots/demo assets;
- CTAs and landing URLs;
- competitor/reference accounts;
- content pillars;
- approval rules.

The Growth Engine must not invent product claims merely because a trend template implies them.

## Trend sources

Trend discovery is provider-based. Prefer official APIs, approved datasets, RSS/public feeds, first-party analytics, and user-supplied competitor/reference URLs. Do not make unauthorized scraping or account automation a hard dependency.

Every trend signal is stored with:
- source;
- source ID/URL if available;
- observed timestamp;
- region/language;
- format;
- keywords;
- engagement/velocity signals if legally/technically available;
- confidence;
- expiry.

## Publishing

Publishing always requires a previously connected platform identity. OAuth tokens are server-only secrets. Provider adapters never create platform accounts.

TikTok Direct Post requires platform app approval plus user authorization for publishing; unaudited clients are restricted. YouTube uploads require OAuth authorization and unverified projects can face private-only restrictions until audit. X writes require user-context credentials. Platform requirements must be re-verified at implementation time.

## Attribution

Every published piece should receive a unique campaign/content ID and tracked destination URL when platform rules allow it.

Track:
- impressions/views;
- watch/hold/completion where available;
- engagement;
- profile/site clicks;
- signups;
- trials;
- paid conversions;
- revenue;
- content/render/provider cost.

Primary optimization target: contribution/revenue per content unit, not raw views.

## Discovery intelligence

Trend Scout and Content Brain are first-class modules rather than prompts hidden inside a workflow. Scout providers normalize into `TrendSignal`, then the ranking layer handles relevance, freshness, velocity, volume, engagement and source diversity. Content Brain uses a model adapter (normally the App Factory cost-sensitive/Luna route) and a deterministic fallback, then creates experiment groups before QA/rendering. Execution history is persisted through migration `002_trend_scout_content_brain.sql`.

See `TREND_SCOUT_CONTENT_BRAIN.md` for the detailed flow.

## Scheduled execution

The production control plane has two durable Workflows:

1. `DailyGrowthWorkflow` is scheduled and performs Scout -> Brain -> QA -> render -> publish/review -> metrics -> learning.
2. `ApprovalPublishWorkflow` handles explicit human approvals without keeping the entire daily Workflow blocked.

Asynchronous render providers are polled using Workflow sleeps. Waiting does not need an always-on app server. Normalized product attribution metrics are pulled through `MetricsProvider` before learning refresh.
