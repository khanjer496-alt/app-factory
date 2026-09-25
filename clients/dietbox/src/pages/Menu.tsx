import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { MEALS, type Allergen, type Category, type Meal, type Tag } from "../../shared/catalog";
import { Arrow, Eyebrow } from "../components/brand";
import { EASE_OUT, Lines } from "../components/motion";
import { MealCard, MealDetail, Sheet } from "../components/meal";
import { Footer } from "../components/layout";
import { useI18n } from "../i18n";

const DIETS: Tag[] = ["high-protein", "low-carb", "vegetarian", "spicy"];
const ALLERGENS: Allergen[] = ["gluten", "dairy", "egg", "nuts", "sesame", "fish", "shellfish"];

export default function Menu() {
  const { t, c } = useI18n();
  const cats: [Category | "all", string][] = [["all", t("Everything")], ["breakfast", t("Breakfast")], ["main", t("Lunch & dinner")], ["snack", t("Snacks")]];
  const [cat, setCat] = useState<Category | "all">("all");
  const [diets, setDiets] = useState<Tag[]>([]);
  const [avoid, setAvoid] = useState<Allergen[]>([]);
  const [open, setOpen] = useState<Meal | null>(null);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const meals = useMemo(() => MEALS.filter((m) =>
    (cat === "all" || m.category === cat)
    && diets.every((d) => m.tags.includes(d))
    && !avoid.some((a) => m.allergens.includes(a))), [cat, diets, avoid]);

  return (
    <>
      <section className="menuHero">
        <div className="menuHeroInner">
          <Eyebrow tone="dark">{t("The menu · {n} dishes in rotation", { n: MEALS.length })}</Eyebrow>
          <Lines as="h1" immediate className="display xl" lines={[t("Cooked this"), <em key="m">{t("morning.")}</em>]} />
          <p className="heroLead">{t("Each programme gets its own rotating daily menu from this list. Swap any dish in your plan until 48 hours before delivery.")}</p>
        </div>
      </section>
      <main className="section menuPage">
        <div className="menuFilters">
          <div className="filterPills" role="tablist" aria-label={t("Category")}>
            {cats.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={cat === id} className={`pill ${cat === id ? "on" : ""}`} onClick={() => setCat(id)} type="button">
                {cat === id && <motion.span layoutId="menuCat" className="pillBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="pillText">{label}</span>
              </button>
            ))}
          </div>
          <div className="chipFilters">
            <span className="fieldLabel">{t("Diet")}</span>
            {DIETS.map((d) => <button key={d} type="button" aria-pressed={diets.includes(d)} className={`tagToggle ${diets.includes(d) ? "on" : ""}`} onClick={() => setDiets(toggle(diets, d))}>{c.tag(d)}</button>)}
          </div>
          <div className="chipFilters">
            <span className="fieldLabel">{t("Avoid")}</span>
            {ALLERGENS.map((a) => <button key={a} type="button" aria-pressed={avoid.includes(a)} className={`tagToggle avoid ${avoid.includes(a) ? "on" : ""}`} onClick={() => setAvoid(toggle(avoid, a))}>{c.allergen(a)}</button>)}
          </div>
        </div>
        <p className="resultCount" aria-live="polite">{meals.length === 1 ? t("1 dish") : t("{n} dishes", { n: meals.length })}</p>
        <motion.div className="mealGrid" layout>
          <AnimatePresence mode="popLayout">
            {meals.map((meal, i) => (
              <motion.div key={meal.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: Math.min(i, 12) * 0.03, ease: EASE_OUT } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <MealCard meal={meal} onOpen={() => setOpen(meal)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {meals.length === 0 && (
          <div className="empty">
            <h3>{t("Nothing matches every filter.")}</h3>
            <button className="btn secondary" type="button" onClick={() => { setDiets([]); setAvoid([]); setCat("all"); }}>{t("Clear filters")}</button>
          </div>
        )}
        <div className="menuCta">
          <h2 className="display l">{t("Like what you see?")}</h2>
          <Link to="/start" className="btn primary lg">{t("Build my plan")} <Arrow /></Link>
        </div>
      </main>
      <Footer />
      <Sheet open={!!open} onClose={() => setOpen(null)} label={open ? c.meal(open) : t("Meal")}>
        {open && <MealDetail meal={open} footer={<Link className="btn primary" to="/start">{t("Get it in my plan")} <Arrow /></Link>} />}
      </Sheet>
    </>
  );
}
