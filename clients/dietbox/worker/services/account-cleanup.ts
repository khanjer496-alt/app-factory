import type { Env } from "../env";
import { stripeClient } from "./stripe";
import { audit } from "./audit";
import { cancelPlanSubscriptions } from "./meal-billing";

export async function cleanupBeforeAuthUserDelete(env: Env, user: { id: string; email: string }) {
  const activeSub = await env.DB.prepare(
    "SELECT stripe_subscription_id,status FROM subscriptions WHERE user_id=? ORDER BY updated_at DESC LIMIT 1",
  ).bind(user.id).first<{ stripe_subscription_id: string; status: string }>();

  if (activeSub && ["active", "trialing", "past_due"].includes(activeSub.status) && env.STRIPE_SECRET_KEY) {
    await stripeClient(env).subscriptions.cancel(activeSub.stripe_subscription_id);
  }

  await cancelPlanSubscriptions(env, user.id);

  const owned = await env.DB.prepare("SELECT r2_key FROM files WHERE user_id=?").bind(user.id).all<{ r2_key: string }>();
  const keys = owned.results.map((x) => x.r2_key);
  const bucket = env.FILES;
  if (bucket) {
    for (let i = 0; i < keys.length; i += 500) {
      await bucket.delete(keys.slice(i, i + 500));
    }
  }

  await env.DB.prepare('DELETE FROM "verification" WHERE identifier=? OR identifier=?').bind(user.email, user.id).run();
  await audit(env, { actor: user.id, action: "account.delete.requested", result: "success" });
}
