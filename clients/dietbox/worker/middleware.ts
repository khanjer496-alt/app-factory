import type { Context, Next } from "hono";
import type { Env } from "./env";
import { getSession } from "./auth";

type HonoEnv = { Bindings: Env; Variables: { session: Awaited<ReturnType<typeof getSession>> } };
export type AppContext = Context<HonoEnv>;

export async function requireAuth(c: AppContext, next: Next) {
  const session = await getSession(c.env, c.req.raw, c.executionCtx);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("session", session);
  await next();
}

export async function requireAdmin(c: AppContext, next: Next) {
  const session = await getSession(c.env, c.req.raw, c.executionCtx);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const role = (session.user as typeof session.user & { role?: string }).role;
  const byEmail = c.env.ADMIN_EMAIL && session.user.email.toLowerCase() === c.env.ADMIN_EMAIL.toLowerCase();
  if (role !== "admin" && !byEmail) return c.json({ error: "Forbidden" }, 403);
  c.set("session", session);
  await next();
}
