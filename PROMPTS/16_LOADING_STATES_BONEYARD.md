# Prompt — Boneyard Loading States

Read `PRODUCT_SPEC.md`, `AGENTS.md`, `design/DESIGN_ENGINE.md`, `design/BONEYARD_LOADING_STATES.md`, and the existing UI code.

Audit the product for data-heavy asynchronous screens.

Use Boneyard only where it materially improves loading quality. Do not add it to static/simple pages.

For each selected screen:

1. identify the final resolved component whose layout should be mirrored;
2. install `boneyard-js` if it is not already present;
3. wrap the resolved content with a stable unique `Skeleton` name or use `BoneSuspense` for an appropriate Suspense boundary;
4. add realistic non-sensitive fixture data if the page cannot resolve during capture;
5. configure the product breakpoints;
6. generate bones with the Boneyard CLI or Vite plugin;
7. import the generated registry exactly once at app entry;
8. verify desktop/tablet/mobile loading states visually;
9. confirm there is minimal layout shift when real data resolves;
10. preserve explicit empty, error, partial-success and retry states — a skeleton does not replace them.

Security:
- do not commit live session cookies or credentials in Boneyard configuration;
- use fixtures instead of production secrets for authenticated pages whenever possible.

Finish with a short report listing:
- screens wrapped;
- skeleton names;
- generated routes/breakpoints;
- any screens intentionally left with a hand-written loading state and why.
