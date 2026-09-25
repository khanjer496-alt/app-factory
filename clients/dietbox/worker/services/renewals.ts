import type { Env } from "../env";
import { appendCycle, type OrderRow } from "./plans";
import { CHARGE_ROWS, alignCharge, billingMode, claimNotification, syncNextCharge, type ChargeRow } from "./meal-billing";
import { sendPlanEnding, sendRenewalReminder } from "./email";
import { addDays, marketToday, MARKET_TIME_ZONE } from "../../shared/catalog";
import { REMINDER_LEAD_DAYS, wantsRenewalReminder } from "../../shared/renewal";

const DAY = 86_400_000;
const money = (fils: number) => new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(Math.round(fils / 100));
const longDate = (ms: number) => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: MARKET_TIME_ZONE }).format(ms);
const isoLongDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(Date.parse(`${iso}T00:00:00Z`));

/** Runs every step even if one fails, so a single bad order can't stop reminders for everyone else. */
async function each<T>(label: string, items: T[], run: (item: T) => Promise<unknown>) {
  let failed = 0;
  for (const item of items) {
    try { await run(item); } catch (error) { failed++; console.error(`[renewals] ${label}`, error); }
  }
  return { done: items.length - failed, failed };
}

/**
 * Daily job (cron, 09:00 UAE): demo renewals, keeping Stripe charge dates aligned with skips/pauses,
 * renewal and plan-ending reminders, and closing finished plans. Every step is idempotent.
 */
export async function runDailyRenewals(env: Env, now = Date.now()) {
  const today = marketToday(new Date(now));
  const report: Record<string, { done: number; failed: number }> = {};

  // 1. Demo mode has no Stripe to charge, so due renewals are "paid" here (preview and local only).
  if (billingMode(env) === "demo") {
    const due = await env.DB.prepare("SELECT * FROM plan_orders WHERE status='active' AND billing_status='active' AND stripe_subscription_id IS NULL AND next_charge_at<=? LIMIT 200").bind(now).all<OrderRow>();
    report.demoRenewals = await each("demo renewal", due.results, async (order) => {
      if (!order.auto_renew) {
        await env.DB.prepare("UPDATE plan_orders SET billing_status='canceled',next_charge_at=NULL,updated_at=? WHERE id=?").bind(now, order.id).run();
        return;
      }
      await appendCycle(env, order, `demo:${order.id}:${order.cycle + 1}`, order.amount_fils, new Date(now));
      await syncNextCharge(env, order.id, now);
    });
  }

  // 2. Skips and pauses push the delivery calendar; move the next charge with it.
  const renewing = await env.DB.prepare(`${CHARGE_ROWS} WHERE o.status='active' AND o.auto_renew=1 AND o.billing_status='active' LIMIT 5000`).all<ChargeRow>();
  report.chargeDates = await each("charge date", renewing.results, (o) => alignCharge(env, o, now));

  // 3. "Renews on …" reminder, once per cycle.
  const upcoming = await env.DB.prepare(`SELECT o.id,o.user_id,o.weeks,o.cycle,o.amount_fils,o.next_charge_at,u.email FROM plan_orders o JOIN "user" u ON u.id=o.user_id
      WHERE o.status='active' AND o.auto_renew=1 AND o.billing_status='active' AND o.next_charge_at>? AND o.next_charge_at<=? LIMIT 1000`)
    .bind(now, now + REMINDER_LEAD_DAYS * DAY + DAY / 2).all<{ id: string; user_id: string; weeks: number; cycle: number; amount_fils: number; next_charge_at: number; email: string }>();
  report.renewalReminders = await each("renewal reminder", upcoming.results.filter((o) => wantsRenewalReminder(o.weeks, o.cycle)), async (o) => {
    if (await claimNotification(env, "renewal", `${o.id}:${o.cycle}`, o.user_id)) {
      await sendRenewalReminder(env, o.email, { date: longDate(o.next_charge_at), amount: money(o.amount_fils), weeks: o.weeks });
    }
  });

  // 4. "Your plan is ending" for plans that won't renew.
  const ending = await env.DB.prepare(`SELECT o.id,o.user_id,u.email,MAX(d.date) AS last FROM plan_orders o JOIN "user" u ON u.id=o.user_id
      JOIN delivery_days d ON d.order_id=o.id AND d.status='scheduled'
      WHERE o.status='active' AND (o.auto_renew=0 OR o.billing_status IN ('none','canceled'))
      GROUP BY o.id HAVING last>=? AND last<=? LIMIT 1000`)
    .bind(today, addDays(today, REMINDER_LEAD_DAYS)).all<{ id: string; user_id: string; email: string; last: string }>();
  report.endingReminders = await each("ending reminder", ending.results, async (o) => {
    if (await claimNotification(env, "ending", `${o.id}:${o.last}`, o.user_id)) await sendPlanEnding(env, o.email, { lastDate: isoLongDate(o.last) });
  });

  // 5. Close plans with no deliveries left that will not renew (past_due plans stay open while Stripe retries).
  const closed = await env.DB.prepare(`UPDATE plan_orders SET status='completed',updated_at=? WHERE status='active' AND billing_status IN ('none','canceled')
      AND NOT EXISTS (SELECT 1 FROM delivery_days d WHERE d.order_id=plan_orders.id AND d.status='scheduled' AND d.date>=?)`).bind(now, today).run();
  report.completed = { done: closed.meta?.changes || 0, failed: 0 };

  console.info("[renewals]", JSON.stringify(report));
  return report;
}
