# Security Baseline

This starter treats security as a release requirement, not an optional polish step.

Every generated application must pass the security gate before it is called production-ready.

## 1. Trust boundaries

- The browser is untrusted.
- User-supplied IDs, prices, roles, permissions, file paths, plan names, and usage counts are untrusted.
- LLM output is untrusted until validated against business rules and permissions.
- External webhooks are untrusted until their signatures are verified.
- Agent/MCP clients are untrusted until authenticated and authorized for the requested scope.

## 2. Secrets

Never place secrets in frontend code, public environment variables, static assets, logs, or source control.

Use Cloudflare Worker secrets for values such as:

- OpenAI / Anthropic keys
- Stripe secret keys and webhook secrets
- OAuth client secrets
- signing keys
- internal service credentials

Frontend-safe configuration must be explicitly separated from server-only secrets.

## 3. Authentication and authorization

Every protected endpoint must answer five questions:

1. Who is the caller?
2. Is the caller authenticated?
3. Is the caller allowed to perform this action?
4. Does the requested resource belong to the caller or their organization?
5. Is the action allowed under the caller's current plan/scope?

Never trust a `user_id`, `organization_id`, role, or plan sent by the client when the server can derive it from the authenticated session.

### Data ownership pattern

Prefer queries shaped like:

```sql
SELECT *
FROM files
WHERE id = ?
  AND user_id = ?;
```

rather than fetching by object ID and checking ownership later.

## 4. Input validation

All mutating and sensitive API routes must validate inputs server-side with explicit schemas.

Validation includes:

- type
- required fields
- min/max lengths
- enumerated values
- numeric ranges
- URL/domain restrictions where relevant
- file type and size
- unexpected field rejection for sensitive actions

Client-side validation is for UX only.

## 5. Rate limiting and cost protection

Apply rate limits to:

- authentication endpoints
- password reset
- signup
- file uploads
- AI generation
- public APIs
- MCP endpoints
- browser/automation actions
- expensive search or workflow triggers

AI and automation endpoints must also enforce usage quotas or credit checks before starting paid work.

## 6. File and R2 security

R2 objects are private by default.

Do not expose permanent public URLs for customer-private data such as:

- CVs
- invoices
- generated reports
- contracts
- private images/documents
- exported user data

Access must flow through an authorization check or a short-lived signed URL.

File uploads must enforce:

- max size
- permitted MIME types/extensions
- sanitized object keys
- ownership metadata
- random/non-guessable object IDs

## 7. Billing security

The client selects a product or plan identifier only.

The server determines:

- price
- currency
- entitlements
- usage allowance
- billing interval

Never accept a client-supplied monetary amount as authoritative.

Verify Stripe webhook signatures before processing events.

Webhook handlers must be idempotent.

## 7A. Email security

Cloudflare Email Service is the default transactional-email layer.

Rules:

- sender domains must be onboarded and authenticated through Cloudflare Email Service;
- auth links/tokens are generated server-side and are never logged in full;
- verification/reset resend endpoints are rate limited;
- email failures do not silently mark verification/payment actions as successful;
- inbound email bodies, HTML, attachments, and headers are untrusted input;
- never feed inbound email directly into a tool-using agent without prompt-injection, authorization, and attachment controls;
- store message IDs/status metadata when operationally useful, but avoid retaining message bodies unless the product requires it;
- use queues for non-critical bulk notifications when request latency/retries matter.

## 8. Agent and MCP permissions

Agent tools require explicit scopes.

Recommended scope model:

- `read:*`
- `write:*`
- domain-specific read/write scopes
- explicit high-impact scopes such as `applications:submit`, `billing:write`, or `files:delete`

Models do not decide permissions. The backend does.

High-impact operations should require one of:

- explicit user confirmation
- an existing user-authored automation rule
- a narrowly scoped service credential

## 9. AI output safety

Treat model output as proposed data, not trusted application state.

For structured output:

- validate against a schema
- reject unknown fields when appropriate
- check references and ownership
- enforce business rules after generation

For agents with tools:

- allowlist tools
- enforce scopes per tool
- validate every tool argument
- log high-impact calls
- do not pass secrets into prompts unless strictly necessary

## 10. Security headers

Production responses should set sensible defaults including:

- Content-Security-Policy
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- frame-ancestor / clickjacking protections
- HTTPS-only cookies for authenticated sessions

Cookie defaults:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` or stricter when compatible

## 11. Audit logging

Log high-impact actions with:

- actor ID
- actor type (user, service, agent)
- action
- resource type
- resource ID
- result
- timestamp
- request/correlation ID

Do not log secrets, raw access tokens, complete payment credentials, or unnecessary sensitive content.

## 12. Privacy baseline

Before production, every product must document:

- personal data collected
- purpose
- storage location
- retention period
- subprocessors / AI providers
- deletion path
- export path
- whether files are private

Required product routes/placeholders:

- `/privacy`
- `/terms`
- `/delete-account`
- `/data-export`

A placeholder is not a substitute for jurisdiction-specific legal review when required.

## 13. Security release gate

A production release must not be marked ready until:

- typecheck/build passes
- dependency audit is reviewed
- secret scan passes
- protected routes have auth + authorization
- inputs are server-validated
- R2 private-file behavior is verified
- billing values are server-derived
- webhook signatures are verified
- rate limits/quotas cover expensive endpoints
- agent permissions are explicit
- high-impact actions are logged
- account deletion/export flows are tested

See `RELEASE_CHECKLIST.md` for the operational checklist.

## Growth and publishing security

Social publishing credentials are high-impact secrets.

- Never expose OAuth access/refresh tokens to the browser after connection.
- Store only a server-side credential reference in normal application rows where possible.
- Publishing actions require explicit platform scopes and product authorization.
- Autopilot requires recorded opt-in, daily caps, cost caps, and a kill switch.
- Renderer sidecars must be authenticated; do not expose MoneyPrinterTurbo directly because its v1 router may be unauthenticated by default.
- Never use customer production accounts/data for automated demo recording unless explicitly designed and approved; use seeded demo accounts.
- Treat trend input and generated content as untrusted before publication.

## Trend/search prompt injection

Trend Scout ingests untrusted public-web text. Treat every title, description, transcript, URL, feed entry, search result, and trend description as attacker-controlled data.

- Sanitize/truncate external trend text before persistence/model use.
- Never place source text in a system/developer instruction position.
- Content Brain prompts must explicitly instruct the model to ignore commands embedded in trend/source text.
- Do not allow trend text to change tools, permissions, secrets, publishing policy, spend caps, or product claims.
- Do not fetch arbitrary URLs from model output without URL allow/deny and SSRF protections.
- Model output still passes QA, claim rules, and autonomy gates before rendering/publishing.

## Autonomous Growth Workflow security

- Scheduled growth runs inherit the same authentication/authorization boundaries as interactive actions even though no browser user initiates them.
- Social credentials must be resolved server-side from a protected credential service; do not place raw access/refresh tokens in D1.
- `SOCIAL_CREDENTIALS_JSON` in the starter runtime is for integration scaffolding only and must be replaced before production autopilot.
- Trend/search text is untrusted data and cannot alter tool permissions, budgets, claims policy or publishing rules.
- Human approval status is persisted and audited before `ApprovalPublishWorkflow` can publish reviewed content.
- Daily spend/publish caps are server-enforced and cannot be overridden by content-model output.
- Rendering sidecars must be private/authenticated. Do not expose MoneyPrinterTurbo's starter API publicly.

## Page Agent and Firecrawl

- Never expose permanent Page Agent model/provider credentials or `FIRECRAWL_API_KEY` to browser bundles.
- Page Agent cannot bypass server authorization or confirmation gates.
- Firecrawl results and DOM/page content are untrusted input and may contain prompt injection. Treat them as data, never as instructions.

## Cloudflare Turnstile baseline

Turnstile is the default challenge mechanism for selected public or abuse-sensitive flows. It is not a substitute for authentication, authorization, rate limiting or billing/usage caps.

Requirements:

- the Turnstile sitekey may be public; the secret key must remain a Worker secret;
- every protected request validates the client token with Cloudflare Siteverify server-side;
- expected hostname/action is validated where configured;
- expired/replayed/invalid tokens are rejected;
- full challenge tokens are never logged;
- Siteverify outage behavior is explicit per flow;
- automated tests use Cloudflare testing keys, not production credentials.

## External-agent/API credential security

When a product exposes REST or MCP capabilities to external agents:

- Store API keys only as one-way hashes; retain only a non-secret prefix for display/audit.
- Show the full key only once at creation and never return it from list endpoints.
- Bind every credential to one user/account and explicit scopes.
- Revocation must take effect on the next request.
- Read/preparation scopes and irreversible submission scopes must be separate.
- Every tool/endpoint performs server-side scope + ownership checks; MCP is not a trusted internal channel.
- Submission still requires all domain guardrails (truth status, unresolved-question status, confirmation, plan/daily caps).
- Validate `Origin` on browser-originated remote MCP traffic where relevant and do not use wildcard trusted origins.
- Do not log bearer tokens, Authorization headers, full API keys, OAuth access tokens, or MCP auth metadata containing secrets.
- Record non-sensitive audit/usage events for key creation, revocation, operation name, result and high-impact submissions.
- Long-lived API-key auth is a developer-launch mechanism, not the end state for broad consumer MCP distribution. Use an OAuth 2.1 protected-resource flow before asking large numbers of end users to authorize external MCP clients.
