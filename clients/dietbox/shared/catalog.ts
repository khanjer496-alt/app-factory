// Single source of truth for the Dietbox menu, programmes and pricing.
// Imported by the UI (display) and the Worker (validation + authoritative price).
// Dishes and photos are Diet Box's own menu (talabat listing). Nutrition is reconciled from the kitchen's listed values and
// the photographed portions (see MENU_NUTRITION.md) and must be verified by the kitchen/dietitian before launch.

export type Category = "breakfast" | "main" | "snack";
export type Slot = "breakfast" | "lunch" | "dinner" | "snack1" | "snack2";
export type Tag = "high-protein" | "low-carb" | "vegetarian" | "vegan" | "spicy";
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
  m("halloumi-wrap", "Halloumi Wrap", "breakfast", [344, 18, 32, 16], ["vegetarian"], ["gluten", "dairy"], "Grilled halloumi, crisp lettuce and tomato in a wholewheat wrap."),
  m("turkey-cheese-sandwich", "Turkey & Cheese Sandwich", "breakfast", [332, 28, 30, 11], ["high-protein"], ["gluten", "dairy"], "Sliced turkey, cheese, lettuce and tomato on brown bread."),
  m("blueberry-pancakes", "Blueberry Pancakes", "breakfast", [320, 9, 48, 10], ["vegetarian"], ["gluten", "egg", "dairy"], "Fluffy pancakes with fresh blueberries and a drizzle of syrup."),
  m("mushroom-omelette", "Mushroom Omelette", "breakfast", [348, 24, 18, 20], ["low-carb", "vegetarian"], ["egg", "dairy", "gluten"], "Soft eggs with mushrooms and cheese, and a slice of toast."),
  m("strawberry-oats", "Oats with Strawberry", "breakfast", [290, 11, 41, 9], ["vegetarian"], ["gluten", "dairy"], "Oats cooked in milk with fresh strawberries and a touch of honey."),
  m("cheese-french-toast", "Cheese French Toast", "breakfast", [385, 19, 32, 20], ["vegetarian"], ["gluten", "egg", "dairy"], "Golden egg-dipped toast with melted cheese."),
  m("spanish-omelette", "Spanish Omelette", "breakfast", [322, 22, 18, 18], ["low-carb", "vegetarian"], ["egg", "dairy", "gluten"], "Eggs, spinach and cheese, with a slice of toast."),
  m("peanut-butter-toast", "Peanut Butter Toast", "breakfast", [285, 11, 24, 16], ["vegetarian"], ["gluten", "nuts"], "Brown toast spread thick with peanut butter."),
  m("labneh-zaatar", "Labneh & Za'atar", "breakfast", [242, 13, 34, 6], ["vegetarian"], ["gluten", "dairy", "sesame"], "Creamy labneh and za'atar on wholewheat bread."),
  m("egg-cheese-bun", "Egg & Cheese Bun", "breakfast", [320, 17, 29, 15], ["vegetarian"], ["gluten", "egg", "dairy"], "Fried egg, cheese, lettuce and tomato in a wholewheat bun."),
  m("egg-cheese-wrap", "Egg & Cheese Wrap", "breakfast", [380, 24, 31, 18], ["vegetarian"], ["gluten", "egg", "dairy"], "Scrambled eggs, cheese and greens in a tortilla."),
  m("five-egg-omelette", "Five-Egg Omelette", "breakfast", [440, 34, 17, 26], ["high-protein", "low-carb", "vegetarian"], ["egg", "gluten"], "Five whole eggs, cooked soft, with brown toast."),
  m("egg-white-omelette", "Egg-White Omelette", "breakfast", [215, 21, 16, 7], ["high-protein", "low-carb", "vegetarian"], ["egg", "gluten"], "Five egg whites with brown toast. Light and lean."),

  // Mains: rice plates, pasta and risotto, burgers and wraps, meal salads
  m("mushroom-chicken", "Creamy Mushroom Chicken", "main", [510, 50, 48, 13], ["high-protein"], ["dairy"], "Chicken in a creamy mushroom sauce, with white rice."),
  m("chicken-biryani", "Chicken Biryani", "main", [488, 44, 42, 16], ["high-protein"], ["dairy"], "Fragrant basmati layered with spiced chicken."),
  m("butter-chicken", "Butter Chicken", "main", [570, 44, 42, 25], ["high-protein"], ["dairy"], "Tender chicken in a rich tomato-butter sauce, with basmati rice."),
  m("sweet-chilli-chicken", "Sweet & Spicy Chicken", "main", [500, 40, 46, 17], ["high-protein", "spicy"], ["gluten"], "Chicken and peppers in a sweet chilli glaze, with oven-roasted potatoes."),
  m("chicken-tikka", "Chicken Tikka", "main", [455, 42, 42, 13], ["high-protein"], ["dairy"], "Char-grilled tikka chicken with peppers and onion, basmati rice and lemon."),
  m("chicken-tikka-masala", "Chicken Tikka Masala", "main", [576, 42, 48, 24], ["high-protein"], ["dairy"], "Chicken tikka in a spiced masala sauce, with basmati rice."),
  m("bbq-chicken", "BBQ Chicken", "main", [518, 42, 38, 22], ["high-protein"], [], "Chicken glazed in smoky barbecue sauce, with basmati rice."),
  m("chicken-curry", "Chicken Curry", "main", [590, 47, 42, 26], ["high-protein"], ["dairy"], "Chicken in a golden, mildly spiced curry sauce, with basmati rice."),
  m("grilled-chicken", "Grilled Chicken & Rice", "main", [499, 54, 46, 11], ["high-protein"], [], "Sliced grilled chicken breast with lemon, a light sauce and basmati rice."),
  m("dynamite-chicken", "Dynamite Chicken", "main", [462, 46, 11, 26], ["high-protein", "low-carb", "spicy"], ["gluten", "egg"], "Crispy chicken in a creamy, spicy dynamite sauce on a bed of lettuce."),
  m("white-fish", "Grilled White Fish", "main", [452, 40, 46, 12], ["high-protein"], ["fish", "dairy"], "Grilled white fish with mushroom sauce and basmati rice."),
  m("tuna-rice-bowl", "Tuna Rice Bowl", "main", [428, 35, 45, 12], ["high-protein"], ["fish"], "Flaked tuna folded through rice with parsley and lemon."),
  m("shrimp-biryani", "Shrimp Biryani", "main", [459, 35, 55, 11], ["high-protein"], ["shellfish", "dairy"], "Spiced shrimp with fragrant biryani rice."),
  m("meat-biryani", "Meat Biryani", "main", [606, 44, 58, 22], ["high-protein"], ["dairy"], "Tender spiced meat with biryani rice and a side of raita."),
  m("beef-mushrooms", "Beef with Mushrooms", "main", [567, 44, 46, 23], ["high-protein"], ["dairy"], "Beef strips and mushrooms in a savoury sauce, with basmati rice."),
  m("steak-mash", "Steak & Mash", "main", [544, 43, 30, 28], ["high-protein"], ["dairy"], "Seared steak with creamy mashed potato and parsley."),
  m("butter-chicken-pasta", "Butter Chicken Pasta", "main", [615, 47, 55, 23], ["high-protein"], ["gluten", "dairy"], "Penne and chicken in a creamy butter-chicken sauce with parmesan."),
  m("rose-chicken-pasta", "Chicken Pasta, Rosé Sauce", "main", [570, 48, 51, 19], ["high-protein"], ["gluten", "dairy"], "Penne and chicken in a creamy tomato sauce with parmesan."),
  m("buffalo-chicken-pasta", "Buffalo Chicken Pasta", "main", [614, 46, 55, 23], ["high-protein", "spicy"], ["gluten", "dairy"], "Penne and chicken in a spicy buffalo cream sauce."),
  m("white-chicken-pasta", "Chicken Pasta, White Sauce", "main", [551, 40, 55, 19], ["high-protein"], ["gluten", "dairy"], "Penne and chicken in a light white sauce with parmesan."),
  m("red-chicken-pasta", "Chicken Pasta, Red Sauce", "main", [512, 44, 48, 16], ["high-protein"], ["gluten", "dairy"], "Penne and grilled chicken in tomato sauce with parmesan."),
  m("white-shrimp-pasta", "Shrimp Pasta, White Sauce", "main", [521, 38, 45, 21], ["high-protein"], ["gluten", "dairy", "shellfish"], "Penne and shrimp in a light white sauce."),
  m("rose-shrimp-pasta", "Shrimp Pasta, Rosé Sauce", "main", [533, 44, 51, 17], ["high-protein"], ["gluten", "dairy", "shellfish"], "Penne and shrimp in a creamy tomato sauce."),
  m("chicken-risotto", "Chicken Risotto", "main", [590, 46, 52, 22], ["high-protein"], ["dairy"], "Creamy risotto with chicken and parmesan."),
  m("shrimp-risotto", "Shrimp Risotto", "main", [562, 39, 52, 22], ["high-protein"], ["dairy", "shellfish"], "Creamy risotto with shrimp and parmesan."),
  m("spaghetti-bolognese", "Spaghetti Bolognese", "main", [518, 41, 48, 18], ["high-protein"], ["gluten", "dairy"], "Spaghetti with beef bolognese and parmesan."),
  m("chicken-lasagna", "Chicken Lasagna", "main", [610, 30, 55, 30], ["high-protein"], ["gluten", "dairy", "egg"], "Layers of pasta, chicken, low-fat cheese and a light tomato sauce."),
  m("classic-chicken-burger", "Classic Chicken Burger", "main", [431, 35, 30, 19], ["high-protein"], ["gluten", "dairy", "egg"], "Chicken patty, cheese, lettuce and Diet Box sauce in a wholewheat bun."),
  m("grilled-chicken-burger", "Grilled Chicken Burger", "main", [390, 36, 30, 14], ["high-protein"], ["gluten", "dairy", "egg"], "Grilled chicken breast, cheese and lettuce in a wholewheat bun."),
  m("mushroom-chicken-burger", "Mushroom Chicken Burger", "main", [386, 35, 30, 14], ["high-protein"], ["gluten", "dairy", "egg"], "Grilled chicken with mushrooms, cheese, lettuce and Diet Box sauce."),
  m("buffalo-chicken-burger", "Buffalo Chicken Burger", "main", [470, 38, 30, 22], ["high-protein", "spicy"], ["gluten", "dairy", "egg"], "Chicken in spicy buffalo sauce with cheese and lettuce."),
  m("classic-beef-burger", "Classic Beef Burger", "main", [476, 34, 31, 24], ["high-protein"], ["gluten", "dairy", "egg"], "Grilled beef patty, cheese, lettuce and Diet Box sauce."),
  m("mushroom-beef-burger", "Mushroom Beef Burger", "main", [494, 36, 38, 22], ["high-protein"], ["gluten", "dairy", "egg"], "Beef patty with mushroom sauce, cheese and lettuce."),
  m("buffalo-chicken-wrap", "Buffalo Chicken Wrap", "main", [386, 34, 31, 14], ["high-protein", "spicy"], ["gluten", "dairy"], "Buffalo chicken, greens and cheese in a wholewheat wrap."),
  m("chicken-fajita-wrap", "Chicken Fajita Wrap", "main", [377, 34, 31, 13], ["high-protein"], ["gluten", "dairy"], "Fajita chicken with peppers in a wholewheat wrap."),
  m("philly-steak-wrap", "Philly Cheese Steak Wrap", "main", [420, 35, 34, 16], ["high-protein"], ["gluten", "dairy"], "Sliced beef, peppers and melted cheese in a wholewheat wrap."),
  m("beef-sandwich", "Beef Sandwich", "main", [490, 35, 38, 22], ["high-protein"], ["gluten", "dairy"], "Toasted brown bread with sliced beef and cheese."),
  m("chicken-wrap", "Chicken Wrap", "main", [357, 30, 30, 13], ["high-protein"], ["gluten", "dairy"], "Grilled chicken, greens and cheese in a wholewheat wrap."),
  m("chicken-sandwich", "Chicken Sandwich", "main", [453, 37, 38, 17], ["high-protein"], ["gluten", "dairy"], "Toasted brown bread with grilled chicken and cheese."),
  m("tuna-sandwich", "Tuna Sandwich", "main", [343, 32, 29, 11], ["high-protein"], ["gluten", "fish"], "Tuna, lettuce and sweetcorn in a wholewheat wrap."),
  m("chicken-tikka-caesar", "Chicken Tikka Caesar", "main", [411, 48, 12, 19], ["high-protein", "low-carb"], ["gluten", "dairy", "egg", "fish"], "Chicken tikka, lettuce, parmesan and croutons with a light Caesar dressing."),
  m("chicken-caesar", "Chicken Caesar", "main", [402, 48, 12, 18], ["high-protein", "low-carb"], ["gluten", "dairy", "egg", "fish"], "Grilled chicken, lettuce, parmesan and croutons with a light Caesar dressing."),
  m("chicken-caesar-pasta", "Chicken Caesar Pasta Salad", "main", [415, 40, 30, 15], ["high-protein"], ["gluten", "dairy", "egg", "fish"], "Chicken, penne and lettuce with parmesan and a light Caesar dressing."),
  m("tuna-caesar", "Tuna Caesar", "main", [318, 36, 12, 14], ["high-protein", "low-carb"], ["gluten", "dairy", "egg", "fish"], "Tuna, lettuce, parmesan and croutons with a light Caesar dressing."),
  m("keto-chicken-salad", "Low-Carb Chicken Salad", "main", [403, 46, 12, 19], ["high-protein", "low-carb"], [], "Grilled chicken, carrot, peppers and cucumber with lemon and olive oil."),
  m("tuna-salad", "Tuna Salad", "main", [312, 33, 18, 12], ["high-protein", "low-carb"], ["fish"], "Tuna with sweetcorn, peppers, cucumber and a lemon dressing."),

  // Snacks: side salads and sweets
  m("greek-salad", "Greek Salad", "snack", [207, 8, 10, 15], ["low-carb", "vegetarian"], ["dairy"], "Low-fat feta, olives, tomato, cucumber and peppers with lemon dressing."),
  m("green-salad", "Green Salad", "snack", [134, 4, 16, 6], ["low-carb", "vegetarian", "vegan"], [], "Peppers, sweetcorn, cucumber and lettuce with lemon dressing."),
  m("tabbouleh", "Tabbouleh", "snack", [149, 3, 14, 9], ["low-carb", "vegetarian", "vegan"], ["gluten"], "Parsley, tomato, onion, bulgur and mint with lemon."),
  m("rocket-salad", "Rocket Salad", "snack", [173, 6, 8, 13], ["low-carb", "vegetarian"], ["dairy", "nuts"], "Rocket, low-fat feta, walnuts and peppers with a spicy lemon dressing."),
  m("energy-balls", "Energy Balls", "snack", [121, 4, 15, 5], ["vegetarian"], ["nuts"], "Two bite-size balls rolled in coconut."),
  m("brownies", "Brownies", "snack", [328, 6, 40, 16], ["vegetarian"], ["gluten", "egg", "dairy"], "Two squares of rich chocolate brownie."),
  m("fudge-cookies", "Fudge Chocolate Cookies", "snack", [298, 5, 38, 14], ["vegetarian"], ["gluten", "egg", "dairy"], "Two soft, fudgy chocolate cookies."),
  m("chocolate-chip-cookie", "Chocolate Chip Cookie", "snack", [277, 4, 36, 13], ["vegetarian"], ["gluten", "egg", "dairy"], "One big chocolate chip cookie."),
  m("vanilla-cake", "Vanilla Cake", "snack", [316, 7, 45, 12], ["vegetarian"], ["gluten", "egg", "dairy"], "Two squares of soft vanilla sponge."),
];

export const MEALS_BY_ID: Record<string, Meal> = Object.fromEntries(MEALS.map((meal) => [meal.id, meal]));

export type ProgramId = "lean" | "balance" | "muscle" | "keto";

export interface Program {
  id: ProgramId;
  name: string;
  goal: string;
  tagline: string;
  description: string;
  kcalRange: [number, number];
  /** Portion multiplier applied to the base recipe. */
  portion: number;
  /** Price per lunch/dinner in fils (AED × 100), VAT inclusive. Set below the same dish on delivery apps. */
  mealPriceFils: number;
  /** Price per breakfast in fils, VAT inclusive. */
  breakfastPriceFils: number;
  split: { protein: number; carbs: number; fat: number };
  image: string;
  eligible: (meal: Meal) => boolean;
}

const any = () => true;
export const PROGRAMS: Program[] = [
  { id: "lean", name: "Lean", goal: "Lose fat", tagline: "Cut without the hunger.", description: "Calorie-controlled portions with high protein to keep you full.", kcalRange: [1200, 1600], portion: 0.85, mealPriceFils: 2900, breakfastPriceFils: 2200, split: { protein: 0.35, carbs: 0.35, fat: 0.3 }, image: "/meals/grilled-chicken.webp", eligible: any },
  { id: "balance", name: "Balance", goal: "Maintain", tagline: "Everyday fuel, dialled in.", description: "Balanced macros for energy, focus and consistency.", kcalRange: [1700, 2100], portion: 1, mealPriceFils: 3200, breakfastPriceFils: 2400, split: { protein: 0.3, carbs: 0.4, fat: 0.3 }, image: "/meals/butter-chicken.webp", eligible: any },
  { id: "muscle", name: "Muscle", goal: "Build muscle", tagline: "Bigger plates. Bigger lifts.", description: "Larger portions with extra protein and carbs to support training.", kcalRange: [2300, 3000], portion: 1.3, mealPriceFils: 3900, breakfastPriceFils: 2900, split: { protein: 0.35, carbs: 0.45, fat: 0.2 }, image: "/meals/steak-mash.webp", eligible: any },
  // id stays "keto" so existing orders keep working; the menu supports low carb (≤ 20 g a meal), not strict keto.
  { id: "keto", name: "Low Carb", goal: "Low carb", tagline: "Carbs down. Protein up.", description: "Egg breakfasts, big salads and protein-led mains, each under 20 g of carbs.", kcalRange: [1300, 1800], portion: 1, mealPriceFils: 3400, breakfastPriceFils: 2600, split: { protein: 0.4, carbs: 0.15, fat: 0.45 }, image: "/meals/dynamite-chicken.webp", eligible: (meal) => meal.tags.includes("low-carb") },
];

export const PROGRAMS_BY_ID: Record<string, Program> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

export const SNACK_PRICE_FILS = 1500;
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
  const slotPrice = { breakfast: program.breakfastPriceFils, main: program.mealPriceFils, snack: SNACK_PRICE_FILS };
  const perDay = slots.reduce((sum, slot) => sum + slotPrice[slotCategory(slot)], 0);
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
  // Orders from before the Plant programme was retired fall back to the Balance menu.
  const program = PROGRAMS_BY_ID[programId] ?? PROGRAMS_BY_ID.balance;
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
