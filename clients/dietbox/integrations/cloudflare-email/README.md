# Cloudflare Email Service Integration

Cloudflare Email Service is the **default transactional-email provider** for App Factory products.

Use it for:

- email verification;
- password reset and magic-link flows;
- welcome/account emails;
- billing and usage notifications;
- operational alerts;
- optional inbound addresses such as `support@yourdomain.com`.

Do not add Resend, SendGrid, Mailgun, Postmark, or another email provider unless a product has a measured requirement that Cloudflare Email Service does not satisfy.

## Current platform boundary

As of August 2026, Cloudflare Email Sending is marked **Beta** and requires Workers Paid for arbitrary outbound recipients. Email Routing is available for inbound mail.

Current Cloudflare pricing documented for Workers Paid:

- 3,000 outbound emails included per account per month;
- then $0.35 per 1,000 outbound emails;
- inbound Email Routing is unlimited;
- sends to verified destination addresses are free.

Always verify current pricing/limits before launch.

## 1. Onboard the domain

The product domain must use Cloudflare DNS.

In Cloudflare Dashboard:

1. Compute > Email Service > Email Sending.
2. Onboard the product domain.
3. Let Cloudflare add/verify the required bounce MX, SPF, DKIM, and DMARC records.
4. Wait until the domain is ready before enabling production auth email.

## 2. Add the Worker binding

Merge `wrangler.example.jsonc` into the product Worker configuration.

The Worker receives an `EMAIL` binding. Product features should not call that binding directly. Use `email.ts` as the shared adapter so provider-specific code stays in one place.

Example:

```ts
import { createCloudflareEmailService } from "./integrations/cloudflare-email/email";
import { verificationEmail } from "./integrations/cloudflare-email/templates";

const email = createCloudflareEmailService({
  binding: env.EMAIL,
  from: { email: "noreply@yourdomain.com", name: "Your App" },
  replyTo: "support@yourdomain.com",
});

await email.sendTemplate({
  to: user.email,
  template: verificationEmail({ appName: "Your App", verifyUrl }),
});
```

## 3. Better Auth integration

Wire Better Auth verification/reset callbacks to the shared email service. Never put verification tokens in logs. Generate links server-side and send them through the Worker binding.

At minimum test:

- new-user verification;
- expired/used verification link;
- password reset;
- password-reset replay protection;
- resend throttling;
- account enumeration resistance where appropriate.

## 4. Inbound support routing

If the product needs `support@`, `contact@`, or agent-email workflows, configure Email Routing and route the address either:

- directly to a verified destination mailbox; or
- to a Worker `email()` handler.

`inbound.ts` contains the minimal forwarding pattern. Treat inbound email body/attachments as untrusted input. Do not feed inbound email directly into tool-using agents without prompt-injection and authorization controls.

## 5. Reliability rules

- Email failure must not corrupt user/account state.
- Auth flows should offer resend with throttling.
- Record message IDs and operational status where useful, but do not log full auth links or secrets.
- Handle suppression/bounce/rate-limit errors gracefully.
- Queue non-critical bulk notifications instead of delaying the user request.
- Keep sender identities product-specific and domain-verified.

## 6. When to use another provider

Only reconsider the default if the product needs capabilities not adequately covered by Cloudflare Email Service, such as a specific marketing-campaign workflow, advanced deliverability tooling, or a contractual/compliance requirement.

Document the reason and cost impact in `PRODUCT_SPEC.md` and `COSTS.md` before adding another provider.
