export interface Env extends CloudflareBindings {
  BETTER_AUTH_SECRET: string;
  ADMIN_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_PRO_MONTHLY?: string;
  STRIPE_PRICE_PRO_ANNUAL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  /** Demo only: "true" activates plans without Stripe when APP_ENV is development or preview and Stripe is not configured. */
  DEMO_CHECKOUT?: string;
}
