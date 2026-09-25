import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Allergen, Meal, Program, Slot, Tag } from "../../shared/catalog";
import { AR } from "./ar";
import { AR_CATALOG } from "./catalog-ar";

export type Locale = "en" | "ar";
const KEY = "dietbox:locale";

// Formatting reads the active locale directly so plain helpers (format.ts) follow the language switch.
let active: Locale = "en";
export const activeLocale = () => active;
/** Arabic uses Latin digits for prices and macros (brand guidelines §4). */
export const intlLocale = (l: Locale = active) => (l === "ar" ? "ar-AE-u-nu-latn" : "en-AE");

function initialLocale(): Locale {
  try {
    const url = new URLSearchParams(location.search).get("lang");
    if (url === "ar" || url === "en") return url;
    const saved = localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch { /* storage unavailable: fall back to English */ }
  return "en";
}

/** Keys are the English source strings; missing Arabic entries fall back to English. `{name}` placeholders are filled from vars. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  let s = locale === "ar" ? AR[key] ?? key : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

function catalogHelpers(locale: Locale) {
  const ar = locale === "ar";
  return {
    meal: (m: Meal) => (ar && AR_CATALOG.meals[m.id]?.name) || m.name,
    mealDesc: (m: Meal) => (ar && AR_CATALOG.meals[m.id]?.description) || m.description,
    program: (p: Program) => (ar && AR_CATALOG.programs[p.id]?.name) || p.name,
    programGoal: (p: Program) => (ar && AR_CATALOG.programs[p.id]?.goal) || p.goal,
    programTagline: (p: Program) => (ar && AR_CATALOG.programs[p.id]?.tagline) || p.tagline,
    programDesc: (p: Program) => (ar && AR_CATALOG.programs[p.id]?.description) || p.description,
    tag: (t: Tag) => (ar ? AR_CATALOG.tags[t] : undefined) || EN_TAGS[t],
    allergen: (a: Allergen) => (ar ? AR_CATALOG.allergens[a] : undefined) || a,
    slot: (s: Slot) => (ar ? AR_CATALOG.slots[s] : undefined) || EN_SLOTS[s],
    emirate: (e: string) => (ar && AR_CATALOG.emirates[e]) || e,
  };
}

const EN_TAGS: Record<Tag, string> = { "high-protein": "High protein", vegetarian: "Vegetarian", vegan: "Vegan", keto: "Keto", "gluten-free": "Gluten-free", "dairy-free": "Dairy-free", spicy: "Spicy" };
const EN_SLOTS: Record<Slot, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack1: "Snack", snack2: "Snack" };

interface I18n {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  c: ReturnType<typeof catalogHelpers>;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  active = locale;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem(KEY, locale); } catch { /* ignore */ }
  }, [locale]);
  const value = useMemo<I18n>(() => ({
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    setLocale: setLocaleState,
    t: (key, vars) => translate(locale, key, vars),
    c: catalogHelpers(locale),
  }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
