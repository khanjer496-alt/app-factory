# Prompt — Build the MVP

Read `GLOBAL_FIRST.md`, `AGENTS.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `SECURITY.md`, `COSTS.md`, and `VISION.md` if present.

Build the MVP described in `PRODUCT_SPEC.md`.

Rules:

- preserve the existing App Factory architecture;
- build vertical slices rather than disconnected scaffolding;
- use D1/R2/Queues/Workflows only where appropriate;
- route all AI calls through the shared AI layer;
- validate model structured output before use;
- meter expensive AI/API/browser operations;
- protect all user-owned resources by authenticated ownership checks;
- use private R2 access for private files;
- do not hardcode secrets;
- add migrations rather than manually mutating production schema;
- add useful tests for critical business logic and security boundaries;
- support loading, empty, success, partial-success, and error states in the UI;
- keep the UX direct and mobile responsive.

Implementation sequence:

1. database/migrations;
2. service/business logic;
3. API routes and validation;
4. async/workflow jobs;
5. UI screens/components;
6. usage/cost instrumentation;
7. tests;
8. security check;
9. documentation updates.

Do not stop to ask about small reversible design choices. Choose sensible defaults and continue.

When done, run all available type checks/tests/build/security checks and repair failures.


## Global-first requirement

Treat the product as serving a global market by default. Do not introduce a regional positioning, city/country defaults, regional language assumptions, or regional-only UX unless the Product Spec explicitly requires it. Use English as the default language, USD as the reference pricing currency, and locale-aware formatting.
