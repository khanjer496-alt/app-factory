# Prompt — Turn an Idea into a Buildable Product Spec

Read `GLOBAL_FIRST.md`, `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `COSTS.md`, `PRODUCT_SPEC_TEMPLATE.md`, and `VISION.md` if present.

Product idea:

[PASTE IDEA HERE]

Create `PRODUCT_SPEC.md` using the repository template.

Requirements:

- make the MVP narrow enough to ship quickly;
- state the one critical user outcome;
- separate MVP, later, and explicit non-goals;
- identify which existing App Factory primitives can be reused;
- use Cloudflare-first architecture by default;
- define the core database entities and ownership rules;
- define the primary UI routes and states;
- define the API/service boundary behind the UI;
- identify which actions are synchronous, queued, or durable workflows;
- identify every third-party API and why it is needed;
- define transactional/inbound email needs; default to Cloudflare Email Service and justify any alternative provider;
- identify expected cost drivers and how usage will be metered;
- identify security/privacy risks;
- identify where human approval is required for high-impact actions;
- include measurable acceptance criteria.

Do not write generic startup language. Make concrete implementation decisions.

Do not create `VISION.md` unless there is already enough repository history and the user specifically asks for vision calibration.


## Global-first requirement

Treat the product as serving a global market by default. Do not introduce a regional positioning, city/country defaults, regional language assumptions, or regional-only UX unless the Product Spec explicitly requires it. Use English as the default language, USD as the reference pricing currency, and locale-aware formatting.
