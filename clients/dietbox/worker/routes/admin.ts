import { Hono } from "hono";
import type { Env } from "../env";
import { requireAdmin } from "../middleware";
import { audit } from "../services/audit";
import { isIsoDate, marketToday } from "../../shared/catalog";
import { setAutoRenew } from "../services/meal-billing";
import type { OrderRow } from "../services/plans";

export const admin = new Hono<{ Bindings: Env; Variables: { session: any } }>();
admin.use("*", requireAdmin);

admin.get("/overview", async (c) => {
  const [users, activeSubs, files, failedHooks, plans] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM "user"').first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE status IN ('active','trialing')").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(size),0) AS bytes FROM files").first<{ count: number; bytes: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM stripe_webhook_events WHERE status='failed'").first<{ count: number }>(),
    c.env.DB.prepare(`SELECT
        SUM(status='active') AS active,
        SUM(status='active' AND auto_renew=1 AND billing_status='active') AS renewing,
        SUM(status='active' AND billing_status='past_due') AS pastDue,
        SUM(status='active' AND auto_renew=1 AND billing_status='active' AND next_charge_at<=?) AS renewingThisWeek
      FROM plan_orders`).bind(Date.now() + 7 * 86_400_000).first<{ active: number; renewing: number; pastDue: number; renewingThisWeek: number }>(),
  ]);
  return c.json({
    users: users?.count || 0,
    activeSubscriptions: activeSubs?.count || 0,
    files: files || { count: 0, bytes: 0 },
    failedWebhooks: failedHooks?.count || 0,
    plans: { active: plans?.active || 0, renewing: plans?.renewing || 0, pastDue: plans?.pastDue || 0, renewingThisWeek: plans?.renewingThisWeek || 0 },
  });
});

admin.get("/users", async (c) => {
  const r = await c.env.DB.prepare('SELECT id,name,email,emailVerified,role,createdAt FROM "user" ORDER BY createdAt DESC LIMIT 100').all();
  return c.json(r.results);
});
admin.get("/webhooks", async (c) => {
  const r = await c.env.DB.prepare("SELECT id,type,status,error,processed_at FROM stripe_webhook_events ORDER BY processed_at DESC LIMIT 100").all();
  return c.json(r.results);
});
admin.get("/flags", async (c) => {
  const r = await c.env.DB.prepare("SELECT key,enabled,description,updated_at FROM feature_flags ORDER BY key").all();
  return c.json(r.results);
});
admin.put("/flags/:key", async (c) => {
  const key = c.req.param("key");
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(key)) return c.json({ error: "Invalid feature flag key" }, 400);
  const { enabled, description } = await c.req.json<{ enabled: boolean; description?: string }>();
  if (typeof enabled !== "boolean") return c.json({ error: "enabled must be boolean" }, 400);
  const cleanDescription = (description || "").slice(0, 500);
  await c.env.DB.prepare("INSERT INTO feature_flags(key,enabled,description,updated_at) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET enabled=excluded.enabled,description=excluded.description,updated_at=excluded.updated_at").bind(key, enabled ? 1 : 0, cleanDescription, Date.now()).run();
  const user = c.get("session").user;
  await audit(c.env, { actor: user.id, action: "feature_flag.update", resourceType: "feature_flag", resourceId: key });
  return c.json({ ok: true });
});

// Kitchen production sheet: portions to cook per dish/programme for one delivery date.
admin.get("/kitchen", async (c) => {
  const date = c.req.query("date") || marketToday();
  if (!isIsoDate(date)) return c.json({ error: "Invalid date" }, 400);
  const [dishes, drops] = await Promise.all([
    c.env.DB.prepare(`SELECT s.meal_id, o.program, COUNT(*) AS portions
      FROM day_selections s
      JOIN delivery_days d ON d.order_id=s.order_id AND d.date=s.date
      JOIN plan_orders o ON o.id=s.order_id
      WHERE s.date=? AND d.status='scheduled' AND o.status='active'
      GROUP BY s.meal_id, o.program ORDER BY portions DESC`).bind(date).all(),
    c.env.DB.prepare(`SELECT a.emirate, o.delivery_slot, COUNT(*) AS drops
      FROM delivery_days d JOIN plan_orders o ON o.id=d.order_id JOIN addresses a ON a.id=o.address_id
      WHERE d.date=? AND d.status='scheduled' AND o.status='active'
      GROUP BY a.emirate, o.delivery_slot ORDER BY drops DESC`).bind(date).all(),
  ]);
  return c.json({ date, dishes: dishes.results, drops: drops.results });
});

admin.get("/orders", async (c) => {
  const r = await c.env.DB.prepare(`SELECT o.id, u.email, o.program, o.meals_per_day, o.days_per_week, o.weeks, o.start_date, o.amount_fils, o.status, o.created_at,
      o.auto_renew, o.billing_status, o.next_charge_at, o.cycle
    FROM plan_orders o JOIN "user" u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 100`).all();
  return c.json(r.results);
});

// Stop a customer's renewal (e.g. on request by phone). Paid deliveries continue; the next charge is cancelled. Audited as the admin.
admin.post("/orders/:id/renewal", async (c) => {
  const id = c.req.param("id");
  if (!/^[0-9a-f-]{36}$/.test(id)) return c.json({ error: "Invalid order id" }, 400);
  const body = await c.req.json<{ autoRenew?: unknown }>().catch(() => ({} as { autoRenew?: unknown }));
  if (body.autoRenew !== false) return c.json({ error: "Admins can only turn renewal off" }, 400);
  const order = await c.env.DB.prepare("SELECT * FROM plan_orders WHERE id=?").bind(id).first<OrderRow>();
  if (!order) return c.json({ error: "Order not found" }, 404);
  const problem = await setAutoRenew(c.env, order, false, c.get("session").user.id);
  if (problem) return c.json({ error: problem }, 409);
  return c.json({ ok: true });
});
