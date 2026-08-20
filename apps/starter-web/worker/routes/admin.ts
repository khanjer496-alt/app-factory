import { Hono } from "hono";
import type { Env } from "../env";
import { requireAdmin } from "../middleware";
import { audit } from "../services/audit";

export const admin = new Hono<{ Bindings: Env; Variables: { session: any } }>();
admin.use("*", requireAdmin);

admin.get("/overview", async (c) => {
  const [users, activeSubs, files, failedHooks] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM "user"').first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE status IN ('active','trialing')").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(size),0) AS bytes FROM files").first<{ count: number; bytes: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM stripe_webhook_events WHERE status='failed'").first<{ count: number }>(),
  ]);
  return c.json({
    users: users?.count || 0,
    activeSubscriptions: activeSubs?.count || 0,
    files: files || { count: 0, bytes: 0 },
    failedWebhooks: failedHooks?.count || 0,
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
