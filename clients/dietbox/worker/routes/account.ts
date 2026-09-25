import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";

export const account = new Hono<{ Bindings: Env; Variables: { session: any } }>();
account.use("*", requireAuth);

account.get("/export", async (c) => {
  const user = c.get("session").user;
  const [files, subscription, settings, connections, sessions, activity, orders, addresses, deliveries, cycles] = await Promise.all([
    c.env.DB.prepare("SELECT id,name,size,content_type,created_at FROM files WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare("SELECT stripe_subscription_id,status,plan,current_period_end,updated_at FROM subscriptions WHERE user_id=? ORDER BY updated_at DESC LIMIT 1").bind(user.id).first(),
    c.env.DB.prepare("SELECT key,value,updated_at FROM user_settings WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare('SELECT providerId,accountId,createdAt,updatedAt FROM "account" WHERE userId=?').bind(user.id).all(),
    c.env.DB.prepare('SELECT createdAt,updatedAt,expiresAt,ipAddress,userAgent FROM "session" WHERE userId=?').bind(user.id).all(),
    c.env.DB.prepare("SELECT action,resource_type,resource_id,result,created_at FROM audit_log WHERE actor_user_id=? ORDER BY created_at DESC LIMIT 1000").bind(user.id).all(),
    c.env.DB.prepare("SELECT id,program,meals_per_day,days_per_week,weeks,start_date,delivery_slot,kcal_target,amount_fils,currency,status,auto_renew,billing_status,cycle,next_charge_at,created_at FROM plan_orders WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare("SELECT emirate,area,street,unit,phone,notes,created_at FROM addresses WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare("SELECT d.date,d.status,s.slot,s.meal_id FROM delivery_days d LEFT JOIN day_selections s ON s.order_id=d.order_id AND s.date=d.date WHERE d.user_id=? ORDER BY d.date").bind(user.id).all(),
    c.env.DB.prepare("SELECT c.order_id,c.cycle,c.amount_fils,c.first_date,c.last_date,c.created_at FROM plan_cycles c JOIN plan_orders o ON o.id=c.order_id WHERE o.user_id=? ORDER BY c.created_at").bind(user.id).all(),
  ]);
  return c.json({
    exportedAt: new Date().toISOString(),
    user,
    files: files.results,
    subscription,
    settings: settings.results,
    connectedAccounts: connections.results,
    sessions: sessions.results,
    activity: activity.results,
    mealPlans: orders.results,
    mealPlanCycles: cycles.results,
    addresses: addresses.results,
    deliveries: deliveries.results,
  });
});
