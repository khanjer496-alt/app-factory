# Job Data Sources

## Tier 1 — implemented adapters

### Greenhouse

Public GET Job Board data does not require authentication. Store a board token per source and fetch published jobs.

### Lever

Published jobs can be read from the public Postings API by site identifier. Keep the hosted `applyUrl` as the canonical application target.

### Ashby

Published jobs can be read from the public job-board endpoint by job-board name.

### SmartRecruiters

Public company postings can be fetched by company identifier.

### Workday

Workday is a first-class source, but the blueprint does not pretend the product has employer-side Workday credentials or a universal public employer API. Configure `JOB_DISCOVERY_AUTOMATION_ENDPOINT` and use the included Workday adapter to resolve public candidate-site jobs through Browser Run/Playwright (or another approved browser provider), then normalize them into `NormalizedJob`.

## LinkedIn

Use LinkedIn as an ingestion/discovery signal through job-alert emails, user-pasted URLs, and licensed/approved access if obtained. Do not require unauthorized server-side scraping for the core product.

## Tier 2 — provider seams

- Workable public careers/job feeds
- company career sites
- licensed aggregators
- Firecrawl/web discovery
- user-uploaded/forwarded job alerts from other boards

Every provider must return the same normalized `NormalizedJob` object. This keeps source expansion independent of scoring/application logic.


## Global-first

The default product serves job seekers worldwide. Job sources, search rules, currencies, locations, languages, work authorization, date/time formatting, and ATS coverage must not assume one country or region. Regional optimization is an explicit configuration layer.
