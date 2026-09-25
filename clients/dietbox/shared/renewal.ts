import { EDIT_LOCK_DAYS, addDays, deliversOn, earliestStart, isIsoDate, nextDeliveryDate } from "./catalog";

// ---------- Auto-renewal calendar ----------
// A plan renews every `weeks` weeks. Each renewal is charged a few days before the next cycle's first delivery,
// so the kitchen knows before the 48h lock, and skipped/paused days push the charge back with the deliveries.

/** Charge this many days before the next cycle's first delivery day. */
export const RENEWAL_LEAD_DAYS = EDIT_LOCK_DAYS + 1;
/** Renewal and plan-ending reminders go out this many days ahead. */
export const REMINDER_LEAD_DAYS = 3;
/** Longest single pause, in calendar days. */
export const MAX_PAUSE_DAYS = 28;
/** Charges and the daily job run at 09:00 UAE time (UTC+4, no daylight saving). */
export const CHARGE_HOUR_UTC = 5;

const HOUR = 3_600_000;
export const atChargeHour = (iso: string) => Date.parse(`${iso}T${String(CHARGE_HOUR_UTC).padStart(2, "0")}:00:00Z`);

export const firstDeliveryOnOrAfter = (iso: string, daysPerWeek: number) => (deliversOn(iso, daysPerWeek) ? iso : nextDeliveryDate(iso, daysPerWeek));

/** First delivery day of the next cycle: straight after the last one, but never inside the edit lock (late payments). */
export function nextCycleStart(lastDate: string, daysPerWeek: number, now = new Date()): string {
  const afterLast = nextDeliveryDate(lastDate, daysPerWeek);
  const earliest = firstDeliveryOnOrAfter(earliestStart(now), daysPerWeek);
  return afterLast > earliest ? afterLast : earliest;
}

/** When to charge for the cycle that follows `lastDate` (epoch ms). Never less than an hour from now. */
export function renewalChargeAt(lastDate: string, daysPerWeek: number, now = Date.now()): number {
  const at = atChargeHour(addDays(nextDeliveryDate(lastDate, daysPerWeek), -RENEWAL_LEAD_DAYS));
  return Math.max(at, now + HOUR);
}

/** Weekly plans would get a reminder every week; after the first renewal they rely on the receipt instead. */
export const wantsRenewalReminder = (weeks: number, cycle: number) => weeks >= 2 || cycle === 1;

/** Validates a pause request and returns every calendar date in it, or an error message. */
export function pauseDates(from: unknown, to: unknown, now = new Date()): string[] | string {
  if (!isIsoDate(from) || !isIsoDate(to)) return "Choose the first and last day of your pause";
  if (from < earliestStart(now)) return "Changes lock 48 hours before delivery";
  if (to < from) return "The pause must end after it starts";
  const dates: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    dates.push(d);
    if (dates.length > MAX_PAUSE_DAYS) return `Pauses can be up to ${MAX_PAUSE_DAYS} days`;
  }
  return dates;
}
