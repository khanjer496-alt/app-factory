# Dietbox Brand Guidelines

Version 1.0 · September 2026 · Status: proposal for client review

This document describes the reimagined Dietbox brand. It keeps the existing logo exactly as supplied and builds a new visual system around it, from colour and type to photography, motion, voice and the product UI. The live website in this folder (`src/`) is the reference implementation. When this document and the code disagree, fix one of them so they match again.

---

## 1. Brand essence

### Positioning

Dietbox is **performance food for people who train**. Chef-cooked meal plans, portioned to your macros and delivered before your day starts, anywhere in the UAE.

The category is crowded with clean, beige, "wellness" brands. Dietbox should not try to look like them. Its logo, with the flexing arm and the italic block wordmark, already puts it in the gym and not the spa. The redesign leans into that: the energy of a sports brand combined with the polish of an editorial food brand.

| We are | We are not |
| --- | --- |
| Athletic, direct, confident | Aggressive, shouty, "bro" |
| Numbers-first (kcal, grams, AED) | Vague ("guilt-free", "clean") |
| Premium, chef-driven food | Clinical diet food or supplements |
| A coach in your corner | A doctor or a drill sergeant |

### Brand promise

> **Eat for the body you're building.**

### Proof pillars

Every page, post and package should back up at least one of these:

1. **Precision.** Every meal is weighed and macro-counted. Numbers are always visible.
2. **Chef-cooked.** Real cooking with real flavour, never "diet food".
3. **Zero friction.** Delivered before 8 AM. Swap, skip or pause from your phone.
4. **Built around you.** Five programmes, 2–5 meals a day, calories set to your goal.

### Tagline system

- Primary: **Eat for the body you're building.**
- Short/social: **Fuel. Built.** · **Macros, handled.** · **Train hard. Eat smart.**
- CTA verbs: *Build my plan* · *See this week's menu* · *Start on {date}*

---

## 2. Logo

The logo is used **as supplied** and must not be redrawn, stretched or recoloured outside the approved variants below.

| File (in `public/brand/`) | Use |
| --- | --- |
| `dietbox-logo-volt.png` | **Primary.** Volt on Carbon backgrounds and dark photography. |
| `dietbox-logo-white.png` | Busy or dark photography where volt would clash with food colour. |
| `dietbox-logo-black.png` | Light surfaces (Bone, Chalk, packaging kraft). |
| `dietbox-mark-*.png` | Emblem only (arm in circle): app icon, favicon, stickers, lid seals, avatars. |

> **Production note:** the client supplied raster PNGs only (2813 × 938 px). They work on screen, but a **vector redraw (SVG/AI/PDF) is required before print**, signage or embroidery. Ask the original designer for source files first.

### Clear space

Leave empty space on every side equal to **half the emblem's diameter** (0.5×). No text, edges or other graphics go inside it.

### Minimum size

- Full lockup: **112 px** wide on screen / **30 mm** in print.
- Emblem only: **24 px** / **8 mm**.

### Don'ts

- Don't place the volt logo on Bone, Chalk or any light surface, because the contrast is only 1.17:1.
- Don't add outlines, drop shadows, glows or gradients.
- Don't rotate, skew further or change the italic angle.
- Don't separate "DIET" from "BOX" or re-typeset the wordmark in a font.
- Don't put the logo on top of food detail. Use a calm area of the photo or a Carbon scrim.

---

## 3. Colour

The palette comes from the logo: **Volt** (sampled directly: `#F1E60D`) and **Carbon**, plus a warm **Bone** that gives the food photography room.

### Core palette

| Token | Hex | Role |
| --- | --- | --- |
| `--volt` | `#F1E60D` | Signature accent. Primary CTA fills, highlights, ticker, stickers. |
| `--carbon` | `#0E0F0C` | Primary ink, dark sections, hero. |
| `--bone` | `#F5F2EA` | Default page background. |
| `--chalk` | `#FFFFFF` | Cards and inputs on Bone. |

### Neutrals

| Token | Hex | Role |
| --- | --- | --- |
| `--graphite` | `#23241F` | Raised surfaces on Carbon. |
| `--smoke` | `#62635B` | Secondary text on light (5.43:1 on Bone). |
| `--ash` | `#9A9B92` | Secondary text on dark (6.85:1 on Carbon). |
| `--line` | `#E2DDD0` | Hairlines and borders on light. |

### Macro colours (data only)

Use these only for nutrition data such as rings, bars and chips. They are not for decoration.

| Macro | Fill (on dark) | Ink (text on light, ≥ 4.5:1) |
| --- | --- | --- |
| Calories | Volt `#F1E60D` | Carbon `#0E0F0C` |
| Protein | Ember `#FF5A36` | `#B8300F` |
| Carbs | Leaf `#1FA463` | `#0F7A45` |
| Fat | Iris `#6E6BFF` | `#4B47E0` |

### Proportion

Roughly **60 Bone / 30 Carbon / 10 Volt**. Volt is loud. If it covers more than about 10% of a screen, it stops working as an accent. The one exception is the full-bleed Volt CTA band, which appears once per page.

### Contrast rules (WCAG 2.2)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| Carbon on Volt | 14.71:1 | ✅ Any size |
| Volt on Carbon | 14.71:1 | ✅ Any size |
| Carbon on Bone | 17.19:1 | ✅ Any size |
| Smoke on Bone | 5.43:1 | ✅ Body text |
| Ash on Carbon | 6.85:1 | ✅ Body text |
| **Volt on Bone** | **1.17:1** | ❌ **Never** for text or logo |

---

## 4. Typography

All fonts are free on Google Fonts, so the web, social and print teams can all use the same files.

| Role | Family | Settings |
| --- | --- | --- |
| **Display** | Archivo | Weight 800–900, width 62–75 (condensed), *italic*, UPPERCASE, tracking −1% to −3%. Echoes the slanted logo. |
| **Text / UI** | Archivo | Weight 400–600, width 100, sentence case. |
| **Data** | JetBrains Mono | Weight 500–700, uppercase eyebrows (+8% tracking), kcal and grams, tabular figures. |

Using one superfamily for display and text keeps the page coherent. The **width axis** does the work that a second typeface normally would.

### Type scale (web, fluid)

| Style | Size | Line height |
| --- | --- | --- |
| Display XL (hero) | `clamp(56px, 11vw, 176px)` | 0.86 |
| Display L (section) | `clamp(40px, 6vw, 96px)` | 0.9 |
| Display M (cards) | 28–36px | 0.95 |
| Body L | 20px | 1.5 |
| Body | 16–17px | 1.55 |
| Eyebrow (mono) | 12px, +0.12em | 1 |

### Arabic (phase 2)

When Arabic launches, pair with **IBM Plex Sans Arabic** (text) and **Alexandria** or **Tajawal Black** (display). Mirror layouts with logical CSS properties (`margin-inline`, `inset-inline`). Keep Latin numerals for macros so nutrition data stays consistent.

---

## 5. Graphic language

### The Slash (12°)

The wordmark leans about **12°**. That angle is the brand's graphic signature and appears in:

- the skewed Volt ticker band (`-2°` rotation on the band and `-12°` skew on the separators);
- button hover sweeps;
- section dividers and tag shapes;
- photo crops on hero cards.

Use it for things that suggest movement. Tables and forms stay square.

### Nutrition label

A reinterpretation of the classic nutrition-facts panel with heavy rules, mono numerals and macro colour bars. It is the hero component for any meal detail, packaging lid and social post about a dish.

### Macro ring

A four-segment ring (kcal target with P/C/F split) used in the calculator, the dashboard and social templates. It is always animated from zero on reveal.

### Shape & surface

| Token | Value |
| --- | --- |
| Radius: cards | 24px |
| Radius: inputs | 14px |
| Radius: pills/buttons | 999px |
| Border | 1px `--line` on light, `rgba(255,255,255,.1)` on dark |
| Shadow | Only for floating elements: `0 20px 60px -20px rgba(14,15,12,.35)` |

Anti-patterns: glassmorphism everywhere, purple gradients, glowing cards, emoji as icons, stock "woman laughing at salad".

---

## 6. Photography

Photography is the product, so it should make up about half of the brand's visual weight.

**Direction:** the food is the hero, shot close with nothing distracting. Two looks:

1. **Night kitchen** (hero, social, dark sections): Carbon or slate surface, a single hard key light, deep shadows, glossy highlights on sauces, steam.
2. **Morning counter** (menu, cards): Bone or white stone, soft daylight, overhead or 45°, generous negative space.

**Rules**

- Shoot the real Dietbox portions in the real Dietbox packaging. Don't use restaurant plating that customers won't receive.
- Put a macro chip on every dish shot, because numbers are part of the brand.
- Keep people shots about movement: training, commuting, early mornings. Show hands and effort rather than posed smiles.
- Keep the colour grade warm but not orange. Keep blacks deep, and never lift them into grey.

> **Placeholder notice:** the current site uses licensed Unsplash photography purely as placeholders. Replace every image with a Dietbox shoot before launch. The shot list is in §11.

---

## 7. Motion

Motion should feel like a good rep: **fast out, controlled in**.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Default for everything entering. |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)` | Page and step transitions. |
| Spring | stiffness 380, damping 30 | Toggles, selection pills, drawers. |
| Micro | 160–220ms | Hover, press, focus. |
| Reveal | 600–900ms, 60ms stagger | Headlines, cards on scroll. |
| Ambient | 20–40s linear loops | Ticker, slow bowl rotation. |

**Principles**

1. **Every motion carries meaning.** Numbers count up because they are data, and a step slides because you moved forward. Don't animate purely for decoration.
2. **Headlines reveal line by line from below**, as if they are being lifted.
3. **Buttons respond physically.** They scale 0.97 on press and a Volt sweep runs across at the 12° slash angle on hover.
4. **Respect `prefers-reduced-motion`.** All reveals become instant fades, ambient loops stop, and counters show their final value.

---

## 8. Voice & tone

**Coach, not cheerleader.** Short sentences with numbers first. Speak to "you". Don't lecture.

| Do | Don't |
| --- | --- |
| "42g protein. 520 kcal. Zero effort." | "A delicious guilt-free treat! 😋" |
| "Skip a day? Tap once. We'll add it to the end." | "Our flexible system empowers you to manage deliveries." |
| "Changes lock 48 hours before delivery." | "Unfortunately modifications cannot be processed at this time." |
| "Built for fat loss." | "Melt the fat fast!" (a health claim) |

**Words we use:** build, fuel, lean, macros, portions, cooked, delivered, swap, skip.
**Words we avoid:** guilt-free, clean eating, detox, cheat meal, miracle, "burn fat fast".

---

## 9. Claims & compliance

- Nutrition values on the site are **indicative placeholders**. Every meal needs lab-verified or dietitian-signed macros before launch.
- Don't make medical or guaranteed-result claims such as "lose 5 kg in 2 weeks". UAE advertising rules for health products apply.
- Use testimonials, before/after images or customer counts only when they are real, consented and verifiable. The site ships with none on purpose.
- List the major allergens (gluten, dairy, egg, nuts, sesame, soy, fish, shellfish) on every meal. Always show them on packaging.
- Prices are shown in AED **inclusive of 5% VAT**.

---

## 10. UI tokens (reference)

These tokens are defined in `src/styles.css` under `:root`:

```css
--volt:#F1E60D; --carbon:#0E0F0C; --bone:#F5F2EA; --chalk:#FFFFFF;
--graphite:#23241F; --smoke:#62635B; --ash:#9A9B92; --line:#E2DDD0;
--protein:#FF5A36; --carbs:#1FA463; --fat:#6E6BFF;
--protein-ink:#B8300F; --carbs-ink:#0F7A45; --fat-ink:#4B47E0;
--font-display:"Archivo"; --font-text:"Archivo"; --font-mono:"JetBrains Mono";
--r-card:24px; --r-input:14px; --r-pill:999px;
--ease-out:cubic-bezier(.16,1,.3,1);
```

Buttons have three variants:

- **Primary:** Volt fill with Carbon text.
- **Secondary:** Carbon fill with Bone text.
- **Ghost:** 1px border only.

The primary CTA is always Volt, and there is only one per viewport.

---

## 11. Applications

| Touchpoint | Direction |
| --- | --- |
| **Meal box lid** | Carbon sleeve with a Volt nutrition-label sticker showing meal name, kcal and P/C/F in mono, customer name and day, and the emblem as the seal. |
| **Delivery bag** | Matte Carbon, with the white wordmark large on one side and the emblem on the other. |
| **App icon** | Volt emblem on Carbon, with no wordmark. |
| **Social** | Three templates: (1) dish + macro chip, (2) weekly menu drop on a Volt background, (3) coach tip with a Display XL quote. |
| **Rider uniform** | Carbon tee with the emblem on the chest and "EAT FOR THE BODY YOU'RE BUILDING" on the back in Display italic. |

**Photo shot list (launch):** 30 hero dishes (overhead + 45°), 5 programme flat-lays, packaging close-ups, early-morning delivery (doorstep, 6 AM light), kitchen prep (hands, knives, steam), 10 lifestyle training shots.

---

## 12. Governance

- The product owner approves changes to logo, colour or type.
- New components must use the tokens in §10. Don't add ad-hoc hex values.
- Review this document with each major website release.
