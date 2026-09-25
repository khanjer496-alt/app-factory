import type { ProgramId } from "../../shared/catalog";
import type { Body } from "../../shared/nutrition";

export interface Draft {
  step: number;
  program: ProgramId;
  body: Body | null;
  kcalTarget: number | null;
  mealsPerDay: number;
  daysPerWeek: number;
  weeks: number;
  startDate: string;
  deliverySlot: string;
  address: { emirate: string; area: string; street: string; unit: string; phone: string; notes: string };
}

const KEY = "dietbox:plan-draft";

export function loadDraft(): Partial<Draft> | null {
  try { const raw = sessionStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function saveDraft(draft: Draft) {
  try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* storage unavailable: builder still works in memory */ }
}
export function clearDraft() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
