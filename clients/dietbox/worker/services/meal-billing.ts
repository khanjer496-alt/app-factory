import type Stripe from "stripe";
import type { Env } from "../env";
import { stripeClient } from "./stripe";
import { audit } from "./audit";
import { track } from "./analytics";
import { sendRenewalFailed } from "./email";
import { activateOrder, appendCycle, programName, type OrderInput, type OrderRow } from "./plans";
import { renewalChargeAt } from "../../shared/renewal";

// All Stripe calls for meal plans live here (AGENTS.md: billing stays behind the billing service).
// A plan is a Stripe subscription billed every `weeks` weeks. The next charge date is moved with the
// subscription's trial_end so it always lands RENEWAL_LEAD_DAYS before the next cycle's first delivery.

const KIND = "meal_plan";
const MIN = 60_000;

/** stripe: real payments · demo: local/preview without Stripe (explicit opt-in) · off: checkout unavailable. */
export function billingMode(env: Env): "stripe" | "demo" | "off" {
  if (env.STRIPE_SECRET_KEY) return "stripe";
  if ((env.APP_ENV === "development" || env.APP_ENV === "preview") && env.DEMO_CHECKOUT === "true") return "demo";
  return "off";
}

export async function createPlanCheckout(env: Env, user: { id: string; email: string }, orderId: string, input: OrderInput, totalFils: number) {
  const name = `Dietbox ${programName(input.program)} · every ${input.weeks} week${input.weeks > 1 ? "s" : ""}`;
  const metadata = { kind: KIND, orderId, userId: user.id };
  const session = await stripeClient(env).checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "aed",
        unit_amount: totalFils,
        recurring: { interval: "week", interval_count: input.weeks },
        product_data: { name, description: `${input.mealsPerDay} meals/day · ${input.daysPerWeek} days/week · first delivery ${input.startDate}` },
      },
    }],
    metadata,
    subscription_data: { metadata, description: name },
    success_url: `${env.APP_URL}/app?checkout=success`,
    cancel_url: `${env.APP_URL}/start?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Payment provider did not return a checkout URL");
  await env.DB.prepare("UPDATE plan_orders SET stripe_session_id=? WHERE id=? AND user_id=?").bind(session.id, orderId, user.id).run();
  return session.url;
}

export interface ChargeRow {
  id: string; status: string; auto_renew: number; billing_status: string; days_per_week: number;
  next_charge_at: number | null; stripe_subscription_id: string | null; last: string | null;
}
/** Every renewing order with its last delivery date, in one query (the daily job stays within D1's per-run query limit). */
export const CHARGE_ROWS = `SELECT o.id,o.status,o.auto_renew,o.billing_status,o.days_per_week,o.next_charge_at,o.stripe_subscription_id,
  (SELECT MAX(d.date) FROM delivery_days d WHERE d.order_id=o.id) AS last FROM plan_orders o`;

/**
 * Aligns the next renewal charge with the delivery calendar (after activation, renewals, skips and pauses).
 * Leaves a charge that is due or in flight alone: the invoice webhook (or the demo job) moves it on.
 * Writes only when the date actually changes.
 */
export async function alignCharge(env: Env, o: ChargeRow, now = Date.now()) {
  if (o.status !== "active" || !o.auto_renew || o.billing_status !== "active" || !o.last) return null;
  if (o.next_charge_at && o.next_charge_at <= now + 10 * MIN) return o.next_charge_at;
  const at = renewalChargeAt(o.last, o.days_per_week, now);
  if (o.next_charge_at && Math.abs(o.next_charge_at - at) < MIN) return o.next_charge_at;
  if (o.stripe_subscription_id) {
    await stripeClient(env).subscriptions.update(o.stripe_subscription_id, { trial_end: Math.floor(at / 1000), proration_behavior: "none" });
  }
  await env.DB.prepare("UPDATE plan_orders SET next_charge_at=?,updated_at=? WHERE id=?").bind(at, Date.now(), o.id).run();
  return at;
}

export async function syncNextCharge(env: Env, orderId: string, now = Date.now()) {
  const row = await env.DB.prepare(`${CHARGE_ROWS} WHERE o.id=?`).bind(orderId).first<ChargeRow>();
  return row ? alignCharge(env, row, now) : null;
}

/** Customer or admin turns renewal on/off. Off stops the next charge; the paid deliveries still arrive. */
export async function setAutoRenew(env: Env, order: OrderRow, on: boolean, actorId: string) {
  if (order.status !== "active" || !["active", "past_due"].includes(order.billing_status)) return "This plan doesn't renew. Start a new plan when it ends.";
  if (Boolean(order.auto_renew) === on) return null;
  if (!on && order.billing_status === "past_due") {
    // Stop retrying the failed renewal: cancel now and void its open invoice.
    if (order.stripe_subscription_id) {
      const stripe = stripeClient(env);
      const sub = await stripe.subscriptions.cancel(order.stripe_subscription_id);
      const invoiceId = typeof sub.latest_invoice === "string" ? sub.latest_invoice : sub.latest_invoice?.id;
      if (invoiceId) {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        if (invoice.status === "open") await stripe.invoices.voidInvoice(invoiceId);
      }
    }
    await env.DB.prepare("UPDATE plan_orders SET auto_renew=0,billing_status='canceled',next_charge_at=NULL,updated_at=? WHERE id=?").bind(Date.now(), order.id).run();
  } else {
    if (on && order.billing_status !== "active") return "Update your card to turn renewal back on.";
    if (order.stripe_subscription_id) await stripeClient(env).subscriptions.update(order.stripe_subscription_id, { cancel_at_period_end: !on });
    await env.DB.prepare("UPDATE plan_orders SET auto_renew=?,updated_at=? WHERE id=?").bind(on ? 1 : 0, Date.now(), order.id).run();
  }
  await audit(env, { actor: actorId, action: on ? "plan_order.renewal.on" : "plan_order.renewal.off", resourceType: "plan_order", resourceId: order.id });
  track(env, { actor: order.user_id, event: on ? "renewal_resumed" : "renewal_cancelled", feature: order.program });
  if (on) await syncNextCharge(env, order.id);
  return null;
}

/** Stripe-hosted page to update the card, see invoices or cancel. Only for plans paid through Stripe. */
export async function billingPortalUrl(env: Env, order: OrderRow) {
  if (!order.stripe_customer_id || billingMode(env) !== "stripe") return null;
  const portal = await stripeClient(env).billingPortal.sessions.create({ customer: order.stripe_customer_id, return_url: `${env.APP_URL}/app` });
  return portal.url;
}

/** Account deletion: stop every renewing meal-plan subscription so a deleted customer is never charged again. */
export async function cancelPlanSubscriptions(env: Env, userId: string) {
  const subs = await env.DB.prepare("SELECT id,stripe_subscription_id FROM plan_orders WHERE user_id=? AND stripe_subscription_id IS NOT NULL AND billing_status IN ('active','past_due')")
    .bind(userId).all<{ id: string; stripe_subscription_id: string }>();
  for (const s of subs.results) {
    if (env.STRIPE_SECRET_KEY) await stripeClient(env).subscriptions.cancel(s.stripe_subscription_id);
    await env.DB.prepare("UPDATE plan_orders SET auto_renew=0,billing_status='canceled',next_charge_at=NULL,updated_at=? WHERE id=?").bind(Date.now(), s.id).run();
  }
}

/** Records that a notification went out; false when it was already sent. */
export async function claimNotification(env: Env, kind: string, ref: string, userId: string) {
  const r = await env.DB.prepare("INSERT OR IGNORE INTO notifications_sent(kind,ref,user_id,created_at) VALUES(?,?,?,?)").bind(kind, ref, userId, Date.now()).run();
  return (r.meta?.changes || 0) > 0;
}

const idOf = (value: string | { id: string } | null | undefined) => (typeof value === "string" ? value : value?.id) || null;
const orderBySubscription = (env: Env, subscriptionId: string) =>
  env.DB.prepare("SELECT * FROM plan_orders WHERE stripe_subscription_id=?").bind(subscriptionId).first<OrderRow>();

/**
 * Handles the Stripe events that belong to meal plans. Returns false for anything else so the starter's
 * generic billing handler can process it. Throws on mismatches so the event is marked failed and retried.
 */
export async function handleMealPlanEvent(env: Env, event: Stripe.Event, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.metadata?.kind !== KIND) return false;
      const orderId = s.metadata.orderId;
      const order = orderId ? await env.DB.prepare("SELECT user_id,amount_fils,currency FROM plan_orders WHERE id=?").bind(orderId).first<{ user_id: string; amount_fils: number; currency: string }>() : null;
      const subscriptionId = idOf(s.subscription);
      // Activate only when the paid session matches the order we priced server-side.
      if (!order || s.payment_status !== "paid" || s.client_reference_id !== order.user_id || s.amount_total !== order.amount_fils || s.currency !== order.currency) {
        throw new Error(`Meal-plan checkout ${s.id} did not match order ${orderId || "(missing)"}`);
      }
      // Sessions created before auto-renewal were one-off payments.
      await activateOrder(env, orderId!, s.id, s.mode === "subscription" && subscriptionId
        ? { renews: true, subscriptionId, customerId: idOf(s.customer) }
        : { renews: false });
      await syncNextCharge(env, orderId!);
      return true;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const details = invoice.parent?.subscription_details;
      const subscriptionId = idOf(details?.subscription);
      const ours = details?.metadata?.kind === KIND;
      if (!subscriptionId) return false;
      const order = await orderBySubscription(env, subscriptionId);
      if (event.type === "invoice.paid") {
        // The first invoice is handled by checkout.session.completed; $0 invoices come from moving the charge date.
        if (invoice.billing_reason !== "subscription_cycle") return ours || !!order;
        if (!order) {
          if (ours) throw new Error(`No meal plan for subscription ${subscriptionId}`);
          return false;
        }
        if (invoice.amount_paid !== order.amount_fils || invoice.currency !== order.currency) {
          throw new Error(`Renewal invoice ${invoice.id} (${invoice.amount_paid} ${invoice.currency}) does not match order ${order.id}`);
        }
        await appendCycle(env, order, invoice.id!, invoice.amount_paid);
        await syncNextCharge(env, order.id);
        return true;
      }
      if (!order) return ours;
      await env.DB.prepare("UPDATE plan_orders SET billing_status='past_due',updated_at=? WHERE id=? AND billing_status='active'").bind(Date.now(), order.id).run();
      if (await claimNotification(env, "payment_failed", invoice.id!, order.user_id)) {
        const user = await env.DB.prepare('SELECT email FROM "user" WHERE id=?').bind(order.user_id).first<{ email: string }>();
        if (user) ctx.waitUntil(sendRenewalFailed(env, user.email));
      }
      track(env, { actor: order.user_id, event: "renewal_payment_failed", feature: order.program });
      return true;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      if (sub.metadata?.kind !== KIND) return false;
      const order = await orderBySubscription(env, sub.id);
      if (!order) return true;
      if (event.type === "customer.subscription.deleted" || ["canceled", "incomplete_expired"].includes(sub.status)) {
        await env.DB.prepare("UPDATE plan_orders SET auto_renew=0,billing_status='canceled',next_charge_at=NULL,updated_at=? WHERE id=?").bind(Date.now(), order.id).run();
        return true;
      }
      // Mirrors changes made in the Stripe customer portal or dashboard.
      const autoRenew = sub.cancel_at_period_end || sub.cancel_at ? 0 : 1;
      const status = ["past_due", "unpaid"].includes(sub.status) ? "past_due" : "active";
      await env.DB.prepare("UPDATE plan_orders SET auto_renew=?,billing_status=?,updated_at=? WHERE id=? AND billing_status<>'canceled'").bind(autoRenew, status, Date.now(), order.id).run();
      return true;
    }
    default:
      return false;
  }
}
