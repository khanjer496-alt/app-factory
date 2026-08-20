# App Factory — Start Building Prompt Pack

Use these prompts with Codex, Claude Code, Cursor, or another coding agent inside a copy of this repository.

## Recommended order

1. `01_MASTER_NEW_APP.md` — start any new product.
2. `02_PRODUCT_SPEC.md` — turn the idea into a buildable scope if needed.
3. `03_MVP_BUILD.md` — execute the first build.
4. `04_UI_IMPLEMENTATION.md` — polish the product UI from the spec.
5. `05_FEATURE_BUILD.md` — use for each later feature.
6. `06_SECURITY_COST_REVIEW.md` — run before production.
7. `07_DEPLOY_CLOUDFLARE.md` — prepare/deploy the app.
8. `08_GROWTH_ENGINE_SETUP.md` — connect autonomous promotion.
9. `09_GROWTH_DAILY_AUTOPILOT.md` — enable the full daily growth loop after review mode is proven.
10. `10_VISION_CALIBRATION.md` — run only after meaningful repository history exists.
11. `11_DEBUG_AND_REPAIR.md` — use when the build or deployment breaks.
12. `12_JOB_AGENT_KICKOFF.md` — ready-made first-product prompt for the job-search/application agent discussed in this project.
13. `13_DESIGN_ENGINE.md` — use for substantial UI/design work.
14. `14_WEB_INTELLIGENCE_FIRECRAWL.md` — use when a feature genuinely needs Firecrawl.
15. `15_IN_APP_PAGE_AGENT.md` — use when a product genuinely benefits from natural-language UI control.
16. `16_LOADING_STATES_BONEYARD.md` — use for data-heavy async screens that need loading skeletons aligned to the real layout.
17. `17_CLOUDFLARE_EMAIL_SETUP.md` — wire transactional/inbound email through Cloudflare Email Service.
18. `18_CLOUDFLARE_ANALYTICS_SETUP.md` — enable Cloudflare Web Analytics + Analytics Engine.
19. `19_CLOUDFLARE_TURNSTILE_SETUP.md` — protect selected public/abuse-sensitive flows.
20. `20_LAUNCH_RUNTIME_SETUP.md` — final launch-readiness pass for auth, Stripe, R2, admin, account/privacy and Cloudflare resources.
21. `21_TURBOREPO_FACTORY_WORKFLOW.md` — change the factory monorepo without coupling exported products to it.
22. `22_JOB_SAAS_LOOPCV_BUILD.md` — build the continuous job-search, tailored-resume and guarded auto-apply loop.
23. `23_AGENT_DISTRIBUTION_POSTIZ.md` — expose the job engine to external AI agents through REST + MCP and prepare agent distribution.

## Fastest way to begin

If you already know what you want to build, paste `01_MASTER_NEW_APP.md` into your coding agent and replace the `PRODUCT IDEA` section.

If the product is the job-search agent, use `12_JOB_AGENT_KICKOFF.md` directly.

## Working rule

The agent must read these repository files before material implementation:

- `AGENTS.md`
- `START_HERE.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `COSTS.md`
- `PRODUCT_SPEC_TEMPLATE.md`
- `VISION.md` if it exists
- `ESSENTIAL_EXTERNAL_TOOLS.md` before adding any external UI/web/agent vendor
- `design/DESIGN_ENGINE.md` for substantial UI work
- `design/BONEYARD_LOADING_STATES.md` for data-heavy async loading states

For Growth Engine work it must also read:

- `GROWTH_ENGINE.md`
- `packages/growth-engine/README.md`
- `packages/growth-engine/ARCHITECTURE.md`
- `packages/growth-engine/RELEASE_CHECKLIST.md`

The prompts below deliberately tell the agent to make reasonable decisions and continue rather than repeatedly asking for permission. It should ask only when a missing decision materially affects product behavior, money, security, legal permissions, or irreversible external actions.

## Analytics

After the core user journey is known, use `18_CLOUDFLARE_ANALYTICS_SETUP.md` to enable Cloudflare Web Analytics and Workers Analytics Engine without introducing a separate analytics vendor by default.

## Turnstile

Use `19_CLOUDFLARE_TURNSTILE_SETUP.md` for signup/public forms or anonymous/trial expensive actions where bot abuse is a realistic risk.



## Job SaaS fast path

Create the LoopCV-class job product with:

```bash
npm run new-job-saas -- --name="ApplyFlow" --description="Your AI job-search and application agent" --destination="../applyflow"
```

Then use `PROMPTS/22_JOB_SAAS_LOOPCV_BUILD.md` from the factory as the implementation prompt.

When the consumer workflow is stable, use `PROMPTS/23_AGENT_DISTRIBUTION_POSTIZ.md` to expose the same capabilities to external agents through scoped REST and MCP surfaces.

## Job SaaS — browser apply + proof

After generating the Job SaaS, use `24_JOB_SAAS_EMPLOYABLE_CORE.md` when implementing or reviewing Workday/browser submission, proof screenshots, onboarding, and outcome learning.


## Global-first check

Before launch or after adapting an older blueprint, run `25_GLOBAL_FIRST_REVIEW.md`.
