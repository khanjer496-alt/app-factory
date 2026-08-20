# Job Engine

The code here is intentionally split into:

- `sources/`: job discovery adapters only;
- `ai/`: model calls for scoring/tailoring/truth checks;
- `rules.ts`: deterministic filtering;
- `application-guard.ts`: auto-submit policy;
- `state.ts`: application state machine;
- `queue.ts`: controlled submission execution;
- `linkedin.ts`: LinkedIn URL/email signal ingestion without server scraping;
- `routes.ts`: authenticated product APIs.

A real browser submission service should accept the normalized application task at `APPLICATION_AUTOMATION_ENDPOINT`. Prefer Cloudflare Browser Run/Playwright or another explicitly configured browser worker. It must never receive a user's entire Career Brain when only a small set of application fields is needed.
