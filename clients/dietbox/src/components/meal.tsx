import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Meal } from "../../shared/catalog";
import { EASE_OUT } from "./motion";

type Macros = { kcal: number; protein: number; carbs: number; fat: number };

const TAG_LABEL: Record<string, string> = {
  "high-protein": "High protein", vegetarian: "Vegetarian", vegan: "Vegan", keto: "Keto", "gluten-free": "Gluten-free", "dairy-free": "Dairy-free", spicy: "Spicy",
};
export const tagLabel = (tag: string) => TAG_LABEL[tag] || tag;

export function MacroChips({ m, compact = false }: { m: Macros; compact?: boolean }) {
  return (
    <div className={`macroChips ${compact ? "compact" : ""}`}>
      <span className="chip kcal"><b>{m.kcal}</b> kcal</span>
      <span className="chip protein"><b>{m.protein}g</b> P</span>
      <span className="chip carbs"><b>{m.carbs}g</b> C</span>
      <span className="chip fat"><b>{m.fat}g</b> F</span>
    </div>
  );
}

export function MealCard({ meal, macros, onOpen, badge, action }: { meal: Meal; macros?: Macros; onOpen?: () => void; badge?: ReactNode; action?: ReactNode }) {
  const m = macros || meal;
  return (
    <article className="mealCard">
      <button className="mealMedia" onClick={onOpen} aria-label={`View ${meal.name}`} type="button">
        <img src={meal.image} alt="" loading="lazy" width={720} height={720} />
        <span className="kcalBadge"><b>{m.kcal}</b><small>kcal</small></span>
        {badge}
      </button>
      <div className="mealBody">
        <h3>{meal.name}</h3>
        <MacroChips m={m} compact />
        {action}
      </div>
    </article>
  );
}

/** Four-segment macro ring. Segment lengths are energy share (P,C ×4 · F ×9). */
export function MacroRing({ m, size = 220, label = "kcal / day", stroke = 16 }: { m: Macros; size?: number; label?: string; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const energy = [m.protein * 4, m.carbs * 4, m.fat * 9];
  const total = energy.reduce((a, b) => a + b, 0) || 1;
  const gap = 6;
  let offset = 0;
  const segs = energy.map((e, i) => {
    const len = Math.max(0, (e / total) * c - gap);
    const seg = { len, offset, cls: ["protein", "carbs", "fat"][i] };
    offset += (e / total) * c;
    return seg;
  });
  return (
    <div className="macroRing" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="ringTrack" strokeWidth={stroke} fill="none" />
        {segs.map((s) => (
          <circle
            key={s.cls}
            cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
            className={`ringSeg ${s.cls}`}
            strokeDasharray={`${s.len} ${c}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="ringCenter">
        <strong className="tabular">{m.kcal.toLocaleString()}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function NutritionLabel({ meal, macros }: { meal: Meal; macros?: Macros }) {
  const m = macros || meal;
  const energy = m.protein * 4 + m.carbs * 4 + m.fat * 9 || 1;
  const rows: [string, number, string][] = [["Protein", m.protein, "protein"], ["Carbohydrate", m.carbs, "carbs"], ["Fat", m.fat, "fat"]];
  return (
    <div className="nutritionLabel">
      <div className="nlHead">Nutrition<br />Facts</div>
      <div className="nlRule thick" />
      <div className="nlRow big"><span>Calories</span><b className="tabular">{m.kcal}</b></div>
      <div className="nlRule mid" />
      {rows.map(([label, grams, cls]) => {
        const pct = Math.round(((cls === "fat" ? grams * 9 : grams * 4) / energy) * 100);
        return (
          <div className="nlRow" key={cls}>
            <span>{label}</span>
            <span className="nlBarWrap"><motion.i className={`nlBar ${cls}`} initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }} /></span>
            <b className="tabular">{grams}g</b>
          </div>
        );
      })}
      <div className="nlRule" />
      <p className="nlFoot">Contains: {meal.allergens.length ? meal.allergens.join(", ") : "none of the 8 major allergens"}. Values are indicative per portion.</p>
    </div>
  );
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheetRoot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }}>
          <div className="sheetScrim" onClick={onClose} />
          <motion.div
            className="sheet" role="dialog" aria-modal="true" aria-label={label}
            initial={{ transform: "translateY(40px) scale(0.98)", opacity: 0 }}
            animate={{ transform: "translateY(0px) scale(1)", opacity: 1, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } }}
            exit={{ transform: "translateY(24px) scale(0.98)", opacity: 0, transition: { duration: 0.18 } }}
          >
            <button className="sheetClose" onClick={onClose} aria-label="Close" type="button">×</button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MealDetail({ meal, macros, footer }: { meal: Meal; macros?: Macros; footer?: ReactNode }) {
  return (
    <div className="mealDetail">
      <div className="mdMedia"><img src={meal.image} alt={meal.name} /></div>
      <div className="mdBody">
        <span className="eyebrow"><i className="dot" />{meal.category === "main" ? "Lunch & dinner" : meal.category}</span>
        <h2 className="display">{meal.name}</h2>
        <p className="lead">{meal.description}</p>
        <div className="tagRow">{meal.tags.map((t) => <span key={t} className="tag">{tagLabel(t)}</span>)}</div>
        <NutritionLabel meal={meal} macros={macros} />
        {footer}
      </div>
    </div>
  );
}
