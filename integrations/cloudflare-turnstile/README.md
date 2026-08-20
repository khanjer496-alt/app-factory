# Cloudflare Turnstile Integration

Turnstile is the App Factory's **default bot/abuse challenge** for public forms and abuse-sensitive actions. It is a Cloudflare service, not an extra SaaS vendor.

Use it selectively for:

- sign-up;
- password-reset / verification resend when abuse is plausible;
- suspicious login flows;
- public contact/lead forms;
- anonymous or trial AI actions that could create meaningful cost.

Do not challenge every authenticated request by default. Use rate limits, entitlements and server-side authorization for normal product traffic.

## Mandatory architecture

```text
Browser widget
   ↓ generates short-lived token
Worker/API
   ↓ Siteverify
Cloudflare Turnstile
   ↓ valid / invalid
Continue or reject action
```

**Server-side Siteverify is mandatory.** A client-only widget is not protection. Turnstile tokens expire after five minutes and are single-use.

## Setup

1. Create a Turnstile widget for the product hostnames in Cloudflare (or use the current Wrangler/Turnstile setup flow).
2. Put the **sitekey** in public frontend configuration.
3. Store the **secret key** as a Worker secret, e.g. `TURNSTILE_SECRET_KEY`.
4. Send the Turnstile token with the protected form/action.
5. Validate it server-side with `turnstile.ts` before performing the action.
6. When configured, validate the returned hostname/action too.

Example Worker usage:

```ts
const result = await verifyTurnstile({
  token: body.turnstileToken,
  secretKey: env.TURNSTILE_SECRET_KEY,
  remoteIp: request.headers.get("CF-Connecting-IP") ?? undefined,
  expectedHostname: "app.example.com",
  expectedAction: "signup",
});

if (!result.success) {
  return new Response("Verification failed", { status: 400 });
}
```

## Better Auth

Better Auth remains the authentication/session library. Turnstile is an abuse-control layer around exposed auth flows; it does not replace identity/session management.

If the Better Auth CAPTCHA plugin matches the installed Better Auth version and desired flow, it may be used. Otherwise validate Turnstile in the Worker boundary before the sensitive auth action. Do not duplicate both approaches for the same endpoint.

## Security rules

- Never expose the Turnstile secret key to browser code.
- Never trust a frontend `success` flag; validate the token with Siteverify.
- Keep normal server-side rate limiting even with Turnstile.
- Do not log full challenge tokens.
- Use Cloudflare's testing sitekey/secret in automated/local tests rather than production keys.
- Decide fail-open vs fail-closed explicitly for temporary Siteverify outages. Signup/payment/expensive anonymous operations should generally fail safely rather than silently bypass protection.
