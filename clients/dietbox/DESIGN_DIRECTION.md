# Dietbox — Design Direction

Full system: `BRAND_GUIDELINES.md`. This file is the implementation brief required by `design/DESIGN_ENGINE.md`.

- **Personality:** a sports brand with an editorial food magazine's polish. Athletic, direct, numbers-first.
- **Primary user & action:** a busy person who trains, wants to hit macros without cooking → **Build my plan**.
- **Typography:** Archivo (display: 900, width 62–75%, italic, uppercase; text: 400–700) + JetBrains Mono for data/eyebrows. Self-hosted in `public/fonts/` (OFL).
- **Spacing/density:** generous marketing sections (80–160px), compact app screens.
- **Radius & borders:** 24px cards, 14px inputs, pills 999px; 1px hairlines in `--line`.
- **Surfaces:** Bone page, Chalk cards, Carbon hero/feature sections, Volt as ≤10% accent and one full-bleed CTA band.
- **Motion:** masked line reveals, spring selection pills (`layoutId`), scroll-linked parallax and sticky "how it works", counting numbers, draggable menu rail, blur-cross-fade step transitions, 12° slash sweep on buttons. `MotionConfig reducedMotion="user"` + CSS `prefers-reduced-motion` stop loops and movement.
- **Component families:** display headings, buttons (primary/secondary/ghost), segmented controls, sliders, meal cards, macro ring, nutrition label, sheets, day strip, tables.
- **Anti-patterns:** purple gradients, glassmorphism, glowing cards, emoji icons, stock lifestyle clichés, Volt text on light surfaces.
- **Mobile:** single column; hero plate above copy; sticky sections become stacked; sheets become bottom sheets; stepper shows numbers only.

## Dependency note

`motion` (Motion for React) is the one UI dependency added. Reason: spring physics, shared-layout selection pills, `AnimatePresence` for step/sheet transitions and scroll-linked transforms are core to the brand's motion language, and hand-rolling them would be larger and less accessible. Predetermined loops (ticker, plate rotation, chips) stay in CSS so they run off the main thread.
