# Prompt — Add a Feature Without Breaking the Product

Feature request:

[PASTE FEATURE HERE]

Before implementation:

1. read `AGENTS.md`;
2. read `VISION.md` if it exists;
3. read `PRODUCT_SPEC.md`;
4. inspect the current implementation and tests.

Classify the feature:

- `aligned` with the current vision/spec;
- `ambiguous` and requiring a product decision;
- `resisted` by the approved vision.

If `VISION.md` exists and the feature is clearly resisted, explain the conflict before implementing. Do not silently rewrite the vision to justify the feature.

If aligned, implement it using existing primitives and patterns.

For the feature explicitly define:

- user outcome;
- data model changes;
- API/service changes;
- authentication/authorization;
- validation;
- rate/cost limits;
- async/workflow behavior;
- UI states;
- tests;
- cost impact;
- security impact.

Do not add a new infrastructure provider merely for convenience when the current stack can support the feature.

Run validation and update docs when done.
