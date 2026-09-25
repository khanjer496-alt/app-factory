import { describe, expect, it } from "vitest";
import { productConfig } from "../product.config";
import {
  MEALS, MEALS_BY_ID, PROGRAMS, SLOTS_BY_MEALS, deliveryDates, deliversOn, defaultSelections, earliestStart, isAllowedSelection,
  isEditable, isIsoDate, isValidPlan, marketToday, menuFor, nextDeliveryDate, quote, slotCategory,
} from "../shared/catalog";
import { dailyTarget, macroSplit } from "../shared/nutrition";

describe("product config", () => {
  it("has a product identity", () => expect(productConfig.name).toBe("Dietbox"));
  it("has a safe slug", () => expect(productConfig.slug).toMatch(/^[a-z0-9-]+$/));
  it("declares its regional market explicitly", () => expect(productConfig.market.currency).toBe("AED"));
  it("keeps uploads behind a feature flag", () => expect(typeof productConfig.features.uploads).toBe("boolean"));
});

describe("catalogue", () => {
  it("has unique meal ids with images", () => {
    expect(new Set(MEALS.map((m) => m.id)).size).toBe(MEALS.length);
    for (const m of MEALS) expect(m.image).toBe(`/meals/${m.id}.webp`);
  });
  it("gives every programme options in every category on every day", () => {
    for (const p of PROGRAMS) for (let i = 0; i < 14; i++) {
      const menu = menuFor(`2026-10-${String(i + 1).padStart(2, "0")}`, p.id);
      expect(menu.breakfast.length, `${p.id} breakfast`).toBeGreaterThanOrEqual(2);
      expect(menu.main.length, `${p.id} main`).toBeGreaterThanOrEqual(4);
      expect(menu.snack.length, `${p.id} snack`).toBeGreaterThanOrEqual(2);
    }
  });
  it("only serves programme-eligible dishes", () => {
    for (const cat of Object.values(menuFor("2026-10-05", "keto"))) for (const m of cat) expect(m.tags).toContain("keto");
    for (const cat of Object.values(menuFor("2026-10-05", "plant"))) for (const m of cat) expect(m.tags.some((t) => t === "vegetarian" || t === "vegan")).toBe(true);
  });
  it("default picks are valid and lunch ≠ dinner", () => {
    const picks = defaultSelections("2026-10-05", "balance", 5);
    expect(picks.map((p) => p.slot)).toEqual(SLOTS_BY_MEALS[5]);
    for (const p of picks) expect(isAllowedSelection("2026-10-05", "balance", p.slot, p.mealId)).toBe(true);
    expect(picks.find((p) => p.slot === "lunch")!.mealId).not.toBe(picks.find((p) => p.slot === "dinner")!.mealId);
  });
  it("rejects selections outside the day's menu or slot category", () => {
    expect(isAllowedSelection("2026-10-05", "keto", "lunch", "protein-pancakes")).toBe(false);
    const breakfast = menuFor("2026-10-05", "balance").breakfast[0];
    expect(isAllowedSelection("2026-10-05", "balance", "dinner", breakfast.id)).toBe(false);
    expect(slotCategory("snack2")).toBe("snack");
    expect(MEALS_BY_ID["not-a-meal"]).toBeUndefined();
  });
});

describe("pricing", () => {
  it("computes integer fils with week discounts", () => {
    const q = quote({ program: "balance", mealsPerDay: 3, daysPerWeek: 5, weeks: 4 });
    expect(q.perDay).toBe(3 * 4200);
    expect(q.subtotal).toBe(3 * 4200 * 20);
    expect(q.discount).toBe(Math.round(q.subtotal * 0.1));
    expect(q.total).toBe(q.subtotal - q.discount);
    expect(Number.isInteger(q.total)).toBe(true);
  });
  it("prices snacks separately", () => {
    const q = quote({ program: "muscle", mealsPerDay: 4, daysPerWeek: 5, weeks: 1 });
    expect(q.perDay).toBe(3 * 5200 + 1900);
  });
  it("rejects invalid configurations", () => {
    expect(isValidPlan({ program: "balance", mealsPerDay: 9, daysPerWeek: 5, weeks: 1 })).toBe(false);
    expect(isValidPlan({ program: "nope" as never, mealsPerDay: 3, daysPerWeek: 5, weeks: 1 })).toBe(false);
    expect(isValidPlan({ program: "keto", mealsPerDay: 3, daysPerWeek: 7, weeks: 2 })).toBe(true);
  });
});

describe("delivery calendar", () => {
  it("validates ISO dates strictly", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-10-05")).toBe(true);
    expect(isIsoDate("2026-10-05T00:00")).toBe(false);
  });
  it("uses the UAE date and a 48h edit lock", () => {
    const lateUtc = new Date("2026-09-25T21:30:00Z"); // already 26 Sep in Dubai
    expect(marketToday(lateUtc)).toBe("2026-09-26");
    expect(earliestStart(lateUtc)).toBe("2026-09-28");
    expect(isEditable("2026-09-27", lateUtc)).toBe(false);
    expect(isEditable("2026-09-28", lateUtc)).toBe(true);
  });
  it("skips weekends for 5-day plans and Sundays for 6-day plans", () => {
    expect(deliveryDates("2026-09-26", 5, 5)).toEqual(["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
    expect(deliversOn("2026-10-03", 6)).toBe(true); // Saturday
    expect(deliversOn("2026-10-04", 6)).toBe(false); // Sunday
    expect(nextDeliveryDate("2026-10-02", 5)).toBe("2026-10-05");
  });
});

describe("nutrition", () => {
  it("estimates a sensible target and split", () => {
    const kcal = dailyTarget({ sex: "male", age: 30, weightKg: 78, heightCm: 176, activity: 1.55, goal: "maintain" });
    expect(kcal).toBeGreaterThan(2400);
    expect(kcal).toBeLessThan(3000);
    const m = macroSplit(2000, "keto");
    expect(m.carbs).toBeLessThan(30);
  });
});
