# Prompt — Implement/Polish the UI

Read `PRODUCT_SPEC.md`, `AGENTS.md`, and any product-specific UI/UX spec in the repository.

Implement the authenticated product UI as a professional web application.

Design direction:

- clean, calm, professional;
- strong information hierarchy;
- responsive desktop/mobile behavior;
- minimal visual noise;
- no generic AI gradients/robot imagery unless the product specifically calls for it;
- one strong accent color and semantic status colors;
- reusable design tokens/components;
- accessible forms and controls;
- keyboard/focus states;
- skeleton loading instead of unnecessary blocking spinners.

For every major feature provide:

- loading state;
- empty state;
- success state;
- error/retry state;
- partial-success state where background automation can partially complete.

Do not put core business logic directly in React components. UI calls service/API boundaries.

If the spec includes high-impact agent actions, make approval and permission state visible and understandable.

Use realistic fixture/test data to make all core screens inspectable locally.
## Essential Design Engine

Before implementation, also read `design/DESIGN_ENGINE.md` and `ESSENTIAL_EXTERNAL_TOOLS.md`. Use Component Gallery for established patterns, 21st.dev for source-level component discovery, beUI selectively for polished interactions, and Agentation for human visual QA. Do not add overlapping UI libraries by default.


## Global-first requirement

Treat the product as serving a global market by default. Do not introduce a regional positioning, city/country defaults, regional language assumptions, or regional-only UX unless the Product Spec explicitly requires it. Use English as the default language, USD as the reference pricing currency, and locale-aware formatting.
