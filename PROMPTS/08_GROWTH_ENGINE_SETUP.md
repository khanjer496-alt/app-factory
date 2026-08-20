# Prompt — Connect This Product to the Growth Engine

Read:

- `GROWTH_ENGINE.md`
- `packages/growth-engine/README.md`
- `packages/growth-engine/ARCHITECTURE.md`
- `packages/growth-engine/TREND_SCOUT_CONTENT_BRAIN.md`
- `packages/growth-engine/AUTONOMOUS_DAILY_WORKFLOW.md`
- `packages/growth-engine/RELEASE_CHECKLIST.md`
- `PRODUCT_SPEC.md`
- `VISION.md` if present

Connect this product to the shared Growth Engine.

Create/update its Product Brain with:

- value proposition;
- target audience;
- pains/jobs-to-be-done;
- product proof and allowed claims;
- prohibited claims;
- brand voice;
- supported languages/markets;
- content pillars;
- UGC personas where appropriate;
- conversion events;
- paid-conversion/revenue events;
- product URLs and UTM rules;
- content formats appropriate for the product.

Configure the product initially in `review` mode.

The Growth Engine should be able to:

1. collect trend signals;
2. rank trends by relevance to this product;
3. generate multiple content ideas/hooks/formats;
4. create experiments;
5. send content through QA;
6. route rendering through provider interfaces;
7. store rendered assets in R2;
8. queue content for human approval;
9. publish only through authorized account connections;
10. pull attribution metrics;
11. learn from clicks, signups, paid conversions and revenue.

Do not automate social-account signup, CAPTCHA, identity verification, or phone/email verification.

Do not fabricate testimonials, customer stories or performance claims.

Do not enable autopilot until review-mode output has been inspected and platform credentials/permissions are proven.


## Global-first requirement

Treat the product as serving a global market by default. Do not introduce a regional positioning, city/country defaults, regional language assumptions, or regional-only UX unless the Product Spec explicitly requires it. Use English as the default language, USD as the reference pricing currency, and locale-aware formatting.
