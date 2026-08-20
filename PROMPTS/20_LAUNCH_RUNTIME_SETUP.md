# Prompt 20 — Launch the SaaS Runtime

Use this after the product-specific feature is implemented and before calling the app launch-ready.

```text
Prepare this App Factory product for its first real Cloudflare deployment.

Read first:
- START_HERE.md
- RUNTIME.md
- product.config.ts
- wrangler.jsonc
- SECURITY.md
- COSTS.md
- LAUNCH_CHECKLIST.md
- RELEASE_CHECKLIST.md
- DISASTER_RECOVERY.md
- AGENTS.md
- VISION.md if it exists

Do not introduce a new hosting/database/auth/email/analytics provider unless a verified product requirement cannot be met by the existing stack.

Tasks:
1. Confirm product.config.ts has the correct name, slug, description, plans and feature flags.
2. Confirm wrangler.jsonc uses `not_found_handling: single-page-application` and `run_worker_first: ["/api/*"]` so auth/API navigations reach the Worker.
3. Identify the exact D1 database, R2 bucket, Analytics Engine dataset, Email Service binding and Turnstile resources required by enabled features.
4. Find every placeholder resource ID, hostname, email address, Stripe price, secret name and example value that must be replaced before production. Do not invent production credentials.
5. Verify Better Auth signup, email verification, sign-in, sign-out, password reset and protected routes.
6. If billing is enabled, verify Stripe Checkout, Customer Portal, webhook signature validation, webhook idempotency and D1 entitlement synchronization. Prices must resolve server-side.
7. Verify private file authorization using two-user ownership tests if uploads are enabled.
8. Verify account export and deletion, including file cleanup, sessions/accounts and active subscription handling.
9. Verify admin routes reject ordinary users server-side.
10. Verify Cloudflare Email Service and Turnstile are server-side integrated; never expose secrets in Vite/browser variables.
11. Verify Analytics Engine events contain no sensitive user content.
12. Apply all D1 migrations to a fresh local database.
13. Run typecheck/build/tests/security checks. Fix failures rather than bypassing checks.
14. Review GitHub deployment workflow and ensure migrations run before deploy with the intended production resources.
15. Complete LAUNCH_CHECKLIST.md and report every item that still requires a real account/domain/credential/manual approval.

Output:
- concise launch-readiness summary;
- exact remaining manual setup commands/Cloudflare dashboard actions;
- all blockers;
- tests/checks actually executed and their results;
- do not claim live Stripe/email/OAuth functionality was verified unless you actually tested it with real/test provider credentials.
```
