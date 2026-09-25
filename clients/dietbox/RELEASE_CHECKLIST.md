# Production Release Checklist

Use this checklist for every product created from the App Factory.

## Vision / product boundary

- [ ] If `VISION.md` exists, the release is classified as aligned, ambiguous-with-decision, or explicitly approved exception
- [ ] Material scope changes cite the relevant `VISION.md` acceptance criterion/non-goal
- [ ] No coding agent rewrote `VISION.md` solely to make the feature fit
- [ ] If a vision boundary changed, the product-owner decision and durable reasoning are recorded

## Build

- [ ] TypeScript/typecheck passes
- [ ] Production build passes
- [ ] Automated tests pass
- [ ] Database migrations are reviewed
- [ ] Rollback approach is understood for risky migrations

## Secrets

- [ ] No secrets are present in frontend bundles
- [ ] No `.env` files or credentials are committed
- [ ] Production secrets use Cloudflare Worker secrets
- [ ] Logs do not contain secrets/tokens
- [ ] OAuth callback URLs are production-correct

## Turnstile / abuse protection

- [ ] Signup/public/anonymous-costly flows were reviewed for Turnstile need
- [ ] Turnstile secret is server-only and not present in the frontend bundle
- [ ] Protected flows call Siteverify server-side
- [ ] Invalid, expired and replayed tokens are rejected
- [ ] Expected hostname/action checks are enabled where applicable
- [ ] Siteverify outage behavior was tested/documented
- [ ] Turnstile complements rather than replaces rate limits and usage caps

## Authentication

- [ ] Protected pages require a valid session
- [ ] Protected API routes require authentication
- [ ] Session cookies are secure in production
- [ ] Password-reset and login endpoints are rate limited
- [ ] Account deletion works

## Authorization

- [ ] Every object read is ownership/organization scoped
- [ ] Every mutation performs server-side authorization
- [ ] Admin endpoints verify admin permissions server-side
- [ ] Client-provided role/plan/user IDs are not trusted

## Validation

- [ ] Mutating endpoints validate request schemas server-side
- [ ] File uploads enforce type and size restrictions
- [ ] Unexpected dangerous input is rejected
- [ ] AI structured outputs are schema-validated

## Storage

- [ ] Private R2 objects are not permanently public
- [ ] Signed/private download access requires authorization
- [ ] Object keys are non-guessable and sanitized
- [ ] Deleting a user deletes or schedules deletion of owned private files as required

## Billing

- [ ] Prices are looked up server-side
- [ ] Stripe webhook signatures are verified
- [ ] Webhook processing is idempotent
- [ ] Paid entitlements are checked server-side
- [ ] Usage limits/credits cannot be altered by the client

## Email

- [ ] Product domain is onboarded to Cloudflare Email Service if outbound email is enabled
- [ ] SPF/DKIM/DMARC/bounce records are healthy
- [ ] Worker `EMAIL` binding is production-correct
- [ ] Verification/password-reset emails work end-to-end
- [ ] Auth-email resend endpoints are throttled
- [ ] Email failures are handled without corrupting account/billing state
- [ ] Inbound routing destinations/Workers are correct if enabled
- [ ] Inbound email is treated as untrusted input
- [ ] Current Email Service Beta status, sending limits, and pricing were rechecked before launch

## API / MCP / Agents

- [ ] API keys are hashed or otherwise safely stored
- [ ] MCP/API actions enforce scopes
- [ ] High-impact tools require explicit permission
- [ ] Tool arguments are validated server-side
- [ ] Expensive operations are rate/usage limited
- [ ] High-impact actions create audit events

## Security headers

- [ ] Content-Security-Policy configured
- [ ] X-Content-Type-Options configured
- [ ] Referrer-Policy configured
- [ ] frame protection configured
- [ ] Permissions-Policy reviewed

## Privacy

- [ ] Privacy page exists
- [ ] Terms page exists
- [ ] Data export path works
- [ ] Account deletion path works
- [ ] Data retention is documented
- [ ] AI/subprocessor data flows are documented

## Analytics

- [ ] Cloudflare Web Analytics is enabled for the production hostname or intentionally disabled with rationale
- [ ] SPA navigation is measured correctly for the router in use
- [ ] Workers Analytics Engine binding uses a product-specific dataset name
- [ ] Core conversion/product events are visible in production
- [ ] Expensive AI/API/browser operations emit duration/cost telemetry where useful
- [ ] Analytics contains pseudonymous IDs only; no sensitive content or credentials
- [ ] D1/Stripe remain the system of record for billing/subscription state
- [ ] Analytics Engine retention is sufficient or longer-lived data is persisted elsewhere
- [ ] Current Analytics Engine pricing/limits were rechecked before launch
- [ ] Any specialist analytics vendor has an explicit documented reason and privacy/cost review

## Monitoring

- [ ] Error logging is enabled
- [ ] Request IDs/correlation IDs exist for backend failures
- [ ] Usage/cost anomalies can be detected
- [ ] Critical automation failures surface to an operator/user


## UI / loading quality

- [ ] Every async screen has an intentional loading state
- [ ] Data-heavy screens use Boneyard or an explicitly justified hand-written loading state
- [ ] Boneyard bones/registry were regenerated after the latest wrapped-layout changes
- [ ] Authenticated skeleton capture uses fixtures or safe non-production credentials
- [ ] Mobile/tablet/desktop loading layouts were checked
- [ ] Empty, error, retry and partial-success states remain separate from skeleton loading

## Final gate

- [ ] Dependency/security scan reviewed
- [ ] Secret scan passes
- [ ] No known critical/high vulnerabilities accepted without explicit written rationale
- [ ] Security-sensitive features have been manually tested
- [ ] Product owner approves production release

## Growth / social publishing

- [ ] Growth Engine checklist completed if enabled
- [ ] Social accounts were manually created/verified by the owner/operator
- [ ] OAuth scopes and platform app approvals are production-correct
- [ ] Social tokens are server-only
- [ ] Autopilot has explicit opt-in, limits and kill switch
- [ ] Claims/UGC/disclosure checks pass
- [ ] Render sidecars are authenticated and not publicly exposed
- [ ] Content attribution and cost tracking work

## Growth intelligence

- [ ] Trend Scout providers are explicitly configured and rate-limited.
- [ ] External trend text is treated as untrusted and prompt-injection rules are active.
- [ ] Product relevance ranking is tested against unrelated high-volume trends.
- [ ] Content Brain model failure falls back safely.
- [ ] Prohibited claims are blocked after Content Brain generation.
- [ ] Experiments are attributed through to conversion/revenue where possible.
- [ ] Growth spend/day and publish/day caps are configured.

## Autonomous daily growth workflow

- [ ] `003_daily_growth_workflow.sql` applied
- [ ] Workflow schedule reviewed (Cloudflare schedules use UTC)
- [ ] Daily Growth Workflow deploys and completes in review mode
- [ ] Approval-publish Workflow tested with a non-production account
- [ ] Production credential vault replaces starter JSON credential resolver
- [ ] Render polling survives provider latency/retries
- [ ] Daily publish cap is enforced across existing + new publications
- [ ] Daily spend cap is enforced and render/API costs are recorded
- [ ] Review-required content creates `content_approvals`
- [ ] Platform `needs_review` responses cannot silently publish
- [ ] Attribution metrics endpoint(s) are authenticated and normalized
- [ ] Conversion/revenue metrics are linked to publication IDs
- [ ] Performance learnings are visible in subsequent Content Brain runs
- [ ] Kill switch / product autonomy mode can stop autopublishing immediately


## Global-first compatibility

- [ ] `PRODUCT_SPEC.md` states global vs explicitly regional market scope.
- [ ] No accidental country/city defaults remain.
- [ ] Public pricing is configurable; USD is only the default reference currency.
- [ ] Dates/times/numbers use locale-aware formatting where shown to users.
- [ ] UTC is used for stored timestamps.
- [ ] Growth/trend discovery is not unintentionally locked to one region.
- [ ] Regional legal/compliance behavior is documented only where actually required.
