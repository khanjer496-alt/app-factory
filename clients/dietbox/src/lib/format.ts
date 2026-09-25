import { productConfig } from "../../product.config";

const { locale, currency } = productConfig.market;
const money = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
const moneyExact = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 });

export const aed = (fils: number) => money.format(Math.round(fils / 100));
export const aedExact = (fils: number) => moneyExact.format(fils / 100);

// Delivery dates are calendar dates (YYYY-MM-DD) in the market time zone; format them as UTC to avoid shifting.
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const dayShort = (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(asDate(iso));
export const dayNum = (iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" }).format(asDate(iso));
export const dateLong = (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(asDate(iso));
export const dateMedium = (iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(asDate(iso));
export const num = (n: number) => new Intl.NumberFormat(locale).format(n);

/** Only allow same-origin relative redirects. */
export const safeNext = (value: string | null, fallback = "/app") => (value && value.startsWith("/") && !value.startsWith("//") ? value : fallback);
