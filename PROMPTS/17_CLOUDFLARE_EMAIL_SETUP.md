# Prompt — Cloudflare Email Service Setup

Read `AGENTS.md`, `SECURITY.md`, `COSTS.md`, `PRODUCT_SPEC.md`, and `integrations/cloudflare-email/README.md`.

Implement transactional email for this product using **Cloudflare Email Service as the default provider**.

Requirements:

- identify the product sender domain and sender addresses;
- configure/document the `EMAIL` Worker `send_email` binding;
- route feature code through the shared email adapter, not direct binding calls scattered across the app;
- wire Better Auth verification/reset/magic-link callbacks that the product actually uses;
- implement the minimum required templates (verification, reset, welcome, billing/usage alerts as applicable);
- rate-limit resend/reset endpoints;
- do not log full verification/reset links or tokens;
- handle Cloudflare Email Service send errors cleanly;
- if inbound support/contact email is needed, configure/document Email Routing and treat inbound content as untrusted;
- add tests or smoke checks for critical auth-email flows;
- update `COSTS.md` if expected outbound volume materially exceeds the included allowance;
- do not add Resend, SendGrid, Mailgun, Postmark, or another email provider unless `PRODUCT_SPEC.md` explicitly documents why Cloudflare Email Service is insufficient.

Before claiming launch readiness, re-check Cloudflare Email Service's current Beta status, limits, pricing, and domain requirements in the official Cloudflare docs.
