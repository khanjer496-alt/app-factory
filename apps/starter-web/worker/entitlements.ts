import type { Next } from "hono";
import type { AppContext } from "./middleware";

export async function requirePaid(c: AppContext, next: Next){
  const user=c.get("session")?.user;
  if(!user) return c.json({error:"Unauthorized"},401);
  const row=await c.env.DB.prepare("SELECT status FROM subscriptions WHERE user_id=? ORDER BY updated_at DESC LIMIT 1").bind(user.id).first<{status:string}>();
  if(!row || !["active","trialing"].includes(row.status)) return c.json({error:"Active subscription required"},402);
  await next();
}
