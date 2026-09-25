# Dietbox — Product Spec

Status: v1 redesign proposal · Owner: Dietbox (client) · Built with App Factory

## Summary

Dietbox sells auto-renewing (cancel anytime), chef-cooked meal plans portioned to a customer's goal and macros, delivered daily. This app replaces the current dietbox.ae website with a new brand system (`BRAND_GUIDELINES.md`), a marketing site and a working customer + kitchen web app.

## Market (explicit regional product — see GLOBAL_FIRST.md)

1. **Target region:** United Arab Emirates only (delivery to all 7 emirates).
2. **Languages:** English and Arabic. The switch is in the nav (`?lang=ar` also works). Arabic renders right-to-left with Alexandria and IBM Plex Sans Arabic, and keeps Latin digits. Strings live in `src/i18n/ar.ts` and dish names in `src/i18n/catalog-ar.ts`. `tests/i18n.test.ts` fails if a UI string has no Arabic entry. The kitchen admin screen stays English. The Arabic copy is machine-drafted, so a native copywriter should review it before launch.
3. **Pricing/currency:** AED, VAT-inclusive (5%). Prices are computed server-side from `shared/catalog.ts` and charged via Stripe Billing: Checkout `mode=subscription`, `currency=aed`, billed every 1, 2 or 4 weeks (the plan length) until cancelled.
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
- **Checkout**: `POST /api/orders` validates input, prices server-side, creates a `pending_payment` order and a Stripe Checkout subscription session. The webhook activates the order only if user, amount and currency match. The review step discloses the renewal amount, cadence and how to cancel.
- **Renewals**: each cycle is charged 3 days before its first delivery (before the 48h kitchen lock). Skips and pauses move the charge date with the deliveries (Stripe `trial_end`). `invoice.paid` adds the next cycle's delivery days after the last one. A failed renewal marks the plan past due, emails the customer and waits for Stripe's retries; no unpaid days are scheduled. A daily cron (09:00 UAE) aligns charge dates, sends renewal (all cycles of 2- and 4-week plans, the first renewal of weekly plans) and plan-ending reminders, and closes finished plans. Account deletion cancels the subscription.
- **Dashboard** (`/app`): plan card, renewal card (next charge date and amount, turn renewal off/on, pause up to 28 days, update card via the Stripe customer portal, past-due banner), day strip, per-day meals with scaled macros, swap (within the day's programme menu), skip (postpones to end of plan), address edit, data export, account deletion.
- **Kitchen control** (`/admin`): production sheet per date (dish × programme × portions), delivery drops, orders list with renewal status/cycle/next charge, renewal stats and an audited "stop renewal" action. Admin enforced server-side.

## Business rules

- Programmes: Lean ×0.85, Balance ×1, Muscle ×1.3, Low Carb (id `keto`; dishes with 20 g of carbs or less). Plan meals are priced per slot: breakfast, lunch/dinner and snack.
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
- Every dish, macro value and **allergen**. The menu is Diet Box's real talabat menu; values are reconciled or estimated as listed in `MENU_NUTRITION.md`, which the kitchen should sign off line by line.
- Programme prices. They are proposed to undercut the same dishes on talabat (mains AED 34–39, breakfasts AED 18–28): per meal, Lean AED 22 breakfast / 29 main, Balance 24 / 32, Muscle 29 / 39, Low Carb 26 / 34, snacks AED 15.
- Photo rights and originals (see `ASSET_CREDITS.md`).
- Programmes: Plant is retired (the menu has no vegetarian mains) and Keto is now Low Carb (20 g of carbs or less per meal).

## Out of scope (next)

Menu CMS in D1 for the kitchen team · promo codes · gift cards · programme changes between cycles · Arabic reminder emails · push reminders in the mobile apps · rider app / route optimisation · WhatsApp notifications via the email/notification adapter.
