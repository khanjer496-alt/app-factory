import type { Env } from "../env";
import {
  DELIVERY_SLOTS, EMIRATES, PROGRAMS_BY_ID, SLOTS_BY_MEALS, defaultSelections, deliveryDates, earliestStart, isIsoDate, isValidPlan,
  addDays, nextDeliveryDate, quote, type PlanInput, type ProgramId, type Slot,
} from "../../shared/catalog";
import { audit } from "./audit";
import { track } from "./analytics";

export interface AddressInput { emirate: string; area: string; street: string; unit: string; phone: string; notes: string }
export interface OrderInput extends PlanInput { startDate: string; deliverySlot: string; kcalTarget: number | null; address: AddressInput }

export interface OrderRow {
  id: string; user_id: string; address_id: string; program: ProgramId; meals_per_day: number; days_per_week: number; weeks: number;
  start_date: string; delivery_slot: string; kcal_target: number | null; amount_fils: number; currency: string; status: string;
  stripe_session_id: string | null; created_at: number; updated_at: number;
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
 * Idempotently activates a paid order: generates delivery days and chef's-pick selections.
 * Only transitions pending_payment → active; repeated webhooks are no-ops.
 */
export async function activateOrder(env: Env, orderId: string, stripeSessionId: string | null) {
  const claimed = await env.DB.prepare("UPDATE plan_orders SET status='active',stripe_session_id=COALESCE(?,stripe_session_id),updated_at=? WHERE id=? AND status='pending_payment'")
    .bind(stripeSessionId, Date.now(), orderId).run();
  if ((claimed.meta?.changes || 0) === 0) return false;
  const order = await env.DB.prepare("SELECT * FROM plan_orders WHERE id=?").bind(orderId).first<OrderRow>();
  if (!order) return false;
  const now = Date.now();
  const dates = deliveryDates(order.start_date, order.days_per_week, order.days_per_week * order.weeks);
  const statements = dates.flatMap((date) => dayStatements(env, order, date, now));
  for (let i = 0; i < statements.length; i += 90) await env.DB.batch(statements.slice(i, i + 90));
  await audit(env, { actor: order.user_id, action: "plan_order.activate", resourceType: "plan_order", resourceId: orderId });
  track(env, { actor: order.user_id, event: "plan_activated", feature: order.program, value: order.amount_fils / 100 });
  return true;
}

function dayStatements(env: Env, order: OrderRow, date: string, now: number) {
  return [
    env.DB.prepare("INSERT OR IGNORE INTO delivery_days(order_id,user_id,date,status,updated_at) VALUES(?,?,?,'scheduled',?)").bind(order.id, order.user_id, date, now),
    ...defaultSelections(date, order.program, order.meals_per_day).map((s) =>
      env.DB.prepare("INSERT OR IGNORE INTO day_selections(order_id,user_id,date,slot,meal_id,updated_at) VALUES(?,?,?,?,?,?)").bind(order.id, order.user_id, date, s.slot, s.mealId, now)),
  ];
}

/** Skipping postpones: the day is marked skipped and one delivery day is appended after the last scheduled day. */
export async function postponeDay(env: Env, order: OrderRow, date: string) {
  const now = Date.now();
  // Claim the skip first so concurrent/duplicate requests cannot append more than one make-up day.
  const claimed = await env.DB.prepare("UPDATE delivery_days SET status='skipped',updated_at=? WHERE order_id=? AND user_id=? AND date=? AND status='scheduled'")
    .bind(now, order.id, order.user_id, date).run();
  if ((claimed.meta?.changes || 0) === 0) return null;
  const last = await env.DB.prepare("SELECT MAX(date) AS last FROM delivery_days WHERE order_id=?").bind(order.id).first<{ last: string }>();
  const newDate = nextDeliveryDate(last?.last || date, order.days_per_week);
  try {
    await env.DB.batch(dayStatements(env, order, newDate, now));
  } catch (error) {
    await env.DB.prepare("UPDATE delivery_days SET status='scheduled',updated_at=? WHERE order_id=? AND date=?").bind(Date.now(), order.id, date).run();
    throw error;
  }
  await audit(env, { actor: order.user_id, action: "delivery_day.skip", resourceType: "plan_order", resourceId: `${order.id}:${date}` });
  return newDate;
}

export async function currentOrder(env: Env, userId: string) {
  return env.DB.prepare("SELECT * FROM plan_orders WHERE user_id=? AND status IN ('active','pending_payment') ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, created_at DESC LIMIT 1")
    .bind(userId).first<OrderRow>();
}

export const validSlot = (order: OrderRow, slot: string): slot is Slot => (SLOTS_BY_MEALS[order.meals_per_day] as string[]).includes(slot);
export const programName = (id: string) => PROGRAMS_BY_ID[id]?.name || id;
