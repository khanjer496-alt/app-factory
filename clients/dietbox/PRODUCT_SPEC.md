# Dietbox — Product Spec

Status: v1 redesign proposal · Owner: Dietbox (client) · Built with App Factory

## Summary

Dietbox sells prepaid, chef-cooked meal plans portioned to a customer's goal and macros, delivered daily. This app replaces the current dietbox.ae website with a new brand system (`BRAND_GUIDELINES.md`), a marketing site and a working customer + kitchen web app.

## Market (explicit regional product — see GLOBAL_FIRST.md)

1. **Target region:** United Arab Emirates only (delivery to all 7 emirates).
2. **Languages:** English at launch. Arabic is phase 2 (RTL, font pairing in brand guidelines §4).
3. **Pricing/currency:** AED, VAT-inclusive (5%). Prices are computed server-side from `shared/catalog.ts` and charged via Stripe Checkout (`mode=payment`, `currency=aed`).
4. **Legal/compliance:** UAE PDPL (privacy), UAE consumer protection and health-advertising rules (no medical/guaranteed-result claims), allergen disclosure.
5. **Acquisition channels:** Instagram/TikTok, gyms & studios partnerships, Google search (Dubai / Abu Dhabi), referral.
6. **Global-compatible:** Intl formatting via `productConfig.market`, UTC timestamps, delivery calendar dates in the market time zone, international phone formats accepted.

## Users & jobs

| User | Job |
| --- | --- |
| Customer | Pick a programme, set calories, choose rhythm, pay, then swap dishes / skip days / change address. |
| Kitchen & ops | See how many portions of each dish to cook per programme and how many drops per emirate/window. |

## Core flows (implemented)

- **Landing** (`/`): brand story, programmes, how it works, draggable menu preview, macro calculator, pricing, FAQ.
- **Menu** (`/menu`): full catalogue with category/diet/allergen filters and nutrition labels.
- **Plan builder** (`/start`): Goal → Numbers (optional) → Rhythm → Delivery → Review & pay. Draft persists in `sessionStorage` through sign-up + email verification.
- **Checkout**: `POST /api/orders` validates input, prices server-side, creates a `pending_payment` order and a Stripe Checkout session. The Stripe webhook activates the order only if user, amount and currency match.
- **Dashboard** (`/app`): plan card, day strip, per-day meals with scaled macros, swap (within the day's programme menu), skip (postpones to end of plan), address edit, data export, account deletion.
- **Kitchen control** (`/admin`): production sheet per date (dish × programme × portions), delivery drops, orders list. Admin enforced server-side.

## Business rules

- Programmes: Lean ×0.85, Balance ×1, Muscle ×1.3, Keto (keto dishes only), Plant (vegetarian/vegan only).
- Meals/day 2–5 (4th/5th are snacks at AED 19); days/week 5 (Mon–Fri), 6 (Mon–Sat), 7; plan length 1/2/4 weeks (0/5/10% off).
- Earliest start and edit lock: **2 days** in Asia/Dubai time.
- Skipping a day appends one delivery day after the last scheduled day.
- One active plan may not overlap a new plan's start date.

## Endpoint contract

All plan endpoints require a session; queries are scoped by the session user; inputs validated in `worker/services/plans.ts`; audit rows for order create/activate and day skip; max 5 order attempts/user/hour. See the header comment in `worker/routes/plans.ts`.

## Content to verify before launch

These are brand propositions written for the redesign. Dietbox must confirm or edit each one:

- Delivery windows (5–8 AM / 6–10 PM) and coverage of all 7 emirates.
- "Weighed ±5 g", "cooked fresh every morning", 48-hour change lock.
- Every dish, macro value and allergen (currently indicative placeholders).
- Programme prices (currently placeholders: AED 39–52 per meal).
- All photography (Unsplash placeholders — replace with a Dietbox shoot).

## Out of scope (next)

Menu CMS in D1 for the kitchen team · Arabic/RTL · promo codes · gift cards · renewals/auto-reorder · rider app / route optimisation · WhatsApp notifications via the email/notification adapter.
