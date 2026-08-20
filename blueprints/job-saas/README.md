# Job SaaS Blueprint

This blueprint turns the generic App Factory starter into a LoopCV-class job-search/application product without making LinkedIn scraping a hard dependency.

## Product loop

`discover -> normalize -> deduplicate -> deterministic filter -> AI score -> tailor resume -> truth check -> answer questions -> review/autopilot gate -> queue -> submit adapter -> track -> learn -> repeat`

## Discovery sources included

- Greenhouse public Job Board API
- Lever public Postings API
- Ashby public Job Postings API
- SmartRecruiters public postings API
- Workday public candidate sites through the browser-discovery provider seam
- user-pasted job URLs
- LinkedIn job-alert email/url ingestion as discovery signals (no server-side LinkedIn scraping)
- provider seam for Workable, company career sites, licensed job feeds, and Firecrawl/web discovery

## Application strategy

Employer-side submission APIs generally require employer credentials. The default application path is therefore the employer-hosted application form plus a browser automation provider. Official application APIs may be used only when the required employer/partner authorization is available.

## Generate a standalone product

From the App Factory root:

```bash
npm run new-job-saas -- \
  --name="ApplyFlow" \
  --slug="applyflow" \
  --description="Your AI job-search and application agent" \
  --destination="../applyflow"
```

Then:

```bash
cd ../applyflow
npm install
npm run check
npm run db:migrate:local
npm run dev
```

Read `JOB_SAAS.md`, `EMPLOYABLE_PRODUCT_REFERENCE.md`, `BROWSER_AUTOMATION_CONTRACT.md`, and `PRODUCT_SPEC.md` before implementing production credentials or turning on auto-submit.

## Agent distribution

The generated product also exposes a user-scoped REST API at `/v1` and a remote MCP endpoint at `/mcp`. Users create hashed, scoped API keys from `/app/developer`. Read `AGENT_DISTRIBUTION.md` before publishing the MCP endpoint or registry metadata.

## Agent developer assets

The job blueprint also includes scoped REST `/v1`, remote MCP `/mcp`, a Developer API-key screen, `public/openapi.json`, `public/llms.txt`, TypeScript/Python SDK templates, client examples and MCP Registry metadata. Read `AGENT_DISTRIBUTION.md`.


## Global-first

The default product serves job seekers worldwide. Job sources, search rules, currencies, locations, languages, work authorization, date/time formatting, and ATS coverage must not assume one country or region. Regional optimization is an explicit configuration layer.
