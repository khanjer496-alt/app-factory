# Launch Checklist

Use this for every new production app.

## Product

- [ ] `npm run new-app` completed and `product.config.ts` reviewed
- [ ] Unique feature/business logic implemented
- [ ] Pricing, limits and entitlements match the product spec
- [ ] Empty/loading/error/retry states exist for important async screens
- [ ] Privacy and Terms templates replaced/reviewed for the actual product and jurisdictions
- [ ] Support/contact path works

## Cloudflare

- [ ] Production Worker name/domain configured
- [ ] Production D1 created; placeholder `database_id` replaced
- [ ] Production R2 bucket created
- [ ] Analytics Engine dataset created/configured if enabled
- [ ] Email Service sending domain/binding configured if email is enabled
- [ ] Turnstile production site configured if enabled
- [ ] `/api/*` remains in `assets.run_worker_first`
- [ ] Web Analytics enabled if desired

## Auth

- [ ] Unique production `BETTER_AUTH_SECRET`
- [ ] `APP_URL` and `BETTER_AUTH_URL` use the final HTTPS origin
- [ ] signup works
- [ ] verification email works
- [ ] unverified-user behavior tested
- [ ] sign-in/sign-out works
- [ ] password reset works
- [ ] sessions are revoked after reset
- [ ] Google/OAuth callback tested if enabled
- [ ] Turnstile tested on selected auth/public flows
- [ ] Cloudflare WAF/rate-limiting rules added for abuse-prone endpoints where needed

## Stripe (paid products)

- [ ] Stripe products/prices created
- [ ] allowed plan IDs map to server-side Stripe price IDs
- [ ] Checkout tested in Stripe test mode
- [ ] webhook endpoint configured at `/api/billing/webhook`
- [ ] webhook secret stored as Worker secret
- [ ] duplicate webhook delivery tested/idempotent
- [ ] Customer Portal tested
- [ ] failed-payment handling tested
- [ ] subscription cancellation/entitlement state tested
- [ ] live-mode keys added only after test-mode pass
- [ ] tax/invoicing requirements reviewed for the business/customer jurisdictions

## Private files

- [ ] R2 bucket is not unintentionally public
- [ ] upload type/size limits match product requirements
- [ ] ownership checks tested with two different users
- [ ] download uses private/no-store behavior
- [ ] delete removes both R2 object and D1 metadata
- [ ] account deletion removes owned files

## Account/privacy

- [ ] data export tested
- [ ] account deletion tested end-to-end
- [ ] active subscription handling on deletion verified
- [ ] sessions/linked accounts removed on deletion
- [ ] data retention rules documented for data that cannot/should not be deleted immediately

## Admin/operations

- [ ] `ADMIN_EMAIL` or admin role configured
- [ ] non-admin cannot access `/api/admin/*`
- [ ] Stripe webhook status visible
- [ ] health endpoint monitored
- [ ] feature-flag behavior tested if used
- [ ] logs do not contain secrets or sensitive user content

## Email

- [ ] production From address configured
- [ ] SPF/DKIM/DMARC reviewed
- [ ] verification/reset delivery tested with real inboxes
- [ ] email links use the production HTTPS origin
- [ ] auth email resend/reset abuse is throttled/Turnstile-protected as appropriate

## Database / recovery

- [ ] migrations pass against a fresh database
- [ ] pre-launch D1 export/back-up created
- [ ] restore procedure in `DISASTER_RECOVERY.md` understood
- [ ] destructive migration has rollback/restore plan


## Agent/API distribution (if enabled)

- [ ] `/v1` REST routes require valid scoped credentials
- [ ] `/mcp` protocol endpoint is distinct from `/mcp-docs` public documentation
- [ ] default developer key does **not** include irreversible submission authority
- [ ] full API key is shown once and only its hash/prefix is stored
- [ ] revoked key fails immediately
- [ ] read-only key cannot prepare/write/submit
- [ ] preparation key cannot submit without `applications:submit`
- [ ] submit path still enforces ownership, passed truth QA, zero unresolved questions and explicit confirmation
- [ ] REST and MCP usage events are metered/audited
- [ ] TypeScript/Python/MCP examples match production endpoint names
- [ ] `public/llms.txt` and agent docs contain the production domain
- [ ] MCP Registry `server.json` metadata validated if publishing
- [ ] OAuth 2.1 protected-resource authorization implemented before broad consumer/marketplace MCP distribution

## Quality/security

- [ ] dependency lockfile (`package-lock.json`) created by the first successful install and committed
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run security`
- [ ] critical user journey tested in browser
- [ ] no placeholder secrets/domains/Stripe IDs remain
- [ ] `RELEASE_CHECKLIST.md` completed

## Launch

- [ ] DNS/custom domain live
- [ ] HTTPS/cookies verified on final domain
- [ ] Stripe live webhook receives event successfully if paid
- [ ] auth email receives successfully
- [ ] analytics receives a non-sensitive test event
- [ ] first real signup tested
- [ ] first real payment tested if paid

- [ ] Global-first audit completed; any regional targeting is intentional and documented.
