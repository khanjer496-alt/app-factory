# Design Engine

The Design Engine exists to stop generated products from looking like generic AI SaaS templates while keeping the dependency footprint small.

## Core workflow

```text
PRODUCT_SPEC.md
      +
VISION.md (when available)
      ↓
DESIGN_DIRECTION.md
      ↓
Established UX reference
Component Gallery
      ↓
Component discovery
21st.dev
      ↓
Selective polish
beUI
      ↓
Implementation in our repo
      ↓
Loading-state quality
Boneyard when data-heavy
      ↓
Responsive + accessibility QA
      ↓
Agentation human visual review
      ↓
Refine
```

## Required file: DESIGN_DIRECTION.md

Every substantial product should create this before implementing the main UI.

It must define:
- product personality;
- primary user and primary action;
- typography;
- spacing/density;
- radius and border rules;
- surface/background strategy;
- motion rules;
- component families;
- explicit anti-patterns;
- mobile behavior.

Example anti-patterns:
- generic purple AI gradients;
- excessive glassmorphism;
- every card glowing;
- oversized radius everywhere;
- decorative motion with no state meaning;
- combining several unrelated component-library aesthetics.

## Source hierarchy

### Standard product UI
1. established pattern from Component Gallery;
2. source/adaptation from 21st.dev if useful;
3. local primitives already in the app.

### Special interaction
Use beUI only when the interaction benefits from motion or a more refined behavior.

## Copy, don't accumulate dependencies

Prefer copying/adapting the source for a component into the repo. The final component should obey our own design tokens and become maintainable product code.

## Loading states

For async/data-heavy screens, read `design/BONEYARD_LOADING_STATES.md`. Boneyard is the preferred way to generate skeletons from the real UI when that improves layout stability. Do not install it for static/simple screens. Empty, error, retry and partial-success states remain explicit product states.

## Design acceptance gate

A page is not finished until:
- hierarchy is clear in under five seconds;
- the primary action is obvious;
- empty/loading/error/success states exist;
- data-heavy screens use a deliberate loading strategy, with Boneyard preferred when it mirrors the final layout better than a hand-written skeleton;
- keyboard/focus behavior is usable;
- mobile layout works;
- animations respect reduced-motion preferences where applicable;
- imported components share one visual language;
- Agentation review has no unresolved high-priority notes.
