# Prompt 19 — Cloudflare Turnstile Setup

Read `SECURITY.md`, `AGENTS.md`, `PRODUCT_SPEC.md` (or the template), and `integrations/cloudflare-turnstile/README.md` first.

Add Cloudflare Turnstile only to public/abuse-sensitive flows that benefit from bot protection. Do not put challenges on every authenticated request.

Tasks:
1. Identify the smallest set of endpoints that need Turnstile (signup, reset/resend, public forms, anonymous/trial expensive actions).
2. Define a widget action name for each protected flow.
3. Add the public sitekey to frontend config and keep the secret in a Worker secret named `TURNSTILE_SECRET_KEY` (or product-equivalent).
4. Send the challenge token to the Worker and validate it server-side with `verifyTurnstile()` / Siteverify before the protected action runs.
5. Validate expected hostname/action where practical.
6. Keep rate limiting, authorization and plan/usage caps; Turnstile does not replace them.
7. Use Cloudflare test keys for automated/local testing.
8. Add release checks for valid, invalid, expired/replayed and unavailable-Siteverify behavior.

Return:
- protected flows;
- files changed;
- sitekey/secret configuration locations;
- server-side validation path;
- fail-open/fail-closed decision for Siteverify outages;
- tests performed.
