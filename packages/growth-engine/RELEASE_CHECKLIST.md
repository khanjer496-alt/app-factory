# Growth Engine Release Checklist

## Product onboarding
- [ ] Product Brain completed and approved
- [ ] Allowed/prohibited claims defined
- [ ] CTA/landing URLs verified
- [ ] Brand assets stored in R2
- [ ] Autonomy starts in `review` unless explicitly approved otherwise

## Accounts & OAuth
- [ ] Social accounts were created/verified by the owner/operator
- [ ] OAuth/user authorization completed through supported platform flows
- [ ] Tokens are server-only and encrypted/protected as applicable
- [ ] Minimal scopes requested
- [ ] Token revocation/reconnect flow exists
- [ ] Platform app audits/approvals completed where required for public/direct posting

## Rendering
- [ ] MoneyPrinterTurbo sidecar is not publicly exposed without gateway auth
- [ ] Render outputs are copied into controlled R2 storage
- [ ] UGC/avatar provider disclosure/consent requirements reviewed
- [ ] Product demo recordings use test/demo data only
- [ ] Rendering timeouts/retries/budgets exist

## QA
- [ ] Product claims checked against Product Brain
- [ ] No fabricated testimonials or fake customer identities presented as real
- [ ] AI/avatar disclosure rules configured per platform/jurisdiction
- [ ] Copyright/source rules for media/audio checked
- [ ] Caption/CTA/landing link validated
- [ ] Technical dimensions/duration validated

## Publishing
- [ ] Per-platform daily caps configured
- [ ] Duplicate-content suppression works
- [ ] Review queue works
- [ ] Publish retries are idempotent
- [ ] Failed posts surface to operator
- [ ] Deletion/unpublish path documented where API allows it

## Analytics
- [ ] Published post IDs saved
- [ ] Metrics polling respects platform quotas
- [ ] Attribution IDs/UTMs configured
- [ ] Revenue events can be joined to content IDs
- [ ] Cost per render/publish tracked

## Autopilot
- [ ] Explicit product owner opt-in recorded
- [ ] Budget cap configured
- [ ] Daily publish cap configured
- [ ] High-risk content always routes to review
- [ ] Kill switch tested

## Trend Scout / Content Brain

- [ ] At least two independent trend sources are configured for production, or source concentration is explicitly accepted.
- [ ] Trend provider failures degrade gracefully and do not block the entire scan.
- [ ] Provider credentials are Worker secrets, never browser variables.
- [ ] YouTube API quota usage is monitored if the YouTube provider is enabled.
- [ ] Optional Google Trends RSS failures are treated as non-fatal.
- [ ] Content model ID is configurable and routed through the App Factory AI layer where possible.
- [ ] Model-generated claims are still checked by content QA.
- [ ] Fallback templates are tested.
- [ ] Experiment metrics are tied to clicks/signups/conversions/revenue, not views alone.
- [ ] Trend and content run records are persisted to D1.

## Daily workflow

- [ ] Migration 003 is applied.
- [ ] Workflow schedule is correct in UTC.
- [ ] Review mode completes without publishing.
- [ ] Assisted/autopilot cap enforcement tested.
- [ ] Approval-publish Workflow tested.
- [ ] Credential resolver is production-safe.
- [ ] Metrics provider is authenticated.
- [ ] Metrics ingestion cannot write arbitrary foreign publication IDs.
- [ ] Render timeout/polling behavior tested.
- [ ] Failed provider calls produce audit/review state rather than lost work.
