# COSTS.md

# App Factory Cost Model

**Last verified:** 2026-08-17

This starter is intentionally designed to keep fixed infrastructure cost close to zero while an app is small, and to make variable cost visible as usage grows.

## Baseline

For a small production app, use **Cloudflare Workers Paid as the default budget assumption: about $5/month per Cloudflare account**, not per app. Multiple apps can share the same account-level included usage.

Most new apps should therefore be modeled as:

- **Infrastructure base:** ~$0–$5/month at very small scale
- **Small SaaS:** roughly $5–$25/month infrastructure before AI, Cloudflare Email overages, payment fees, and third-party APIs
- **AI/agent SaaS:** Cloudflare should remain a small line item; model/API/browser costs are expected to dominate first

These are planning ranges, not guarantees. Always verify current vendor pricing before launch.

## Included usage to design around

### Workers

Workers Paid starts at **$5/month** and includes a monthly request/CPU allowance. Static asset requests are free and unlimited.

Source: https://developers.cloudflare.com/workers/platform/pricing/

### D1

On Workers Paid, D1 includes a large monthly allowance before row-read, row-write, and storage overages. D1 is priced on actual query/storage usage rather than per database.

Source: https://developers.cloudflare.com/d1/platform/pricing/

### R2

R2 Standard includes **10 GB-month storage**, **1 million Class A operations**, and **10 million Class B operations** per month. Internet egress from R2 is free.

Source: https://developers.cloudflare.com/r2/pricing/


### Turnstile

Turnstile is a Cloudflare-native abuse-protection primitive and should not introduce a separate CAPTCHA vendor into the default stack. Verify current plan limits before launch.

Source: https://developers.cloudflare.com/turnstile/

### Web Analytics

Cloudflare Web Analytics is free and privacy-first. Use it for page views, visitors and real-user performance/Web Vitals.

Source: https://developers.cloudflare.com/web-analytics/about/

### Workers Analytics Engine

As of August 2026, Cloudflare publishes a Workers Paid allowance of **10 million data points written/month** and **1 million read queries/month**, with future overage rates of **$0.25 per additional million writes** and **$1.00 per additional million read queries**. Cloudflare currently states Analytics Engine usage is not yet being billed; these rates are published in advance. Data retention is three months.

Source: https://developers.cloudflare.com/analytics/analytics-engine/pricing/
Source: https://developers.cloudflare.com/analytics/analytics-engine/limits/

### Queues

Workers Paid includes **1 million queue operations/month**, with overage billed per additional million operations.

Source: https://developers.cloudflare.com/queues/platform/pricing/

### Workflows

Workers Paid includes **500,000 workflow steps/month** and 1 GB-month workflow storage before overages.

Source: https://developers.cloudflare.com/workflows/reference/pricing/

## Cost rules for every new app

1. Do not add a paid service if Cloudflare already provides the required primitive adequately.
2. Do not add Redis, a separate queue provider, S3, or a second database by default.
3. Store user files in R2, not local disk.
4. Put expensive AI/browser/API work behind usage metering.
5. Record estimated external cost per operation where practical.
6. Add usage caps to paid plans.
7. Prefer deterministic filtering before LLM calls.
8. Prefer queues for asynchronous jobs and Workflows only when durable multi-step orchestration is actually needed.
9. Use Turnstile selectively to reduce automated abuse of public/expensive endpoints.
10. Use Cloudflare Web Analytics + Analytics Engine before adding a paid analytics suite.
11. Use budget alerts before scaling traffic.
12. Revisit architecture only when a measured bottleneck or cost justifies it.

## Per-product unit economics

Every product spec should include:

- monthly subscription or transaction revenue
- expected active users
- expected Worker requests/user
- D1 read/write profile
- R2 GB/user
- queue/workflow operations
- Analytics Engine event/read-query volume where material
- AI tokens / API calls / browser minutes
- outbound transactional email volume above Cloudflare's included allowance
- payment processing fees
- expected gross margin

The goal is not simply cheap hosting. The goal is **predictable gross margin per user**.


## Security is also cost control

Abuse can create infrastructure and third-party spend faster than normal product growth. Every product must therefore protect expensive operations with:

- authentication where appropriate;
- per-user/API-key rate limits;
- plan usage caps or credit checks;
- server-side billing/entitlement checks;
- upload size/type limits;
- AI/browser/API metering;
- webhook replay/idempotency protection;
- alerts for unusual spend or request volume.

Do not expose an expensive AI, browser, file-processing, or agent endpoint anonymously without an explicit abuse model and budget cap.

## Growth Engine costs

The Growth Engine adds mostly **variable**, not fixed, cost.

Cloudflare orchestration should usually remain within the same Workers/D1/R2/Queues/Workflows account envelope. The meaningful additional costs are expected to be:

- render compute (MoneyPrinterTurbo VPS or rendering API);
- AI script/idea/QA calls;
- UGC/avatar generation when used;
- platform API usage/plans where charged;
- storage for rendered media;
- analytics ingestion at scale.

Track every render and external call with a product/content ID and estimated cost. Configure per-product daily spend caps before assisted/autopilot publishing.

### Trend Scout / Content Brain variable cost

Trend discovery should be designed to be cheap before content rendering starts. Prefer free/low-cost direct feeds and deterministic ranking, then use AI only after signals have been filtered.

Cost controls:

- cap provider calls per product and per scan;
- cap YouTube search queries and monitor API quota;
- use the cost-sensitive AI route for Content Brain;
- use broad web-search trend discovery only where it adds value;
- avoid generating/rendering every idea — rank first, render winners/experiments only;
- persist performance learnings so weak formats are reduced over time;
- set per-product daily Growth Engine spend limits before assisted/autopilot mode.

## Growth Engine cost model

The scheduled Workflow itself should remain inexpensive; variable cost is driven primarily by external trend APIs, LLM generation, media rendering and UGC/avatar providers.

Track separately per product:

- trend/search API spend;
- Content Brain model spend;
- video/slideshow/UGC render spend;
- render-sidecar VPS cost;
- social/platform API fees if any;
- total cost per published asset;
- cost per signup and paid conversion.

The daily workflow writes render/provider spend into `growth_budget_ledger` and enforces the product's daily spend cap. A self-hosted MoneyPrinterTurbo renderer can have near-zero marginal API cost but still has VPS/compute cost that should be allocated in reporting.

## External-tool cost discipline

21st.dev, Component Gallery, beUI and Agentation are design/development workflow tools and should not create mandatory runtime vendor coupling unless a product explicitly chooses a paid offering. Firecrawl is usage-based external infrastructure: meter calls and attribute them to features/products. Page Agent itself should not cause a new backend platform; model calls should use the existing model gateway and its normal AI cost tracking.

## Analytics cost discipline

The default product analytics bill should remain close to zero at launch:

- Web Analytics for traffic/RUM;
- Analytics Engine for first-party product, usage and cost events;
- D1/Stripe as systems of record for durable billing/subscription data.

Do not add PostHog, Mixpanel, Amplitude, GA, Hotjar or a separate experimentation platform preemptively. Add specialist analytics only after a product has a concrete requirement such as session replay or advanced no-code funnels that justifies the extra vendor/data flow.

## Agent-distribution cost model

REST and MCP do not require a separate hosting platform in the default job SaaS; they run on the same Worker/service layer. The meaningful incremental cost is variable usage: AI scoring/tailoring, Browser Run/application execution, job/data providers, and any API customer volume.

Track per credential/client:

- REST requests and MCP tool calls;
- AI input/output/cached tokens;
- browser minutes;
- job discovery/provider calls;
- prepared vs submitted applications;
- estimated cost and, for paid API customers, billed usage/revenue.

Do not subsidize an unlimited external-agent key. Apply plan/credit/rate caps and keep submission authority separately grantable.
