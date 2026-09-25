import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { MEALS, type Allergen, type Category, type Meal, type Tag } from "../../shared/catalog";
import { Arrow, Eyebrow, Ticker } from "../components/brand";
import { EASE_OUT, Lines } from "../components/motion";
import { MealCard, MealDetail, Sheet, tagLabel } from "../components/meal";
import { Footer } from "../components/layout";

const CATS: [Category | "all", string][] = [["all", "Everything"], ["breakfast", "Breakfast"], ["main", "Lunch & dinner"], ["snack", "Snacks"]];
const DIETS: Tag[] = ["high-protein", "vegetarian", "vegan", "keto", "gluten-free", "dairy-free"];
const ALLERGENS: Allergen[] = ["gluten", "dairy", "egg", "nuts", "sesame", "soy", "fish"];

export default function Menu() {
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
          <Eyebrow tone="dark">The menu · {MEALS.length} dishes in rotation</Eyebrow>
          <Lines as="h1" immediate className="display xl" lines={["Cooked this", <em key="m">morning.</em>]} />
          <div className="menuFan" aria-hidden>
            {["sirloin-chimichurri", "buddha-bowl", "protein-pancakes"].map((id, i) => (
              <motion.img key={id} src={`/meals/${id}.webp`} alt="" initial={{ opacity: 0, y: 60, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: [-8, 3, 10][i] }} transition={{ delay: 0.3 + i * 0.12, duration: 1, ease: EASE_OUT }} />
            ))}
          </div>
          <p className="heroLead">Each programme gets its own rotating daily menu from this list. Swap any dish in your plan until 48 hours before delivery.</p>
        </div>
      </section>
      <Ticker tone="carbon" reverse items={MEALS.slice(0, 12).map((m) => m.name)} />
      <main className="section menuPage">
        <div className="menuFilters">
          <div className="filterPills" role="tablist" aria-label="Category">
            {CATS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={cat === id} className={`pill ${cat === id ? "on" : ""}`} onClick={() => setCat(id)} type="button">
                {cat === id && <motion.span layoutId="menuCat" className="pillBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="pillText">{label}</span>
              </button>
            ))}
          </div>
          <div className="chipFilters">
            <span className="fieldLabel">Diet</span>
            {DIETS.map((d) => <button key={d} type="button" aria-pressed={diets.includes(d)} className={`tagToggle ${diets.includes(d) ? "on" : ""}`} onClick={() => setDiets(toggle(diets, d))}>{tagLabel(d)}</button>)}
          </div>
          <div className="chipFilters">
            <span className="fieldLabel">Avoid</span>
            {ALLERGENS.map((a) => <button key={a} type="button" aria-pressed={avoid.includes(a)} className={`tagToggle avoid ${avoid.includes(a) ? "on" : ""}`} onClick={() => setAvoid(toggle(avoid, a))}>{a}</button>)}
          </div>
        </div>
        <p className="resultCount" aria-live="polite">{meals.length} dish{meals.length === 1 ? "" : "es"}</p>
        <motion.div className="mealGrid" layout>
          <AnimatePresence mode="popLayout">
            {meals.map((meal, i) => (
              <motion.div key={meal.id} layout initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: Math.min(i, 12) * 0.03, ease: EASE_OUT } }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}>
                <MealCard meal={meal} onOpen={() => setOpen(meal)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {meals.length === 0 && (
          <div className="empty">
            <h3>Nothing matches every filter.</h3>
            <button className="btn secondary" type="button" onClick={() => { setDiets([]); setAvoid([]); setCat("all"); }}>Clear filters</button>
          </div>
        )}
        <div className="menuCta">
          <h2 className="display l">Like what you see?</h2>
          <Link to="/start" className="btn primary lg">Build my plan <Arrow /></Link>
        </div>
      </main>
      <Footer />
      <Sheet open={!!open} onClose={() => setOpen(null)} label={open?.name || "Meal"}>
        {open && <MealDetail meal={open} footer={<Link className="btn primary" to="/start">Get it in my plan <Arrow /></Link>} />}
      </Sheet>
    </>
  );
}
