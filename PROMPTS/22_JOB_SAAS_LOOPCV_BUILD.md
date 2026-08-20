# Prompt 22 — Build/Finish the LoopCV-Class Job SaaS

You are working in a standalone app generated with the App Factory Job SaaS Blueprint.

Read first:
- `JOB_SAAS.md`
- `PRODUCT_SPEC.md`
- `ARCHITECTURE.md`
- `DATA_SOURCES.md`
- `AUTOPILOT.md`
- `EMPLOYABLE_PRODUCT_REFERENCE.md`
- `BROWSER_AUTOMATION_CONTRACT.md`
- `SECURITY.md`
- `COSTS.md`
- `AGENTS.md`

The required loop is:

`discover -> normalize -> dedupe -> deterministic filter -> AI score -> tailor CV -> truth check -> answer/flag questions -> review/autopilot gate -> queue -> submit provider -> track -> learn -> repeat`

Do not redesign this into a generic job board.

## Build priorities

1. Make the current end-to-end vertical slice work locally.
2. Preserve Career Brain provenance and truth checking.
3. Keep LinkedIn as a discovery signal through user URL/job-alert ingestion; do not add unauthorized LinkedIn scraping as a core dependency.
4. Keep ATS source adapters isolated behind `NormalizedJob`; treat Workday as a first-class browser-backed source.
5. Use `gpt-5.6-luna` by default for high-volume AI calls through the Responses API with `store:false`.
6. Keep browser submission behind `APPLICATION_AUTOMATION_ENDPOINT`; use Cloudflare Browser Run/Playwright or an approved equivalent in production.
7. Default to review-first submission. Autopilot must pass every guardrail in `AUTOPILOT.md`. Capture private proof of submission whenever the browser reaches a success state.
8. Optimize for interviews/offers, not application count.
9. Ensure all pages and application flows are fully mobile optimized.
10. Run typecheck, build, migrations, tests and security checks; fix failures rather than stopping after analysis.

When a missing provider/API prevents live submission, implement a clean provider seam and a deterministic mock, then continue building the rest of the product.


Global-first: support job seekers and job markets worldwide. Do not hard-code a country, city, language, currency, or work-authorization regime into the default UX.
