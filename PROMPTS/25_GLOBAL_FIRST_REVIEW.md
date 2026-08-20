# Prompt 25 — Global-First Review

Read `GLOBAL_FIRST.md`, `PRODUCT_SPEC.md`, `AGENTS.md`, and the current UI/configuration.

Audit this product for accidental regional assumptions.

Check for:
- hard-coded countries/cities in onboarding or defaults;
- regional-only positioning not required by the Product Spec;
- hard-coded currencies instead of configurable/localized pricing;
- non-localized date/time/number formatting;
- phone/address/postal-code assumptions;
- one-country legal/compliance assumptions copied into a global app;
- Growth/Trend Scout region locks;
- language assumptions beyond English as the initial default;
- job/work-authorization assumptions tied to one country;
- SEO or metadata that narrows the product to a region without product justification.

Fix accidental assumptions while preserving explicitly documented regional requirements.

Do not add localization complexity that the MVP does not need. The goal is global compatibility, not translating every product on day one.

Report:
1. assumptions found;
2. changes made;
3. remaining intentionally regional behavior;
4. launch markets configured, if any.
