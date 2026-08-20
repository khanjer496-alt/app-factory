# Prompt — Prepare and Deploy to Cloudflare

Read `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `COSTS.md`, `RELEASE_CHECKLIST.md`, and `PRODUCT_SPEC.md`.

Prepare this app for Cloudflare deployment using the repository's existing architecture.

Checklist:

- validate Worker bindings;
- create/document required D1 databases;
- apply migrations in correct order;
- create/document R2 buckets;
- configure Queues/Workflows/Cron only where used;
- enumerate required secrets and environment variables;
- keep secrets out of source/config committed to Git;
- configure production URLs/CORS/callback URLs correctly;
- verify private files remain private;
- verify auth callback/origin settings;
- verify billing webhooks if billing is enabled;
- if email is enabled, verify Cloudflare Email Service domain onboarding, SPF/DKIM/DMARC, the Worker `EMAIL` binding, verification/reset delivery, and any inbound routing rules;
- verify rate limits and usage caps;
- run typecheck/tests/build/security checks.

If real Cloudflare credentials are connected and the user asked for deployment, deploy and smoke-test the production URL.

If credentials are not available, do not pretend deployment succeeded. Produce exact commands and required values instead.

Report estimated baseline monthly infrastructure cost and primary variable cost drivers.
