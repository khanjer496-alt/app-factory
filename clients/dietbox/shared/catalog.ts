// Single source of truth for the Dietbox menu, programmes and pricing.
// Imported by the UI (display) and the Worker (validation + authoritative price).
// Nutrition values are indicative placeholders until lab/dietitian verification (see BRAND_GUIDELINES.md §9).

export type Category = "breakfast" | "main" | "snack";
export type Slot = "breakfast" | "lunch" | "dinner" | "snack1" | "snack2";
export type Tag = "high-protein" | "vegetarian" | "vegan" | "keto" | "gluten-free" | "dairy-free" | "spicy";
export type Allergen = "gluten" | "dairy" | "egg" | "nuts" | "sesame" | "soy" | "fish" | "shellfish";

export interface Meal {
  id: string;
  name: string;
  description: string;
  category: Category;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: Tag[];
  allergens: Allergen[];
  image: string;
}

const m = (id: string, name: string, category: Category, [kcal, protein, carbs, fat]: [number, number, number, number], tags: Tag[], allergens: Allergen[], description: string): Meal =>
  ({ id, name, category, kcal, protein, carbs, fat, tags, allergens, description, image: `/meals/${id}.webp` });

export const MEALS: Meal[] = [
  // Breakfast
  m("shakshuka", "Spiced Shakshuka & Feta", "breakfast", [410, 25, 14, 28], ["keto", "vegetarian", "gluten-free"], ["egg", "dairy"], "Eggs baked in smoky tomato and pepper sauce with feta, coriander and a pinch of cumin."),
  m("avo-egg-sourdough", "Avo & Jammy Egg Sourdough", "breakfast", [460, 22, 38, 24], ["vegetarian"], ["gluten", "egg"], "Smashed avocado, 7-minute egg, chilli flakes and spinach on toasted sourdough."),
  m("protein-french-toast", "Protein French Toast", "breakfast", [480, 34, 52, 13], ["high-protein", "vegetarian"], ["gluten", "egg", "dairy"], "Brioche soaked in whey custard, blueberries, banana and a thread of date syrup."),
  m("green-goddess-bowl", "Green Goddess Egg Bowl", "breakfast", [410, 24, 12, 29], ["keto", "vegetarian", "gluten-free"], ["egg"], "Two eggs, avocado, courgette ribbons, radish and green tahini dressing."),
  m("egg-toast", "Sunny Egg Toast & Turkey", "breakfast", [440, 33, 34, 18], ["high-protein"], ["gluten", "egg"], "Fried egg on seeded toast with smoked turkey, tomato jam and rocket."),
  m("protein-pancakes", "Stacked Protein Pancakes", "breakfast", [510, 36, 58, 12], ["high-protein", "vegetarian"], ["gluten", "egg", "dairy"], "Oat and whey pancakes, Greek yoghurt, banana and a drizzle of honey."),

  // Mains (lunch + dinner)
  m("thai-red-curry", "Thai Red Curry Chicken", "main", [560, 42, 48, 20], ["high-protein", "spicy", "gluten-free", "dairy-free"], [], "Coconut-light red curry, chicken thigh, Thai basil and jasmine rice."),
  m("salmon-salsa-verde", "Seared Salmon, Pomegranate Salsa", "main", [540, 38, 11, 38], ["keto", "high-protein", "gluten-free", "dairy-free"], ["fish"], "Crisp-skin salmon, charred asparagus, pickled red onion and a sharp herb-pomegranate salsa."),
  m("pesto-farfalle", "Pesto Farfalle, Blistered Tomato", "main", [590, 22, 74, 22], ["vegetarian"], ["gluten", "dairy", "nuts"], "Basil-pistachio pesto, blistered cherry tomatoes and pecorino."),
  m("chicken-toum-plate", "Charred Chicken & Toum", "main", [580, 48, 44, 22], ["high-protein", "dairy-free"], [], "Shawarma-spiced chicken, garlic toum, crisp leaves and baked falafel."),
  m("sirloin-chimichurri", "Sliced Sirloin, Chimichurri", "main", [610, 49, 12, 40], ["keto", "high-protein", "gluten-free", "dairy-free"], [], "Grass-fed sirloin, green chimichurri, charred peppers and leaves."),
  m("falafel-power-bowl", "Falafel Power Bowl", "main", [560, 21, 66, 23], ["vegan", "vegetarian", "dairy-free"], ["sesame"], "Baked falafel, chickpeas, herbed freekeh, pickled onion and tahini."),
  m("buddha-bowl", "Rainbow Buddha Bowl", "main", [520, 18, 62, 22], ["vegan", "vegetarian", "gluten-free", "dairy-free"], ["sesame"], "Roast sweet potato, avocado, chickpeas, red cabbage, radish and miso-tahini."),
  m("lemon-linguine", "Lemon Garlic Linguine", "main", [570, 23, 78, 17], ["vegetarian"], ["gluten", "dairy"], "Linguine, garden peas, lemon zest, chilli and parmesan."),
  m("teriyaki-salmon", "Teriyaki Glazed Salmon", "main", [590, 40, 52, 22], ["high-protein", "dairy-free"], ["fish", "soy", "sesame", "gluten"], "Low-sugar teriyaki salmon, sesame greens and brown rice."),
  m("beef-kofta", "Beef Kofta, Rocket & Sumac", "main", [560, 42, 11, 38], ["keto", "high-protein", "gluten-free"], ["dairy"], "Spiced beef kofta, rocket, sumac onions and garlic yoghurt."),
  m("lemon-herb-chicken", "Lemon & Rosemary Chicken", "main", [480, 52, 14, 22], ["keto", "high-protein", "gluten-free", "dairy-free"], [], "Grilled chicken breast, lemon, rosemary and roast vegetables."),
  m("harvest-salad", "Harvest Salad & Halloumi", "main", [530, 24, 38, 31], ["vegetarian", "gluten-free"], ["dairy", "nuts"], "Grilled halloumi, roast squash, avocado, pomegranate and walnuts."),
  m("sesame-tofu-poke", "Sesame Tofu Poke", "main", [540, 26, 58, 21], ["vegan", "vegetarian", "dairy-free"], ["soy", "sesame"], "Crispy tofu, sushi rice, edamame, corn, cucumber and ponzu."),
  m("chicken-caesar", "Chicken Caesar, Lightened", "main", [490, 46, 12, 28], ["keto", "high-protein", "gluten-free"], ["dairy", "egg", "fish"], "Grilled chicken, romaine, parmesan crisps and yoghurt Caesar dressing."),
  m("avocado-quinoa-bowl", "Avocado Quinoa Bowl", "main", [510, 17, 56, 24], ["vegan", "vegetarian", "gluten-free", "dairy-free"], ["sesame"], "Red quinoa, avocado, black sesame, chilli, lemon and greens."),
  m("moroccan-couscous", "Moroccan Couscous Bowl", "main", [550, 20, 76, 17], ["vegetarian"], ["gluten", "dairy"], "Ras el hanout vegetables, herbed couscous, chickpeas and whipped feta."),
  m("shish-tawook", "Shish Tawook Skewers", "main", [520, 50, 14, 28], ["keto", "high-protein", "gluten-free"], ["dairy"], "Yoghurt-marinated chicken skewers, charred tomato and garlic sauce."),
  m("bibimbap", "Veggie Bibimbap", "main", [560, 22, 72, 19], ["vegetarian", "spicy"], ["egg", "soy", "sesame"], "Rice, seasoned vegetables, fried egg and gochujang dressing."),
  m("smash-burger", "Lean Smash Burger", "main", [640, 44, 52, 27], ["high-protein"], ["gluten", "dairy", "egg"], "Lean beef smash patty, light cheese, pickles and baked fries."),
  m("grilled-chicken-peas", "Grilled Chicken & Minted Peas", "main", [500, 51, 30, 17], ["high-protein", "gluten-free", "dairy-free"], [], "Grilled chicken breast, minted peas, carrots and herb mash."),
  m("tikka-skillet", "Chicken Tikka Skillet", "main", [530, 47, 13, 31], ["keto", "high-protein", "gluten-free", "spicy"], ["dairy"], "Tandoori chicken and peppers in a smoky tikka sauce with fresh basil."),

  // Snacks
  m("strawberry-skyr-pot", "Strawberry Skyr Pot", "snack", [190, 17, 22, 3], ["high-protein", "vegetarian", "gluten-free"], ["dairy"], "Thick skyr, macerated strawberries and a crunch of granola dust."),
  m("acai-superfood-bowl", "Mini Açaí Bowl", "snack", [230, 6, 38, 7], ["vegan", "vegetarian", "gluten-free", "dairy-free"], [], "Açaí, blackberries, kiwi, pomegranate and toasted coconut."),
  m("rainbow-jar-salad", "Rainbow Jar Salad", "snack", [210, 9, 26, 8], ["vegan", "vegetarian", "dairy-free"], [], "Layered lentils, tomato, cucumber, pepper and lemon vinaigrette."),
  m("greek-feta-salad", "Greek Tomato & Feta", "snack", [180, 7, 8, 13], ["keto", "vegetarian", "gluten-free"], ["dairy"], "Heirloom tomatoes, barrel-aged feta, olives and oregano."),
  m("dark-leaf-salad", "Kale & Seed Crunch", "snack", [200, 8, 9, 15], ["keto", "vegan", "vegetarian", "gluten-free", "dairy-free"], ["sesame"], "Massaged kale, toasted seeds, pickled onion and cider dressing."),
];

export const MEALS_BY_ID: Record<string, Meal> = Object.fromEntries(MEALS.map((meal) => [meal.id, meal]));

export type ProgramId = "lean" | "balance" | "muscle" | "keto" | "plant";

export interface Program {
  id: ProgramId;
  name: string;
  goal: string;
  tagline: string;
  description: string;
  kcalRange: [number, number];
  /** Portion multiplier applied to the base recipe. */
  portion: number;
  /** Price per breakfast/main in fils (AED × 100), VAT inclusive. */
  mealPriceFils: number;
  split: { protein: number; carbs: number; fat: number };
  image: string;
  eligible: (meal: Meal) => boolean;
}

const any = () => true;
export const PROGRAMS: Program[] = [
  { id: "lean", name: "Lean", goal: "Lose fat", tagline: "Cut without the hunger.", description: "Calorie-controlled portions with high protein to keep you full.", kcalRange: [1200, 1600], portion: 0.85, mealPriceFils: 3900, split: { protein: 0.35, carbs: 0.35, fat: 0.3 }, image: "/meals/lemon-herb-chicken.webp", eligible: any },
  { id: "balance", name: "Balance", goal: "Maintain", tagline: "Everyday fuel, dialled in.", description: "Balanced macros for energy, focus and consistency.", kcalRange: [1700, 2100], portion: 1, mealPriceFils: 4200, split: { protein: 0.3, carbs: 0.4, fat: 0.3 }, image: "/meals/buddha-bowl.webp", eligible: any },
  { id: "muscle", name: "Muscle", goal: "Build muscle", tagline: "Bigger plates. Bigger lifts.", description: "Larger portions with extra protein and carbs to support training.", kcalRange: [2300, 3000], portion: 1.3, mealPriceFils: 5200, split: { protein: 0.35, carbs: 0.45, fat: 0.2 }, image: "/meals/sirloin-chimichurri.webp", eligible: any },
  { id: "keto", name: "Keto", goal: "Low carb", tagline: "Fat-fuelled. Carbs kept low.", description: "High-fat, very low-carb meals that keep you in ketosis.", kcalRange: [1500, 2000], portion: 1, mealPriceFils: 4900, split: { protein: 0.25, carbs: 0.05, fat: 0.7 }, image: "/meals/salmon-salsa-verde.webp", eligible: (meal) => meal.tags.includes("keto") },
  { id: "plant", name: "Plant", goal: "Vegetarian", tagline: "All plants. Full power.", description: "Vegetarian and vegan dishes with complete protein in every meal.", kcalRange: [1500, 2000], portion: 1, mealPriceFils: 4200, split: { protein: 0.25, carbs: 0.5, fat: 0.25 }, image: "/meals/falafel-power-bowl.webp", eligible: (meal) => meal.tags.includes("vegetarian") || meal.tags.includes("vegan") },
];

export const PROGRAMS_BY_ID: Record<string, Program> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

export const SNACK_PRICE_FILS = 1900;
export const MEALS_PER_DAY = [2, 3, 4, 5] as const;
export const DAYS_PER_WEEK = [5, 6, 7] as const;
export const WEEKS = [1, 2, 4] as const;
export const WEEK_DISCOUNT: Record<number, number> = { 1: 0, 2: 0.05, 4: 0.1 };

export const SLOTS_BY_MEALS: Record<number, Slot[]> = {
  2: ["lunch", "dinner"],
  3: ["breakfast", "lunch", "dinner"],
  4: ["breakfast", "lunch", "dinner", "snack1"],
  5: ["breakfast", "snack1", "lunch", "snack2", "dinner"],
};

export const SLOT_LABEL: Record<Slot, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack1: "Snack", snack2: "Snack" };
export const slotCategory = (slot: Slot): Category => (slot === "breakfast" ? "breakfast" : slot === "lunch" || slot === "dinner" ? "main" : "snack");

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const;
export const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning, 5–8 AM" },
  { id: "evening", label: "Night before, 6–10 PM" },
] as const;

export interface PlanInput {
  program: ProgramId;
  mealsPerDay: number;
  daysPerWeek: number;
  weeks: number;
}

export function isValidPlan(input: Partial<PlanInput>): input is PlanInput {
  return !!input.program && !!PROGRAMS_BY_ID[input.program]
    && (MEALS_PER_DAY as readonly number[]).includes(Number(input.mealsPerDay))
    && (DAYS_PER_WEEK as readonly number[]).includes(Number(input.daysPerWeek))
    && (WEEKS as readonly number[]).includes(Number(input.weeks));
}

/** Authoritative price in fils (integer). The server always recomputes this; the client value is display only. */
export function quote(input: PlanInput) {
  const program = PROGRAMS_BY_ID[input.program];
  const slots = SLOTS_BY_MEALS[input.mealsPerDay];
  const perDay = slots.reduce((sum, slot) => sum + (slotCategory(slot) === "snack" ? SNACK_PRICE_FILS : program.mealPriceFils), 0);
  const days = input.daysPerWeek * input.weeks;
  const subtotal = perDay * days;
  const discount = Math.round(subtotal * (WEEK_DISCOUNT[input.weeks] || 0));
  const total = subtotal - discount;
  return { perDay, days, subtotal, discount, total, perDayAfterDiscount: Math.round(total / days) };
}

// ---------- Dates (delivery calendar is in UAE local dates, stored as YYYY-MM-DD) ----------

export const MARKET_TIME_ZONE = "Asia/Dubai";
export const EDIT_LOCK_DAYS = 2;

export function marketToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MARKET_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const isIsoDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);
export const earliestStart = (now = new Date()) => addDays(marketToday(now), EDIT_LOCK_DAYS);
export const isEditable = (date: string, now = new Date()) => date >= earliestStart(now);

/** 5 days = Mon–Fri, 6 = Mon–Sat, 7 = every day (UAE weekend is Sat/Sun). */
export function deliversOn(iso: string, daysPerWeek: number) {
  const day = weekday(iso);
  if (daysPerWeek >= 7) return true;
  if (daysPerWeek === 6) return day !== 0;
  return day >= 1 && day <= 5;
}

export function deliveryDates(start: string, daysPerWeek: number, count: number): string[] {
  const out: string[] = [];
  for (let d = start; out.length < count; d = addDays(d, 1)) if (deliversOn(d, daysPerWeek)) out.push(d);
  return out;
}

export function nextDeliveryDate(after: string, daysPerWeek: number): string {
  let d = addDays(after, 1);
  while (!deliversOn(d, daysPerWeek)) d = addDays(d, 1);
  return d;
}

// ---------- Rotating menu ----------

const OPTIONS_PER_CATEGORY: Record<Category, number> = { breakfast: 3, main: 6, snack: 3 };
const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);

/** Deterministic daily menu for a programme: the chef's rotation. */
export function menuFor(date: string, programId: ProgramId): Record<Category, Meal[]> {
  const program = PROGRAMS_BY_ID[programId];
  const n = dayNumber(date);
  const pick = (category: Category) => {
    const pool = MEALS.filter((meal) => meal.category === category && program.eligible(meal));
    const count = Math.min(OPTIONS_PER_CATEGORY[category], pool.length);
    const start = (n * (category === "main" ? 5 : 2)) % pool.length;
    return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
  };
  return { breakfast: pick("breakfast"), main: pick("main"), snack: pick("snack") };
}

export function defaultSelections(date: string, programId: ProgramId, mealsPerDay: number): { slot: Slot; mealId: string }[] {
  const menu = menuFor(date, programId);
  const used: Record<Category, number> = { breakfast: 0, main: 0, snack: 0 };
  return SLOTS_BY_MEALS[mealsPerDay].map((slot) => {
    const options = menu[slotCategory(slot)];
    const meal = options[used[slotCategory(slot)]++ % options.length];
    return { slot, mealId: meal.id };
  });
}

export function isAllowedSelection(date: string, programId: ProgramId, slot: Slot, mealId: string) {
  return menuFor(date, programId)[slotCategory(slot)].some((meal) => meal.id === mealId);
}

export const scaled = (meal: Meal, programId: ProgramId) => {
  const k = PROGRAMS_BY_ID[programId]?.portion ?? 1;
  return { kcal: Math.round(meal.kcal * k), protein: Math.round(meal.protein * k), carbs: Math.round(meal.carbs * k), fat: Math.round(meal.fat * k) };
};
