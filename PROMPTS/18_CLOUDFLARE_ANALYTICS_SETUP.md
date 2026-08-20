# Prompt 18 — Cloudflare Analytics Setup

Use this after the app's production hostname and core user journey are known.

Read `ARCHITECTURE.md`, `COSTS.md`, `SECURITY.md`, `PRODUCT_SPEC.md` (or the template), `AGENTS.md`, and `integrations/cloudflare-analytics/README.md` first.

Implement the Cloudflare-first analytics baseline without adding PostHog, GA, Mixpanel, Amplitude, Hotjar, Sentry, LaunchDarkly, or another analytics vendor unless the product spec explicitly requires one.

Tasks:

1. Enable/document Cloudflare Web Analytics for the production hostname and confirm SPA navigation behavior for the router being used.
2. Add a Workers Analytics Engine binding named `ANALYTICS` with a product-specific dataset name.
3. Wire `integrations/cloudflare-analytics/analytics.ts` into the Worker/server capability layer.
4. Track only the minimum high-value events for this product. Start from:
   - signed_up
   - onboarding_completed
   - feature_used
   - checkout_started
   - subscription_started
   - subscription_cancelled
   - ai_operation / api_operation for expensive operations
5. Use internal pseudonymous IDs only. Never send email/name/tokens/private documents/message bodies or sensitive form content to analytics.
6. Include duration and estimated external cost for AI/API/browser operations where useful.
7. Keep canonical financial/subscription/audit records in D1/Stripe; Analytics Engine is not the system of record.
8. Add release checks confirming Web Analytics visibility, event ingestion, privacy review and cost anomaly visibility.
9. Update `PRODUCT_SPEC.md` with the event list and primary conversion metric.

Return:
- files changed;
- events added;
- exact Wrangler binding;
- privacy decisions;
- how to verify events in production;
- any reason a specialist analytics tool is still required.
