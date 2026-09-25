import { PROGRAMS_BY_ID, type ProgramId } from "./catalog";

export type Sex = "male" | "female";
export type Goal = "lose" | "maintain" | "gain";

export const ACTIVITY = [
  { id: 1.2, label: "Desk job", hint: "Little or no training" },
  { id: 1.375, label: "Light", hint: "1–3 sessions a week" },
  { id: 1.55, label: "Active", hint: "3–5 sessions a week" },
  { id: 1.725, label: "Athlete", hint: "6–7 hard sessions" },
] as const;

export const GOAL_PROGRAM: Record<Goal, ProgramId> = { lose: "lean", maintain: "balance", gain: "muscle" };
const GOAL_FACTOR: Record<Goal, number> = { lose: 0.8, maintain: 1, gain: 1.12 };

export interface Body { sex: Sex; age: number; weightKg: number; heightCm: number; activity: number; goal: Goal }

/** Mifflin–St Jeor BMR × activity × goal adjustment. Guidance only, not medical advice. */
export function dailyTarget(body: Body): number {
  const bmr = 10 * body.weightKg + 6.25 * body.heightCm - 5 * body.age + (body.sex === "male" ? 5 : -161);
  const kcal = bmr * body.activity * GOAL_FACTOR[body.goal];
  return Math.max(1200, Math.round(kcal / 10) * 10);
}

export function macroSplit(kcal: number, programId: ProgramId) {
  const s = (PROGRAMS_BY_ID[programId] ?? PROGRAMS_BY_ID.balance).split;
  return { kcal, protein: Math.round((kcal * s.protein) / 4), carbs: Math.round((kcal * s.carbs) / 4), fat: Math.round((kcal * s.fat) / 9) };
}
