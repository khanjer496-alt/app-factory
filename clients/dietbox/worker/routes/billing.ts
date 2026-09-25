import type Stripe from "stripe";
import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";
import { resolvePrice, stripeClient, verifyStripeWebhook } from "../services/stripe";
import { sendPaymentFailed } from "../services/email";
import { track } from "../services/analytics";
import { productConfig } from "../../product.config";
import { handleMealPlanEvent } from "../services/meal-billing";

export const billing = new Hono<{ Bindings: Env; Variables: { session: any } }>();

billing.post("/checkout", requireAuth, async (c) => {
  if (!productConfig.features.billing || !productConfig.billing.enabled) return c.json({ error: "Billing is disabled" }, 404);
  const { plan } = await c.req.json<{ plan: string }>();
  const user = c.get("session").user;
  const stripe = stripeClient(c.env);
  let customer = await c.env.DB.prepare("SELECT stripe_customer_id FROM billing_customers WHERE user_id=?").bind(user.id).first<{ stripe_customer_id:string }>();
  let customerId = customer?.stripe_customer_id;
  if (!customerId) {
    const created = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
    customerId = created.id;
    await c.env.DB.prepare("INSERT INTO billing_customers(user_id,stripe_customer_id,created_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET stripe_customer_id=excluded.stripe_customer_id").bind(user.id, customerId, Date.now()).run();
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: resolvePrice(c.env, plan), quantity: 1 }],
    success_url: `${c.env.APP_URL}/app?checkout=success`,
    cancel_url: `${c.env.APP_URL}/pricing?checkout=cancelled`,
    client_reference_id: user.id,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });
  if (!session.url) return c.json({ error: "Stripe did not return a checkout URL" }, 502);
  track(c.env,{actor:user.id,event:"checkout_started",feature:plan});
  return c.json({ url: session.url });
});

billing.post("/portal", requireAuth, async (c) => {
  if (!productConfig.features.billing || !productConfig.billing.enabled) return c.json({ error: "Billing is disabled" }, 404);
  const user = c.get("session").user;
  const row = await c.env.DB.prepare("SELECT stripe_customer_id FROM billing_customers WHERE user_id=?").bind(user.id).first<{stripe_customer_id:string}>();
  if (!row) return c.json({ error: "No Stripe customer exists yet" }, 404);
  const portal = await stripeClient(c.env).billingPortal.sessions.create({ customer: row.stripe_customer_id, return_url: `${c.env.APP_URL}/app` });
  return c.json({ url: portal.url });
});

billing.get("/status", requireAuth, async (c) => {
  if (!productConfig.features.billing || !productConfig.billing.enabled) return c.json({ status: "disabled" });
  const user = c.get("session").user;
  const row = await c.env.DB.prepare("SELECT stripe_subscription_id,status,plan,current_period_end FROM subscriptions WHERE user_id=? ORDER BY updated_at DESC LIMIT 1").bind(user.id).first();
  return c.json(row || { status: "none" });
});

billing.post("/webhook", async (c) => {
  let event;
  try { event = await verifyStripeWebhook(c.env, c.req.raw); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, 400); }
  const claimed = await c.env.DB.prepare(`
    INSERT INTO stripe_webhook_events(id,type,processed_at,status,error) VALUES(?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET
      type=excluded.type, processed_at=excluded.processed_at, status='processing', error=NULL
    WHERE stripe_webhook_events.status='failed'
  `).bind(event.id,event.type,Date.now(),"processing").run();
  if ((claimed.meta?.changes || 0) === 0) return c.json({ received: true, duplicate: true });
  try {
    if (await handleMealPlanEvent(c.env, event, c.executionCtx)) {
      // Meal plans (auto-renewing Dietbox subscriptions) are handled entirely by the meal-billing service.
    } else if (event.type === "checkout.session.completed") {
      const obj = event.data.object as Stripe.Checkout.Session;
      const userId = obj.client_reference_id || obj.metadata?.userId;
      const subId = typeof obj.subscription === "string" ? obj.subscription : obj.subscription?.id;
      if (userId && subId) {
        const sub = await stripeClient(c.env).subscriptions.retrieve(subId);
        const periodEnd = Number((sub as unknown as { current_period_end?: number }).current_period_end || 0) * 1000;
        await c.env.DB.prepare("INSERT INTO subscriptions(user_id,stripe_subscription_id,status,plan,current_period_end,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(stripe_subscription_id) DO UPDATE SET status=excluded.status,plan=excluded.plan,current_period_end=excluded.current_period_end,updated_at=excluded.updated_at").bind(userId,sub.id,sub.status,obj.metadata?.plan||sub.metadata?.plan||"pro",periodEnd,Date.now()).run();
        track(c.env,{actor:userId,event:"subscription_started",feature:obj.metadata?.plan||"pro"});
      }
    }
    else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        const periodEnd = Number((sub as unknown as { current_period_end?: number }).current_period_end || 0) * 1000;
        await c.env.DB.prepare("INSERT INTO subscriptions(user_id,stripe_subscription_id,status,plan,current_period_end,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(stripe_subscription_id) DO UPDATE SET status=excluded.status,plan=excluded.plan,current_period_end=excluded.current_period_end,updated_at=excluded.updated_at").bind(userId,sub.id,sub.status,sub.metadata?.plan||"pro",periodEnd,Date.now()).run();
        if(event.type === "customer.subscription.deleted") track(c.env,{actor:userId,event:"subscription_cancelled"});
      }
    }
    else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if(customerId){
        const row=await c.env.DB.prepare("SELECT u.email FROM billing_customers b JOIN \"user\" u ON u.id=b.user_id WHERE b.stripe_customer_id=?").bind(customerId).first<{email:string}>();
        if(row) c.executionCtx.waitUntil(sendPaymentFailed(c.env,row.email));
      }
    }
    await c.env.DB.prepare("UPDATE stripe_webhook_events SET status='processed',processed_at=? WHERE id=?").bind(Date.now(),event.id).run();
    return c.json({ received: true });
  } catch (error) {
    await c.env.DB.prepare("UPDATE stripe_webhook_events SET status='failed',error=?,processed_at=? WHERE id=?").bind(String(error),Date.now(),event.id).run();
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});
