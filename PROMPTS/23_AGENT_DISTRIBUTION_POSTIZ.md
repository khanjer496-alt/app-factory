# Prompt 23 - Agent Distribution / Postiz Playbook

Read `AGENTS.md`, the product's `VISION.md` if present, `JOB_SAAS.md`, and `AGENT_DISTRIBUTION.md`.

Implement or review the product as **job-search/application infrastructure for AI agents**, not merely a consumer UI with an agent badge.

Requirements:
1. Consumer UI and external agents use the same core services.
2. Keep `/v1` REST and `/mcp` MCP surfaces thin and user-scoped.
3. Keep API keys hashed at rest and scope-limited.
4. Submission authority must be separate from read/prepare authority.
5. External-agent submission requires explicit confirmation plus server-side truth/question guardrails.
6. Maintain public `/agents`, `/api`, `/mcp-docs` pages while reserving `/mcp` for the protocol endpoint and agent-focused SEO pages.
7. Maintain TypeScript, Python, and remote-MCP examples.
8. Maintain Official MCP Registry metadata template and launch checklist.
9. Do not claim official job-board/ATS partnerships without evidence.
10. Treat agent-distribution traffic and conversion as a separate acquisition channel in analytics.

Before calling the work complete, verify:
- a read-only key can list jobs through REST and MCP;
- a key without `applications:submit` cannot submit;
- revoked keys fail;
- the full key is never stored in D1 or logged;
- MCP and REST both enforce user ownership;
- public documentation reflects the actual exposed tools.


Global-first: support job seekers and job markets worldwide. Do not hard-code a country, city, language, currency, or work-authorization regime into the default UX.
