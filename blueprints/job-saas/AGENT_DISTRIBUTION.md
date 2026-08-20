# Agent Distribution

The consumer web app is one client of the same job-search/application engine. External agents can connect through REST or MCP.

## Positioning

Consumer: **Your AI job-search agent.**

Developer/agent: **Job-search and application infrastructure for AI agents.**

## Interfaces

- REST: `https://YOUR_DOMAIN/v1`
- Remote MCP: `https://YOUR_DOMAIN/mcp`
- Developer console: `/app/developer`
- Public docs: `/agents`, `/api`, `/mcp-docs`
- OpenAPI template: `/openapi.json` (replace `YOUR_DOMAIN` before launch)
- Lightweight SDK templates: `sdk/typescript/` and `sdk/python/`

## MCP tools

- `search_jobs`
- `score_job`
- `tailor_resume`
- `prepare_application`
- `list_applications`
- `get_application_status`
- `submit_application`

Submission is intentionally harder than reading/preparing. It requires an API key with `applications:submit`, an explicit `confirm=true`, a passed resume truth check, and no unresolved questions.

## Authentication

The included v1 launch path uses user-created bearer API keys, stored only as SHA-256 hashes in D1. The complete key is shown once.

For a public consumer-grade MCP connection flow, migrate the MCP auth seam to OAuth 2.1 before broad marketplace distribution. The current MCP specification defines OAuth discovery/protected-resource metadata for HTTP authorization. Better Auth's MCP/OAuth Provider plugins can provide that path, but the MCP plugin is currently on Better Auth's v1.7 beta line. Keep API-key mode until you deliberately adopt and test that beta or its stable successor.

## SDKs and quickstarts

The blueprint ships tiny TypeScript and Python SDK wrappers plus raw REST and OpenAI remote-MCP examples. Keep the SDKs thin: they should wrap the public contract, not import internal Worker/business logic. Before publishing them to npm/PyPI, rename them to the final product brand, add semantic versioning and run contract tests against staging.

## Registry

`agent/server.json.template` follows the Official MCP Registry remote-server shape. Replace `YOUR_DOMAIN`, verify the namespace/domain, validate the file, then publish when the MCP endpoint is publicly reachable.

## Distribution content

Build public pages and content around high-intent queries:

- job search API for AI agents
- job application MCP server
- resume tailoring API
- AI job application agent
- Greenhouse job search API for agents
- Lever job application automation
- career agent API

Do not claim official ATS partnerships unless one exists.
