import type { Env } from "../env";
import {
  DELIVERY_SLOTS, EMIRATES, PROGRAMS_BY_ID, SLOTS_BY_MEALS, defaultSelections, deliveryDates, earliestStart, isIsoDate, isValidPlan,
  addDays, nextDeliveryDate, quote, type PlanInput, type ProgramId, type Slot,
} from "../../shared/catalog";
import { nextCycleStart } from "../../shared/renewal";
import { audit } from "./audit";
import { track } from "./analytics";

export interface AddressInput { emirate: string; area: string; street: string; unit: string; phone: string; notes: string }
export interface OrderInput extends PlanInput { startDate: string; deliverySlot: string; kcalTarget: number | null; address: AddressInput }

export interface OrderRow {
  id: string; user_id: string; address_id: string; program: ProgramId; meals_per_day: number; days_per_week: number; weeks: number;
  start_date: string; delivery_slot: string; kcal_target: number | null; amount_fils: number; currency: string; status: string;
  stripe_session_id: string | null; created_at: number; updated_at: number;
  auto_renew: number; billing_status: "none" | "active" | "past_due" | "canceled"; cycle: number; next_charge_at: number | null;
  stripe_subscription_id: string | null; stripe_customer_id: string | null;
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function parseAddress(raw: unknown): AddressInput | string {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const address = { emirate: str(a.emirate, 40), area: str(a.area, 80), street: str(a.street, 160), unit: str(a.unit, 60), phone: str(a.phone, 24), notes: str(a.notes, 280) };
  if (!(EMIRATES as readonly string[]).includes(address.emirate)) return "Choose an emirate we deliver to";
  if (address.area.length < 2) return "Add your area or community";
  if (address.street.length < 3) return "Add your street and building";
  if (!/^\+?[0-9 ()-]{7,20}$/.test(address.phone)) return "Add a valid phone number";
  return address;
}

/** Server-side validation of an order request. Everything price-relevant is recomputed from the catalogue. */
export function parseOrder(raw: unknown, now = new Date()): OrderInput | string {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const plan = { program: body.program as ProgramId, mealsPerDay: Number(body.mealsPerDay), daysPerWeek: Number(body.daysPerWeek), weeks: Number(body.weeks) };
  if (!isValidPlan(plan)) return "Invalid plan configuration";
  if (!isIsoDate(body.startDate)) return "Invalid start date";
  const earliest = earliestStart(now);
  if (body.startDate < earliest || body.startDate > addDays(earliest, 60)) return `Start date must be between ${earliest} and 60 days after`;
  if (!DELIVERY_SLOTS.some((s) => s.id === body.deliverySlot)) return "Invalid delivery window";
  const kcal = body.kcalTarget == null ? null : Number(body.kcalTarget);
  if (kcal !== null && (!Number.isInteger(kcal) || kcal < 1000 || kcal > 5000)) return "Invalid calorie target";
  const address = parseAddress(body.address);
  if (typeof address === "string") return address;
  return { ...plan, startDate: body.startDate, deliverySlot: String(body.deliverySlot), kcalTarget: kcal, address };
}

export async function createPendingOrder(env: Env, userId: string, input: OrderInput) {
  const now = Date.now();
  const orderId = crypto.randomUUID();
  const addressId = crypto.randomUUID();
  const price = quote(input);
  const a = input.address;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO addresses(id,user_id,emirate,area,street,unit,phone,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
      .bind(addressId, userId, a.emirate, a.area, a.street, a.unit, a.phone, a.notes, now, now),
    env.DB.prepare("INSERT INTO plan_orders(id,user_id,address_id,program,meals_per_day,days_per_week,weeks,start_date,delivery_slot,kcal_target,amount_fils,currency,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,'aed','pending_payment',?,?)")
      .bind(orderId, userId, addressId, input.program, input.mealsPerDay, input.daysPerWeek, input.weeks, input.startDate, input.deliverySlot, input.kcalTarget, price.total, now, now),
  ]);
  await audit(env, { actor: userId, action: "plan_order.create", resourceType: "plan_order", resourceId: orderId });
  track(env, { actor: userId, event: "plan_order_created", feature: input.program, value: price.total / 100 });
  return { orderId, price };
}

/**
 * Idempotently activates a paid order: generates the first cycle's delivery days and chef's-pick selections.
 * Only pending_payment → active is claimed; a retried webhook re-runs the (INSERT OR IGNORE) day generation
 * until cycle 1 is recorded, so a failure halfway through is repaired rather than lost.
 */
export async function activateOrder(env: Env, orderId: string, paymentRef: string | null, billing: { renews: boolean; subscriptionId?: string; customerId?: string | null }) {
  const now = Date.now();
  const claimed = await env.DB.prepare(`UPDATE plan_orders SET status='active',stripe_session_id=COALESCE(?,stripe_session_id),
      auto_renew=?,billing_status=?,stripe_subscription_id=?,stripe_customer_id=?,updated_at=? WHERE id=? AND status='pending_payment'`)
    .bind(paymentRef, billing.renews ? 1 : 0, billing.renews ? "active" : "none", billing.subscriptionId ?? null, billing.customerId ?? null, now, orderId).run();
  const order = await env.DB.prepare("SELECT * FROM plan_orders WHERE id=?").bind(orderId).first<OrderRow>();
  if (!order || order.status !== "active") return false;
  const recorded = await env.DB.prepare("SELECT 1 AS ok FROM plan_cycles WHERE order_id=? AND cycle=1").bind(orderId).first();
  if (recorded) return (claimed.meta?.changes || 0) > 0;
  const dates = deliveryDates(order.start_date, order.days_per_week, order.days_per_week * order.weeks);
  await insertDays(env, order, dates, now);
  await env.DB.prepare("INSERT OR IGNORE INTO plan_cycles(order_id,cycle,payment_ref,amount_fils,first_date,last_date,created_at) VALUES(?,1,?,?,?,?,?)")
    .bind(orderId, paymentRef || `demo:${orderId}:1`, order.amount_fils, dates[0], dates[dates.length - 1], now).run();
  if ((claimed.meta?.changes || 0) > 0) {
    await audit(env, { actor: order.user_id, action: "plan_order.activate", resourceType: "plan_order", resourceId: orderId });
    track(env, { actor: order.user_id, event: "plan_activated", feature: order.program, value: order.amount_fils / 100 });
  }
  return true;
}

/**
 * Adds the next paid cycle after the last delivery day. Idempotent per payment reference: a repeated
 * invoice webhook re-inserts the same (INSERT OR IGNORE) days instead of adding a second cycle.
 */
export async function appendCycle(env: Env, order: OrderRow, paymentRef: string, amountFils: number, now = new Date()) {
  const count = order.days_per_week * order.weeks;
  const existing = await env.DB.prepare("SELECT first_date FROM plan_cycles WHERE payment_ref=? AND order_id=?").bind(paymentRef, order.id).first<{ first_date: string }>();
  if (existing) {
    await insertDays(env, order, deliveryDates(existing.first_date, order.days_per_week, count), now.getTime());
    return null;
  }
  const last = await env.DB.prepare("SELECT MAX(date) AS last FROM delivery_days WHERE order_id=?").bind(order.id).first<{ last: string | null }>();
  const dates = deliveryDates(nextCycleStart(last?.last || addDays(order.start_date, -1), order.days_per_week, now), order.days_per_week, count);
  const cycle = order.cycle + 1;
  const claimed = await env.DB.prepare("INSERT OR IGNORE INTO plan_cycles(order_id,cycle,payment_ref,amount_fils,first_date,last_date,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(order.id, cycle, paymentRef, amountFils, dates[0], dates[dates.length - 1], now.getTime()).run();
  if ((claimed.meta?.changes || 0) === 0) throw new Error(`Cycle ${cycle} of ${order.id} is already recorded under another payment`);
  await insertDays(env, order, dates, now.getTime());
  // next_charge_at is cleared so syncNextCharge schedules the following renewal.
  await env.DB.prepare("UPDATE plan_orders SET cycle=?,status='active',billing_status='active',next_charge_at=NULL,updated_at=? WHERE id=?").bind(cycle, now.getTime(), order.id).run();
  await audit(env, { actor: order.user_id, action: "plan_order.renew", resourceType: "plan_order", resourceId: `${order.id}:${cycle}` });
  track(env, { actor: order.user_id, event: "plan_renewed", feature: order.program, value: amountFils / 100 });
  return { cycle, firstDate: dates[0], lastDate: dates[dates.length - 1] };
}

async function insertDays(env: Env, order: OrderRow, dates: string[], now: number) {
  const statements = dates.flatMap((date) => dayStatements(env, order, date, now));
  for (let i = 0; i < statements.length; i += 90) await env.DB.batch(statements.slice(i, i + 90));
}

function dayStatements(env: Env, order: OrderRow, date: string, now: number) {
  return [
    env.DB.prepare("INSERT OR IGNORE INTO delivery_days(order_id,user_id,date,status,updated_at) VALUES(?,?,?,'scheduled',?)").bind(order.id, order.user_id, date, now),
    ...defaultSelections(date, order.program, order.meals_per_day).map((s) =>
      env.DB.prepare("INSERT OR IGNORE INTO day_selections(order_id,user_id,date,slot,meal_id,updated_at) VALUES(?,?,?,?,?,?)").bind(order.id, order.user_id, date, s.slot, s.mealId, now)),
  ];
}

/**
 * Skipping and pausing postpone: each scheduled day in `dates` is marked skipped and the same number of
 * delivery days is appended after the last day (and after `resumeAfter`, so make-up days never land inside a pause).
 */
export async function postponeDays(env: Env, order: OrderRow, dates: string[], resumeAfter?: string) {
  if (dates.length === 0) return [];
  const now = Date.now();
  // Claim first so concurrent/duplicate requests cannot append more make-up days than were skipped.
  const claimed = await env.DB.prepare(`UPDATE delivery_days SET status='skipped',updated_at=? WHERE order_id=? AND user_id=? AND status='scheduled' AND date IN (${dates.map(() => "?").join(",")}) RETURNING date`)
    .bind(now, order.id, order.user_id, ...dates).all<{ date: string }>();
  const skipped = claimed.results.map((r) => r.date);
  if (skipped.length === 0) return [];
  const last = await env.DB.prepare("SELECT MAX(date) AS last FROM delivery_days WHERE order_id=?").bind(order.id).first<{ last: string }>();
  let cursor = last?.last || dates[dates.length - 1];
  if (resumeAfter && resumeAfter > cursor) cursor = resumeAfter;
  const added: string[] = [];
  for (let i = 0; i < skipped.length; i++) added.push(cursor = nextDeliveryDate(cursor, order.days_per_week));
  try {
    await insertDays(env, order, added, now);
  } catch (error) {
    await env.DB.prepare(`UPDATE delivery_days SET status='scheduled',updated_at=? WHERE order_id=? AND date IN (${skipped.map(() => "?").join(",")})`).bind(Date.now(), order.id, ...skipped).run();
    throw error;
  }
  await audit(env, { actor: order.user_id, action: skipped.length > 1 ? "plan_order.pause" : "delivery_day.skip", resourceType: "plan_order", resourceId: `${order.id}:${skipped[0]}` });
  return added;
}

export async function postponeDay(env: Env, order: OrderRow, date: string) {
  return (await postponeDays(env, order, [date]))[0] ?? null;
}

export async function currentOrder(env: Env, userId: string) {
  return env.DB.prepare("SELECT * FROM plan_orders WHERE user_id=? AND status IN ('active','pending_payment') ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, created_at DESC LIMIT 1")
    .bind(userId).first<OrderRow>();
}

export const validSlot = (order: OrderRow, slot: string): slot is Slot => (SLOTS_BY_MEALS[order.meals_per_day] as string[]).includes(slot);
export const programName = (id: string) => PROGRAMS_BY_ID[id]?.name || id;
