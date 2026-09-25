# Global-First Product Policy

App Factory products target a global market by default. Regional focus is opt-in, never assumed.

## Default product assumptions

- Audience: global unless the product spec explicitly names a geographic constraint.
- Primary product language: English. Add localization only when supported by demand or product requirements.
- Reference pricing currency: USD. Stripe price IDs remain the source of truth; localized display/pricing may be added later.
- UI formatting: use locale-aware date, time, number, and currency formatting (`Intl.*`) rather than hard-coded formats.
- Time zones: store timestamps in UTC and render in the user or selected market time zone.
- Locations: never prefill one country/city as the product default. Ask the user or leave the field empty.
- Phone, address, postal code, work authorization, and tax fields must support international formats when the feature requires them.
- SEO/Growth: research globally by default and allow country/language segmentation. Do not hard-code one region into trend discovery.
- Legal/compliance: product-specific launch plans must identify jurisdictions actually served; do not copy one country's legal assumptions into every product.
- Infrastructure: choose globally available defaults and do not add a regional provider unless there is a documented requirement.

## Regionalization

A product may deliberately target a region, language, or country only when `PRODUCT_SPEC.md` says so. In that case document:

1. target countries/regions;
2. supported languages;
3. pricing/local-currency strategy;
4. regional legal/compliance requirements;
5. region-specific acquisition channels;
6. what remains global-compatible.

## Coding-agent rule

Do not infer a regional niche from the founder's location, examples, prior projects, or test data. If the product spec does not specify a region, treat the market as global.
