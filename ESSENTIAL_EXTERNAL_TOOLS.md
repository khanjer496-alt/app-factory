# Essential External Tools

The App Factory keeps external tooling deliberately small. These are the only default external tools/pattern sources approved for new apps unless a product-specific requirement justifies something else.

## 1. 21st.dev — component source

Use for finding production-quality React/Tailwind component implementations that can be copied into the app and adapted to the app's design tokens.

Rules:
- Prefer copying source into our repo over adding long-lived UI-library dependencies.
- Do not mix unrelated visual styles on the same product.
- Adapt every imported component to the product's tokens, spacing, typography and accessibility rules.

## 2. Component Gallery — interaction reference

Use as a pattern reference when deciding how standard UI components should behave: tables, filters, tabs, drawers, pagination, forms and similar patterns.

Rules:
- Reference patterns; do not blindly copy styling.
- Prefer familiar interaction behavior over novelty in core product workflows.

## 3. beUI — polished interaction components

Use selectively for high-quality animated React/Tailwind components when a normal primitive is not enough.

Rules:
- Motion must communicate state or hierarchy.
- Do not turn dashboards into animation showcases.
- Copy/adapt only the required component.

## 4. Agentation — human visual QA

Use after a coding agent has rendered the UI. Human annotations are the preferred way to identify exact visual changes instead of vague chat descriptions.

Workflow:
1. coding agent renders the page;
2. human reviews it in browser;
3. annotate the exact element and requested change;
4. coding agent fixes the referenced component;
5. repeat until visual QA passes.

## 5. Boneyard — loading-state quality

Use for data-heavy React screens where skeleton loading should match the real rendered layout. It is a conditional product dependency, not something every app installs.

Rules:
- use on dashboards, lists, tables, cards and other asynchronous screens when layout stability matters;
- do not add it to static/simple pages;
- prefer fixtures for authenticated screens rather than putting real credentials into capture config;
- keep explicit empty/error/retry states — skeletons only solve loading;
- regenerate bones after meaningful layout changes.

See `design/BONEYARD_LOADING_STATES.md`.

## 6. Alibaba Page Agent — optional in-app agent

Use only when a product benefits from letting users control its own UI through natural language.

Examples:
- "Show only invoices over $5,000."
- "Prepare applications for my five highest-match jobs."
- "Open the campaign and change its budget to $500."

Page Agent is not required for every product. It is a product capability behind a feature flag.

Security rule: never expose permanent LLM/provider credentials in client code. Route model calls through an authenticated server/Worker boundary or use appropriately scoped short-lived credentials.

## 7. Firecrawl — optional web intelligence provider

Use when the product, research agent or Growth Engine needs web search, scraping, crawling or extraction beyond normal HTTP fetches.

Default rule:
- use normal fetch/search first when enough;
- use Firecrawl when JS rendering, structured extraction, crawling, or reliable page conversion is materially useful;
- meter usage because it is a paid external service after its included allowance.

The Growth Engine contains a Firecrawl trend provider that uses the v2 search API.

## Deliberately not in the default factory

Do not add these globally just because they exist:
- Aceternity
- OriginKit
- Transitions.dev
- Transition Kit
- BeautifulUI
- IconCreator
- Sevalla
- additional UI kits or hosted backends

A product may use one later only when a concrete requirement cannot be met cleanly by the essential stack.


## Core platform note: email

Cloudflare Email Service is part of the core Cloudflare platform for this factory, not an optional external tool. Use it by default for transactional email and optional inbound routing. Do not add a second transactional-email vendor without a product-specific reason.

## Core platform note: analytics

Cloudflare Web Analytics + Workers Analytics Engine are part of the core platform, not external optional tools. They are the default analytics baseline. PostHog and other specialist analytics suites are intentionally excluded from the default factory and should only be added for a measured requirement such as session replay or advanced product-analysis workflows.

## Core platform note: Turnstile

Cloudflare Turnstile is part of the core platform, not an optional external vendor. Use it selectively on public/abuse-sensitive flows and keep Siteverify server-side. Do not add reCAPTCHA/hCaptcha by default.
