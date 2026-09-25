import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";
import { stripeClient } from "../services/stripe";
import { track } from "../services/analytics";
import { activateOrder, createPendingOrder, currentOrder, parseAddress, parseOrder, postponeDay, programName, validSlot } from "../services/plans";
import { addDays, isAllowedSelection, isEditable, isIsoDate, marketToday } from "../../shared/catalog";

// Endpoint contract (AGENTS.md security rules):
// - auth: every route requires a Better Auth session (requireAuth)
// - ownership: every query is scoped by the session user id; order ids never come from the client
// - input: validated server-side (parseOrder/parseAddress/isIsoDate/validSlot/isAllowedSelection)
// - price: recomputed server-side from shared/catalog.ts; client totals are ignored
// - limits: max 5 new orders per user per hour; edits only on days outside the 48h lock
// - audit: order create/activate and day skips are written to audit_log
export const plans = new Hono<{ Bindings: Env; Variables: { session: any } }>();
for (const path of ["/orders", "/plan", "/plan/*"]) plans.use(path, requireAuth);

plans.post("/orders", async (c) => {
  const user = c.get("session").user;
  const input = parseOrder(await c.req.json().catch(() => null));
  if (typeof input === "string") return c.json({ error: input }, 400);

  const recent = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM plan_orders WHERE user_id=? AND created_at>?").bind(user.id, Date.now() - 3_600_000).first<{ n: number }>();
  if ((recent?.n || 0) >= 5) return c.json({ error: "Too many checkout attempts. Try again in an hour." }, 429);

  const covered = await c.env.DB.prepare("SELECT MAX(d.date) AS last FROM delivery_days d JOIN plan_orders o ON o.id=d.order_id WHERE o.user_id=? AND o.status='active' AND d.status='scheduled'").bind(user.id).first<{ last: string | null }>();
  if (covered?.last && covered.last >= input.startDate) return c.json({ error: `Your current plan runs until ${covered.last}. Start the new plan after that date.` }, 409);

  const { orderId, price } = await createPendingOrder(c.env, user.id, input);

  if (c.env.STRIPE_SECRET_KEY) {
    const session = await stripeClient(c.env).checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "aed",
          unit_amount: price.total,
          product_data: {
            name: `Dietbox ${programName(input.program)} · ${input.weeks} week${input.weeks > 1 ? "s" : ""}`,
            description: `${input.mealsPerDay} meals/day · ${input.daysPerWeek} days/week · starts ${input.startDate}`,
          },
        },
      }],
      metadata: { orderId, userId: user.id, kind: "meal_plan" },
      payment_intent_data: { metadata: { orderId, userId: user.id } },
      success_url: `${c.env.APP_URL}/app?checkout=success`,
      cancel_url: `${c.env.APP_URL}/start?checkout=cancelled`,
    });
    if (!session.url) return c.json({ error: "Payment provider did not return a checkout URL" }, 502);
    await c.env.DB.prepare("UPDATE plan_orders SET stripe_session_id=? WHERE id=? AND user_id=?").bind(session.id, orderId, user.id).run();
    track(c.env, { actor: user.id, event: "checkout_started", feature: input.program });
    return c.json({ url: session.url });
  }

  // Demo mode: explicit opt-in, local development or the client preview only, never when Stripe is configured.
  if ((c.env.APP_ENV === "development" || c.env.APP_ENV === "preview") && c.env.DEMO_CHECKOUT === "true") {
    await activateOrder(c.env, orderId, null);
    return c.json({ url: "/app?checkout=demo" });
  }
  return c.json({ error: "Payments are not configured yet" }, 503);
});

plans.get("/orders", async (c) => {
  const user = c.get("session").user;
  const r = await c.env.DB.prepare("SELECT id,program,meals_per_day,days_per_week,weeks,start_date,amount_fils,currency,status,created_at FROM plan_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 50").bind(user.id).all();
  return c.json(r.results);
});

plans.get("/plan", async (c) => {
  const user = c.get("session").user;
  const order = await currentOrder(c.env, user.id);
  if (!order) return c.json({ order: null });
  const from = addDays(marketToday(), -1);
  const [address, days, selections] = await Promise.all([
    c.env.DB.prepare("SELECT emirate,area,street,unit,phone,notes FROM addresses WHERE id=? AND user_id=?").bind(order.address_id, user.id).first(),
    c.env.DB.prepare("SELECT date,status FROM delivery_days WHERE order_id=? AND user_id=? AND date>=? ORDER BY date LIMIT 70").bind(order.id, user.id, from).all<{ date: string; status: string }>(),
    c.env.DB.prepare("SELECT date,slot,meal_id FROM day_selections WHERE order_id=? AND user_id=? AND date>=? ORDER BY date").bind(order.id, user.id, from).all<{ date: string; slot: string; meal_id: string }>(),
  ]);
  const remaining = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM delivery_days WHERE order_id=? AND status='scheduled' AND date>=?").bind(order.id, marketToday()).first<{ n: number }>();
  const { user_id: _u, address_id: _a, stripe_session_id: _s, ...safeOrder } = order;
  return c.json({
    order: safeOrder,
    address,
    remainingDays: remaining?.n || 0,
    today: marketToday(),
    days: days.results.map((d) => ({
      ...d,
      editable: d.status === "scheduled" && isEditable(d.date),
      selections: selections.results.filter((s) => s.date === d.date).map((s) => ({ slot: s.slot, mealId: s.meal_id })),
    })),
  });
});

async function editableOrder(c: any, date: string) {
  const user = c.get("session").user;
  if (!isIsoDate(date)) return { error: "Invalid date", status: 400 as const };
  if (!isEditable(date)) return { error: "Changes lock 48 hours before delivery", status: 409 as const };
  const order = await currentOrder(c.env, user.id);
  if (!order || order.status !== "active") return { error: "No active plan", status: 404 as const };
  const day = await c.env.DB.prepare("SELECT status FROM delivery_days WHERE order_id=? AND user_id=? AND date=?").bind(order.id, user.id, date).first();
  if (!day || day.status !== "scheduled") return { error: "No delivery scheduled on that day", status: 404 as const };
  return { order };
}

plans.put("/plan/days/:date/slots/:slot", async (c) => {
  const { date, slot } = c.req.param();
  const found = await editableOrder(c, date);
  if ("error" in found) return c.json({ error: found.error }, found.status);
  const { order } = found;
  const body = await c.req.json<{ mealId?: unknown }>().catch(() => ({} as { mealId?: unknown }));
  const mealId = typeof body.mealId === "string" ? body.mealId : "";
  if (!validSlot(order, slot)) return c.json({ error: "Invalid meal slot" }, 400);
  if (!isAllowedSelection(date, order.program, slot, mealId)) return c.json({ error: "That dish isn't on your menu for this day" }, 400);
  await c.env.DB.prepare("UPDATE day_selections SET meal_id=?,updated_at=? WHERE order_id=? AND user_id=? AND date=? AND slot=?").bind(mealId, Date.now(), order.id, order.user_id, date, slot).run();
  track(c.env, { actor: order.user_id, event: "meal_swapped", feature: mealId });
  return c.json({ ok: true });
});

plans.post("/plan/days/:date/skip", async (c) => {
  const date = c.req.param("date");
  const found = await editableOrder(c, date);
  if ("error" in found) return c.json({ error: found.error }, found.status);
  const newDate = await postponeDay(c.env, found.order, date);
  if (!newDate) return c.json({ error: "That day was already skipped" }, 409);
  track(c.env, { actor: found.order.user_id, event: "day_skipped" });
  return c.json({ ok: true, addedDate: newDate });
});

plans.put("/plan/address", async (c) => {
  const user = c.get("session").user;
  const address = parseAddress(await c.req.json().catch(() => null));
  if (typeof address === "string") return c.json({ error: address }, 400);
  const order = await currentOrder(c.env, user.id);
  if (!order) return c.json({ error: "No active plan" }, 404);
  await c.env.DB.prepare("UPDATE addresses SET emirate=?,area=?,street=?,unit=?,phone=?,notes=?,updated_at=? WHERE id=? AND user_id=?")
    .bind(address.emirate, address.area, address.street, address.unit, address.phone, address.notes, Date.now(), order.address_id, user.id).run();
  return c.json({ ok: true });
});
