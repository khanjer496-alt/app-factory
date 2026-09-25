# New Product Brief

## Product
- Name:
- Domain:
- One sentence:
- Primary user:
- Pain solved:

## Market and localization

- Market scope: Global by default / explicitly regional:
- Primary language: English by default
- Additional launch languages:
- Reference pricing currency: USD by default
- Countries/regions intentionally prioritized (if any):
- Regional constraints or compliance requirements:
- Locale/time-zone formatting requirements:

## Monetization
- Paid only? Yes / No
- Billing: subscription / usage / credits / one-time
- Plans:

## Core workflow
1.
2.
3.

## Data
- User-owned entities:
- Files:
- Sensitive fields:

## Automation
- Simple queue jobs:
- Long-running workflows:
- Scheduled tasks:

## AI
- Deterministic filtering before AI:
- Cheap-model tasks:
- Reasoning-model tasks:
- Expected calls per user:

## Agent/API
- External-agent distribution enabled: yes / no
- REST base/capabilities:
- Remote MCP endpoint/tools:
- Default developer-key scopes:
- Write-capable tools requiring explicit scopes:
- Irreversible/submission scope kept separate: yes / no
- Agent usage metering / billing model:
- Public agent docs / quickstarts required:
- MCP registry publication planned: yes / no
- OAuth 2.1 required before broad public distribution: yes / no / not applicable


## Security and privacy
- Authentication required for:
- User/organization ownership model:
- Admin roles/permissions:
- High-impact actions requiring explicit confirmation:
- Public endpoints and rate limits:
- Turnstile-protected flows (signup/reset/public forms/anonymous costly actions):
- Turnstile outage behavior (fail open/closed):
- Expensive endpoints and usage caps:
- Private R2 file types:
- File upload restrictions:
- Webhooks and signature verification:
- Agent/MCP scopes:
- Audit-log events:
- Personal/sensitive data collected:
- AI/subprocessors receiving user data:
- Data retention/deletion policy:
- Data export path:
- Legal/privacy pages required:

## Threat / abuse review
- What can a malicious unauthenticated user abuse?
- What can one authenticated user try to access from another user?
- What actions could create a large AI/API/browser bill?
- What could an external agent do if a token is over-scoped?
- What happens if a webhook is replayed?
- What happens if model output is malicious or structurally invalid?
- What is the worst irreversible action and what prevents accidental execution?


## Vision governance
- VISION.md status: not yet calibrated / approved / delta review needed
- Evidence threshold reached for `/vision`: yes / no
- Existing acceptance criteria relevant to this product spec:
- Explicit non-goals already established:
- Product-owner decisions that should be preserved for future vision calibration:

## MVP
- Must have:
- Later:
- Explicitly out of scope:


## Unit economics

- Price / revenue model:
- Expected active users at launch:
- Expected Cloudflare infrastructure cost:
- Expected AI/API cost per active user:
- Expected storage per user:
- Expected background jobs per user:
- Transactional email required: yes / no
- Cloudflare Email Service sender domain/address:
- Inbound Email Routing required: yes / no
- Expected outbound email volume per user/month:
- Auth emails required: verification / reset / magic link / none
- Non-Cloudflare email provider required: no by default — if yes, explain why:
- Payment processing assumptions:
- Expected total variable cost per paying user:
- Target gross margin:
- Usage limits required to protect margin:

## Analytics / observability

- Cloudflare Web Analytics enabled: yes / no
- Primary conversion metric:
- Workers Analytics Engine enabled: yes / no
- Product events to track:
- Expensive operations that include estimated cost telemetry:
- Pseudonymous actor/account key strategy:
- Sensitive fields explicitly excluded from analytics:
- Need session replay / advanced specialist analytics: no by default — if yes, explain why Cloudflare is insufficient:
- Long-term analytics retention required beyond Analytics Engine: yes / no — where stored?

## Growth / distribution

- Growth Engine enabled: yes / no
- Product Brain owner:
- Target regions/languages:
- Content pillars:
- Allowed product claims:
- Prohibited/regulated claims:
- Preferred formats: faceless / slideshow / demo / UGC-avatar / image / text
- Connected platforms:
- Default autonomy mode: review / assisted / autopilot
- Max publishes/day:
- Max growth spend/day:
- High-risk formats/topics that always require review:
- Attribution target: visit / signup / trial / paid conversion / revenue
- Rendering providers required:
- Trend providers required:

### Trend Scout / Content Brain
- Trend scan cadence:
- Direct platform/API trend sources:
- Broad web/search sources:
- Regions/languages:
- Source concentration cap:
- Minimum trend score:
- Content Brain model route:
- Ideas generated per cycle:
- Experiments per cycle:
- Primary optimization metric: clicks / signups / paid conversions / revenue
- Performance learnings refresh cadence:
- Trend-data prompt-injection handling reviewed: yes / no

## External tools

- Design sources required: [ ] none [ ] 21st.dev [ ] Component Gallery [ ] beUI
- Boneyard loading states required for data-heavy screens: [ ] yes [ ] no / not applicable
- Agentation visual review required: [ ] yes [ ] no
- Firecrawl required: [ ] yes [ ] no — why is direct fetch / official API insufficient?
- Page Agent required: [ ] yes [ ] no — which user workflows does it simplify?
- Any non-standard external vendor: explain why the essential stack is insufficient.
