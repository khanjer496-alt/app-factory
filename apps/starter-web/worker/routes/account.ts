import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";

export const account = new Hono<{ Bindings: Env; Variables: { session: any } }>();
account.use("*", requireAuth);

account.get("/export", async (c) => {
  const user = c.get("session").user;
  const [files, subscription, settings, connections, sessions, activity] = await Promise.all([
    c.env.DB.prepare("SELECT id,name,size,content_type,created_at FROM files WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare("SELECT stripe_subscription_id,status,plan,current_period_end,updated_at FROM subscriptions WHERE user_id=? ORDER BY updated_at DESC LIMIT 1").bind(user.id).first(),
    c.env.DB.prepare("SELECT key,value,updated_at FROM user_settings WHERE user_id=?").bind(user.id).all(),
    c.env.DB.prepare('SELECT providerId,accountId,createdAt,updatedAt FROM "account" WHERE userId=?').bind(user.id).all(),
    c.env.DB.prepare('SELECT createdAt,updatedAt,expiresAt,ipAddress,userAgent FROM "session" WHERE userId=?').bind(user.id).all(),
    c.env.DB.prepare("SELECT action,resource_type,resource_id,result,created_at FROM audit_log WHERE actor_user_id=? ORDER BY created_at DESC LIMIT 1000").bind(user.id).all(),
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
  });
});
