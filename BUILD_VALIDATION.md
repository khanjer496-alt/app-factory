# Build Validation

Validated for this package on 2026-08-21.

## Turborepo factory integration — passed without registry install

- Root `package.json` defines npm workspaces for `apps/*` and `packages/*`: PASS
- Workspace discovery finds `@app-factory/starter-web` and `@app-factory/growth-engine`: PASS
- Root `turbo.json` parses and defines build/check/test/dev/deploy/database task policy: PASS
- Factory app template moved to `apps/starter-web/`: PASS
- Growth Engine moved to `packages/growth-engine/`: PASS
- Factory deploy/E2E GitHub workflows updated for workspace paths/root orchestration: PASS
- `scripts/new-app.mjs` exports a standalone app to an external directory: PASS
- Exported app package contains no `workspace:` or `@app-factory/*` dependency: PASS
- Exported app contains no `apps/starter-web` or `packages/growth-engine` path references: PASS
- Exported app restores normal standalone `npm run build && wrangler deploy`: PASS
- Factory template deploy uses Turbo task dependency rather than rebuilding inside the deploy script: PASS
- `TURBOREPO.md` and Prompt 21 document the monorepo boundary: PASS

## Standalone SaaS runtime — passed without external credentials

- Relative TypeScript/TSX imports in `apps/starter-web` resolve after the move: PASS
- App D1 migrations execute on a fresh SQLite database: PASS
- `scripts/new-app.mjs` syntax: PASS
- `scripts/security-check.sh` shell syntax: PASS
- `wrangler.jsonc` remains inside the standalone app template: PASS
- Better Auth/Stripe/private-R2/admin/email/analytics implementation retained after move: PASS by source/path validation
- GitHub security, deploy and E2E workflows present: PASS

## Growth Engine

- Growth Engine migrations execute on a fresh SQLite database: PASS
- Trend Scout / Content Brain / daily workflow source retained under `packages/growth-engine`: PASS
- MoneyPrinterTurbo provider seams retained: PASS
- Vision skill, review assets and MIT notice retained: PASS
- Design Engine, Firecrawl/Page Agent guidance and Boneyard loading-state guidance retained: PASS

## Dependency-aware validation

- Clean workspace dependency install and root `package-lock.json` generation: PASS
- `npm run check` (generated Worker types, TypeScript, Vite production build, Wrangler deployment dry-run): PASS
- `npm test` (starter and Growth Engine suites): PASS, 8 tests
- `npm audit --audit-level=high`: PASS, 0 vulnerabilities
- `npm run build`: PASS
- `npm run graph`: PASS
- `npm run test:e2e`: PASS, 2 Playwright browser/API tests

## Requires real/test external configuration

These still require real provider accounts/credentials/deployed infrastructure:

- Cloudflare Email Service delivery;
- Google OAuth callback;
- Stripe Checkout/webhooks/Customer Portal;
- production Turnstile verification;
- production custom-domain/cookie behavior;
- real R2/D1 Cloudflare bindings;
- live Growth Engine social publishing/OAuth;
- MoneyPrinterTurbo/OpenAI/YouTube/Firecrawl and other optional providers.

Complete `LAUNCH_CHECKLIST.md` in the exported product before production.


## Job SaaS / LoopCV-class blueprint

- `npm run new-job-saas` exports a standalone job product: PASS
- Generated product contains no workspace-only dependencies: PASS
- Job D1 migration applies cleanly after the core migration: PASS
- Job core TypeScript semantic check with Cloudflare type stubs: PASS
- All generated TS/TSX files pass TypeScript syntax transpilation: PASS
- Greenhouse, Lever, Ashby and SmartRecruiters adapters share `NormalizedJob`: PASS by source validation
- Scheduled cycle performs discovery -> deterministic filter -> score -> optional prepare -> guarded queue: PASS by source validation
- LinkedIn ingestion stores URL/email discovery leads without server-side LinkedIn scraping: PASS
- CV file extraction uses private R2 ownership checks, 5 MB limit, Responses API `store:false`, and inserts extracted facts as `inferred`: PASS
- Resume tailoring is followed by a separate truth-verification call: PASS
- Application submission is review-first and externalized behind a browser/ATS provider contract: PASS
- Autopilot checks match threshold, daily cap, unresolved questions, resume truth status and application state: PASS
- Browser-provider `needs_input` response creates user-review questions instead of inventing answers: PASS
- Job UI includes responsive dashboard, Jobs, Applications, Job Agent/Autopilot and Career Brain screens: PASS by syntax/source validation
- Job core database smoke seed and constraints: PASS

Live end-to-end job discovery/model/browser submission still requires OpenAI credentials, real source identifiers, Cloudflare Queue resources, and a configured browser automation endpoint.

## Agent distribution / Postiz-style channel

- Job SaaS export contains user-scoped REST `/v1` routes: PASS
- Remote MCP protocol endpoint `/mcp` is separate from public `/mcp-docs`: PASS
- API keys are random, one-time-shown and stored as SHA-256 hashes plus non-secret prefixes: PASS by source validation
- Key revocation and server-side scope checks exist: PASS
- Submission authority is separate (`applications:submit`) and requires explicit key-creation opt-in: PASS
- REST/MCP submission also requires explicit confirmation, ownership, passed resume truth QA and zero unresolved questions: PASS
- Per-key API/MCP rate-limit seam and usage metering exist: PASS
- TypeScript and Python SDK templates export with the standalone product: PASS
- Raw TypeScript/Python/OpenAI remote-MCP examples export: PASS
- `public/llms.txt`, `public/openapi.json`, agent docs and MCP Registry metadata export: PASS
- Public `/agents`, `/api`, `/mcp-docs`, `/job-search-api`, `/resume-tailoring-api` and `/ai-job-application-agent` routes are present: PASS by TS/source validation
- Generated job product has no Turborepo/workspace coupling: PASS
- Fresh standalone export TS/TSX syntax transpilation: PASS (63 files)
- Python SDK/example syntax: PASS
- Core + Job + Agent D1 migrations execute on a fresh SQLite DB: PASS
- OpenAPI and MCP Registry JSON templates parse: PASS

The package deliberately uses scoped API-key authentication for the initial developer launch. Broad public/marketplace MCP authorization still requires the OAuth 2.1 migration described in `blueprints/job-saas/AGENT_DISTRIBUTION.md`, plus live client/registry testing.

The installed dependency graph is captured in the root `package-lock.json` and passed the repository-wide build, type, unit-test, and audit checks listed above.

## Employable-style Job SaaS trust layer

- Workday is a first-class `NormalizedJob` source through the browser-discovery provider seam: PASS by source validation
- New 3-step onboarding is present: CV upload -> explicit fact verification -> search preferences: PASS by TS syntax validation
- Successful browser submissions receive a private proof-upload URL: PASS
- Proof uploads accept only PNG/JPEG/WebP, cap at 5 MB, store privately in R2, and are user-scoped on retrieval: PASS by source validation
- Missing proof cannot trigger automatic resubmission; submitted state records `proof_status=missing`: PASS by queue source validation
- Application tracker exposes captured vs missing proof state: PASS by TS syntax validation
- Outcome endpoint records viewed/interview/offer/rejected/withdrawn learning signals: PASS by source validation
- Core + Job + Agent + Employable D1 migrations execute on a fresh SQLite database: PASS
- Fresh Job SaaS blueprint TS/TSX transpilation after changes: PASS (37 files)
- Fresh standalone export includes migration 0004, browser contract, Employable product reference and Job prompts 22-24: PASS
