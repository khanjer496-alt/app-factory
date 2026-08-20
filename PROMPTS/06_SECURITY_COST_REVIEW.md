# Prompt — Production Security + Cost Review

Act as the production reviewer for this repository.

Read:

- `SECURITY.md`
- `COSTS.md`
- `RELEASE_CHECKLIST.md`
- `AGENTS.md`
- `PRODUCT_SPEC.md`
- `VISION.md` if present

Inspect the actual implementation, not just documentation.

Review at minimum:

- exposed secrets/client bundles;
- authentication/session behavior;
- object ownership/IDOR risks;
- authorization scopes;
- D1 query ownership constraints;
- input validation;
- unsafe file uploads and private R2 access;
- webhook verification;
- billing/price trust boundaries;
- API/MCP rate limiting;
- AI/model-output validation;
- prompt-injection/tool-permission boundaries;
- high-impact agent actions;
- audit logs;
- dependency vulnerabilities;
- PII retention/deletion/export;
- expensive operations that can be abused;
- unmetered AI/API/browser usage;
- unexpected paid-service dependencies.

Then:

1. fix issues that can be fixed safely;
2. run `./scripts/security-check.sh` plus available tests/typecheck/build;
3. update `RELEASE_CHECKLIST.md` status where appropriate;
4. produce a concise blocker list for anything that requires credentials, product-owner decisions, legal review, or provider approval.

Do not call the app production-ready while high-severity blockers remain.
