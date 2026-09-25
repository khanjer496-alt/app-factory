# Environments

Use separate data/resources for local, preview and production. Do not point preview deployments at the production D1 database or R2 bucket.

## Local

- local D1 emulation via Wrangler
- local R2 emulation through the Vite/Workers development runtime
- `.dev.vars` for Worker secrets
- `.env.local` for browser-public Vite variables
- Stripe test mode only

## Preview

Create dedicated Cloudflare resources such as:

```text
my-product-preview-db
my-product-preview-files
my_product_preview_events
```

Use a preview-specific Better Auth secret and Stripe test credentials. Use a preview URL in both `APP_URL` and `BETTER_AUTH_URL`.

## Production

Create dedicated production D1/R2 resources. Use Stripe live-mode credentials only after checkout/webhook flows pass in test mode. Onboard the production sending domain to Cloudflare Email Service and configure Turnstile for the production hostname.

## Deployment rule

The checked-in `wrangler.jsonc` is a starter configuration and contains placeholder resource IDs/URLs. Before production, replace them deliberately or maintain a production-specific Wrangler configuration in deployment automation.

Never store production secrets in Git, `wrangler.jsonc`, Vite variables, screenshots, issue comments or logs.
