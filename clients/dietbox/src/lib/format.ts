import { productConfig } from "../../product.config";
import { intlLocale } from "../i18n";

const { currency } = productConfig.market;
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function fmt<T extends Intl.NumberFormat | Intl.DateTimeFormat>(key: string, make: (locale: string) => T): T {
  const locale = intlLocale();
  const id = `${locale}|${key}`;
  if (!cache.has(id)) cache.set(id, make(locale));
  return cache.get(id) as T;
}

export const aed = (fils: number) => fmt("money", (l) => new Intl.NumberFormat(l, { style: "currency", currency, maximumFractionDigits: 0 })).format(Math.round(fils / 100));
export const aedExact = (fils: number) => fmt("moneyExact", (l) => new Intl.NumberFormat(l, { style: "currency", currency, minimumFractionDigits: 2 })).format(fils / 100);

// Delivery dates are calendar dates (YYYY-MM-DD) in the market time zone; format them as UTC to avoid shifting.
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const date = (key: string, opts: Intl.DateTimeFormatOptions) => (iso: string) => fmt(key, (l) => new Intl.DateTimeFormat(l, { ...opts, timeZone: "UTC" })).format(asDate(iso));
export const dayShort = date("dayShort", { weekday: "short" });
export const dayNum = date("dayNum", { day: "numeric" });
export const dateLong = date("dateLong", { weekday: "long", day: "numeric", month: "long" });
export const dateMedium = date("dateMedium", { day: "numeric", month: "short", year: "numeric" });
export const num = (n: number) => fmt("num", (l) => new Intl.NumberFormat(l)).format(n);

/** Only allow same-origin relative redirects. */
export const safeNext = (value: string | null, fallback = "/app") => (value && value.startsWith("/") && !value.startsWith("//") ? value : fallback);
