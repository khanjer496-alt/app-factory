import Stripe from "stripe";
import type { Env } from "../env";

export function stripeClient(env: Env) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
}

export function resolvePrice(env: Env, plan: string): string {
  const price = plan === "pro-monthly" ? env.STRIPE_PRICE_PRO_MONTHLY : plan === "pro-annual" ? env.STRIPE_PRICE_PRO_ANNUAL : undefined;
  if (!price) throw new Error("Unknown or unconfigured plan");
  return price;
}

export async function verifyStripeWebhook(env: Env, request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook secret is not configured");
  const signature = request.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing Stripe signature");
  const body = await request.text();
  return stripeClient(env).webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider());
}
