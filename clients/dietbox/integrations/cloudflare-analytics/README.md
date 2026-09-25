# Cloudflare Analytics Integration

Cloudflare is the **default analytics layer** for App Factory products.

Use two different Cloudflare products for two different jobs:

1. **Cloudflare Web Analytics** — page views, visitors, Web Vitals and real-user performance.
2. **Workers Analytics Engine** — first-party product events such as signups, feature usage, checkout, AI usage, API usage, workflow outcomes and estimated cost.

Do **not** add PostHog, Mixpanel, Amplitude, GA, Hotjar, Sentry, or a feature-flag vendor by default. Add a specialized tool only when a real product requirement cannot be met cleanly by the Cloudflare baseline.

## 1. Web Analytics

For a site proxied through Cloudflare, enable Web Analytics for the production hostname in the Cloudflare dashboard. Automatic setup can inject the beacon for proxied sites. Cloudflare's SPA support tracks History API navigation (`pushState` / `popstate`); hash-only routers are not supported.

Use Web Analytics for:

- page views and visitors;
- page-load/user-experience metrics;
- Web Vitals / RUM;
- basic traffic monitoring.

Do not use it as the source of truth for product entitlements, billing, user state or security decisions.

## 2. Workers Analytics Engine

Add the binding from `wrangler.example.jsonc` and use `analytics.ts` from server-side Worker code.

Example:

```ts
import { createCloudflareAnalytics } from "./integrations/cloudflare-analytics/analytics";

const analytics = createCloudflareAnalytics({ binding: env.ANALYTICS });

analytics.track({
  actorKey: user.id, // internal UUID only, not email
  name: "feature_used",
  product: "applyflow",
  environment: "production",
  routeOrFeature: "tailor_cv",
  plan: "pro",
  durationMs: 820,
  estimatedCostUsd: 0.014,
});
```

### Canonical field layout

The starter keeps a stable field order so SQL queries remain predictable:

- `index1` — pseudonymous actor/account key
- `blob1` — event name
- `blob2` — product
- `blob3` — environment
- `blob4` — route/feature
- `blob5` — plan
- `blob6` — source
- `double1` — value/count/revenue-like number as defined by the event
- `double2` — duration milliseconds
- `double3` — estimated external cost USD

If a product needs additional dimensions, extend this contract deliberately and document the migration/query impact.

## 3. Privacy rules

Never put these into Analytics Engine:

- email addresses or names;
- passwords, auth/session tokens or API keys;
- CV/resume content;
- chat/message bodies;
- uploaded document contents;
- raw payment-card information;
- sensitive application form answers;
- arbitrary scraped content.

Use internal pseudonymous IDs and coarse dimensions instead.

## 4. Cost / retention boundary

As of August 2026, Cloudflare documents Workers Analytics Engine pricing as:

- Workers Paid: 10 million data points written/month included, then $0.25 per extra million;
- Workers Paid: 1 million read queries/month included, then $1.00 per extra million;
- Cloudflare currently says Analytics Engine usage is not yet being billed, with the published rates provided in advance.

Analytics Engine retains data for three months. If a product requires longer retention, durable financial records, or compliance/audit history, store the canonical record in D1/R2 and use Analytics Engine only for aggregated analytics.

Web Analytics is free and privacy-first.

Always verify current pricing, retention and limits before production launch.

## 5. When to add PostHog or another specialist

Only add a specialist if the product has a measured need for something Cloudflare does not provide adequately, for example:

- full session replay for product-debugging;
- sophisticated product funnels/cohorts for a growth team;
- no-code experimentation/feature-flag workflows;
- long-term behavioral analytics beyond the Cloudflare retention model.

If added, document the reason, data flow, privacy impact and monthly cost in `PRODUCT_SPEC.md` / `COSTS.md`.
