# Agent Distribution

The factory supports a Postiz-style strategy: build the product capability once, then expose it to humans, developers and AI agents.

The concrete implementation lives in `blueprints/job-saas/`:

- consumer web/mobile experience;
- scoped REST API at `/v1`;
- remote MCP endpoint at `/mcp`;
- public docs at `/agents`, `/api`, `/mcp-docs` and SEO landing pages;
- developer API-key console;
- TypeScript, Python and OpenAI remote-MCP examples;
- MCP Registry metadata template.

The initial developer path uses one-time-shown, hashed API keys. Read/preparation scopes are separate from application submission. Submission also remains subject to the same truth, unresolved-question, ownership, confirmation and daily-limit guardrails as the consumer app.

For broad public MCP distribution, migrate to the OAuth 2.1 protected-resource flow documented in `blueprints/job-saas/AGENT_DISTRIBUTION.md` before asking end users to authorize third-party agent clients at scale.
