import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { MEALS, MEALS_BY_ID, PROGRAMS, PROGRAMS_BY_ID, quote, type Meal, type ProgramId } from "../../shared/catalog";
import { ACTIVITY, GOAL_PROGRAM, dailyTarget, macroSplit, type Body, type Goal } from "../../shared/nutrition";
import { Arrow, Eyebrow, Ticker } from "../components/brand";
import { Counter, EASE_OUT, Lines, Reveal } from "../components/motion";
import { MacroRing, MealCard, MealDetail, Sheet } from "../components/meal";
import { Footer } from "../components/layout";
import { aed } from "../lib/format";
import { useI18n } from "../i18n";

export default function Landing() {
  const { t, c } = useI18n();
  const [openMeal, setOpenMeal] = useState<Meal | null>(null);
  return (
    <>
      <Hero />
      <Ticker items={[t("High protein"), t("Chef-cooked daily"), t("Macro-counted"), t("Delivered 5–8 AM"), t("Swap any meal"), t("Skip any day")]} />
      <Goals />
      <HowItWorks />
      <MenuPreview onOpen={setOpenMeal} />
      <Calculator />
      <Pricing />
      <Guarantees />
      <Faq />
      <FinalCta />
      <Footer />
      <Sheet open={!!openMeal} onClose={() => setOpenMeal(null)} label={openMeal ? c.meal(openMeal) : t("Meal")}>
        {openMeal && <MealDetail meal={openMeal} footer={<Link className="btn primary" to="/start">{t("Get it in my plan")} <Arrow /></Link>} />}
      </Sheet>
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Spring-smoothed pointer tilt: decorative, so it gets momentum instead of 1:1 tracking.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 120, damping: 18 });
  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  const hero = MEALS_BY_ID["avocado-quinoa-bowl"];
  return (
    <section className="hero" ref={ref} onPointerMove={onMove}>
      <div className="heroNoise" aria-hidden />
      <div className="heroGrid">
        <motion.div className="heroCopy" style={{ y: copyY, opacity: fade }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
            <Eyebrow tone="dark">{t("Meal plans · Delivered daily across the UAE")}</Eyebrow>
          </motion.div>
          <Lines as="h1" immediate className="display xl" lines={[t("Eat for the"), t("body you're"), <em key="b">{t("building.")}</em>]} />
          <motion.p className="heroLead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: EASE_OUT }}>
            {t("Chef-cooked meals, weighed to your macros and at your door by 8 AM.")}
          </motion.p>
          <motion.div className="heroActions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: EASE_OUT }}>
            <Link to="/start" className="btn primary lg">{t("Build my plan")} <Arrow /></Link>
            <Link to="/menu" className="btn ghost lg onDark">{t("See the menu")}</Link>
          </motion.div>
        </motion.div>

        <div className="heroVisual">
          <motion.div className="heroDisc" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: EASE_OUT }} />
          <motion.div className="heroPlateWrap" style={{ rotateX: rx, rotateY: ry }} initial={{ opacity: 0, scale: 0.9, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.1 }}>
            <img className="heroPlate" src="/scenes/hero-bowl.webp" alt={t("Avocado quinoa bowl")} width={1600} height={1600} fetchPriority="high" />
          </motion.div>
          <motion.span className="heroChip c2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7, ease: EASE_OUT }}>
            <span className="float"><b>{hero.kcal}</b> {t("kcal")}</span>
          </motion.span>
          <motion.span className="heroChip c3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.7, ease: EASE_OUT }}>
            <span className="float"><span className="pulse" /> {t("Delivered 5–8 AM")}</span>
          </motion.span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Goals --------------------------------- */

function Goals() {
  const { t, c } = useI18n();
  return (
    <section className="section goals" id="goals">
      <div className="sectionHead center">
        <Eyebrow>{t("Five programmes")}</Eyebrow>
        <Lines className="display l" lines={[t("Pick your goal."), <em key="w">{t("We'll do the maths.")}</em>]} />
      </div>
      <div className="goalGrid">
        {PROGRAMS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05} className="goalCell">
            <Link to={`/start?program=${p.id}`} className="goalCard">
              <img className="goalThumb" src={p.image} alt="" loading="lazy" width={120} height={120} />
              <div className="goalText">
                <span className="goalGoal">{c.programGoal(p)}</span>
                <h3 className="display s">{c.program(p)}</h3>
                <span className="goalMeta">{t("{min}–{max} kcal", { min: p.kcalRange[0], max: p.kcalRange[1] })}</span>
              </div>
              <span className="goalFrom">{t("from {price}/meal", { price: aed(p.mealPriceFils) })} <Arrow /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- How it works ------------------------------ */

function HowItWorks() {
  const { t } = useI18n();
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const steps = [
    [t("Pick your goal"), t("Five programmes, each with its own portions and macro split.")],
    [t("Set your numbers"), t("We turn your height, weight and training into a daily calorie target.")],
    [t("Choose your rhythm"), t("2–5 meals a day, 5–7 days a week, for 1, 2 or 4 weeks.")],
    [t("We cook. You train."), t("Delivered 5–8 AM. Swap or skip up to 48 hours ahead.")],
  ];
  return (
    <section className="section how" id="how">
      <div className="sectionHead center">
        <Eyebrow>{t("How it works")}</Eyebrow>
        <Lines className="display l" lines={[t("Four steps."), <em key="z">{t("Zero meal prep.")}</em>]} />
      </div>
      <ol className="howRow" ref={ref}>
        <motion.span className="howLine" aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 1.4, ease: EASE_OUT }} />
        {steps.map(([title, body], i) => (
          <motion.li key={title} className="howCard" initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE_OUT }}>
            <span className="howDot">{i + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------ Menu preview ------------------------------ */

function MenuPreview({ onOpen }: { onOpen: (m: Meal) => void }) {
  const { t } = useI18n();
  const filters: { id: string; label: string; test: (m: Meal) => boolean }[] = [
    { id: "all", label: t("All"), test: () => true },
    { id: "protein", label: t("High protein"), test: (m) => m.tags.includes("high-protein") },
    { id: "plant", label: t("Plant"), test: (m) => m.tags.includes("vegetarian") || m.tags.includes("vegan") },
    { id: "keto", label: t("Keto"), test: (m) => m.tags.includes("keto") },
  ];
  const [filter, setFilter] = useState("all");
  const meals = useMemo(() => MEALS.filter(filters.find((f) => f.id === filter)!.test).filter((m) => m.category !== "snack").slice(0, 4), [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="section menuPreview">
      <div className="sectionHead center">
        <Eyebrow>{t("On the menu")}</Eyebrow>
        <Lines className="display l" lines={[t("Food you'd order"), <em key="a">{t("anyway.")}</em>]} />
        <div className="filterPills" role="tablist" aria-label={t("Filter dishes")}>
          {filters.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} className={`pill ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)} type="button">
              {filter === f.id && <motion.span layoutId="pillBg" className="pillBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="pillText">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
      <motion.div className="previewGrid" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {meals.map((meal, i) => (
            <motion.div key={meal.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.45, ease: EASE_OUT } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              <MealCard meal={meal} onOpen={() => onOpen(meal)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <div className="centerRow">
        <Link to="/menu" className="btn ghost">{t("See all {n} dishes", { n: MEALS.length })} <Arrow /></Link>
      </div>
    </section>
  );
}

/* ------------------------------- Calculator ------------------------------- */

function Calculator() {
  const { t, c } = useI18n();
  const navigate = useNavigate();
  const [body, setBody] = useState<Body>({ sex: "male", age: 30, weightKg: 78, heightCm: 176, activity: 1.55, goal: "lose" });
  const program: ProgramId = GOAL_PROGRAM[body.goal];
  const kcal = dailyTarget(body);
  const macros = macroSplit(kcal, program);
  const set = <K extends keyof Body>(k: K, v: Body[K]) => setBody((b) => ({ ...b, [k]: v }));

  return (
    <section className="section calc dark" id="calculator">
      <div className="calcGrid">
        <div className="calcInputs">
          <Eyebrow tone="dark">{t("Macro calculator")}</Eyebrow>
          <Lines className="display l" lines={[t("Your numbers,"), <em key="n">{t("in 20 seconds.")}</em>]} />
          <Segmented label={t("Goal")} id="c-goal" value={body.goal} onChange={(v) => set("goal", v as Goal)} options={[["lose", t("Lose fat")], ["maintain", t("Maintain")], ["gain", t("Build muscle")]]} />
          <Segmented label={t("Formula uses")} id="c-sex" value={body.sex} onChange={(v) => set("sex", v as Body["sex"])} options={[["male", t("Male")], ["female", t("Female")]]} />
          <div className="sliderRow">
            <Slider label={t("Age")} unit={t("yrs")} min={16} max={75} value={body.age} onChange={(v) => set("age", v)} />
            <Slider label={t("Height")} unit={t("cm")} min={145} max={210} value={body.heightCm} onChange={(v) => set("heightCm", v)} />
            <Slider label={t("Weight")} unit={t("kg")} min={40} max={160} value={body.weightKg} onChange={(v) => set("weightKg", v)} />
          </div>
          <Segmented label={t("Training")} id="c-act" value={String(body.activity)} onChange={(v) => set("activity", Number(v))} options={ACTIVITY.map((a) => [String(a.id), t(a.label)])} />
        </div>
        <div className="calcResult">
          <MacroRing m={macros} size={240} stroke={18} label={t("kcal / day")} />
          <div className="calcMacros">
            <div className="protein"><span>{t("Protein")}</span><b className="tabular">{macros.protein}{t("g")}</b></div>
            <div className="carbs"><span>{t("Carbs")}</span><b className="tabular">{macros.carbs}{t("g")}</b></div>
            <div className="fat"><span>{t("Fat")}</span><b className="tabular">{macros.fat}{t("g")}</b></div>
          </div>
          <div className="calcPick">
            <span>{t("We'd put you on")}</span>
            <AnimatePresence mode="popLayout"><motion.strong key={program} className="display m" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>{c.program(PROGRAMS_BY_ID[program])}</motion.strong></AnimatePresence>
          </div>
          <button className="btn primary lg" type="button" onClick={() => navigate(`/start?program=${program}&kcal=${kcal}`)}>{t("Build this plan")} <Arrow /></button>
          <p className="fine">{t("Mifflin–St Jeor estimate. It's guidance, not medical advice.")}</p>
        </div>
      </div>
    </section>
  );
}

export function Segmented({ label, value, options, onChange, id }: { label: string; value: string; options: (readonly [string, string] | string[])[]; onChange: (v: string) => void; id?: string }) {
  const group = id || label;
  return (
    <div className="field">
      <span className="fieldLabel">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
            {value === v && <motion.span layoutId={`seg-${group}`} className="segBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="segText">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Slider({ label, unit, min, max, value, onChange }: { label: string; unit: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="field slider">
      <span className="fieldLabel">{label}<b className="tabular">{value} <small>{unit}</small></b></span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ "--pct": `${pct}%` } as React.CSSProperties} />
    </label>
  );
}

/* --------------------------------- Pricing -------------------------------- */

function Pricing() {
  const { t, c } = useI18n();
  const [mealsPerDay, setMeals] = useState("3");
  const [weeks, setWeeks] = useState("4");
  return (
    <section className="section pricing" id="plans">
      <div className="sectionHead center">
        <Eyebrow>{t("Plans & pricing")}</Eyebrow>
        <Lines className="display l" lines={[t("Straight prices."), <em key="p">{t("No subscription traps.")}</em>]} />
        <div className="pricingControls">
          <Segmented id="p-meals" label={t("Meals a day")} value={mealsPerDay} onChange={setMeals} options={[["2", "2"], ["3", "3"], ["4", t("3 + snack")], ["5", t("3 + 2 snacks")]]} />
          <Segmented id="p-weeks" label={t("Plan length")} value={weeks} onChange={setWeeks} options={[["1", t("1 week")], ["2", t("2 weeks")], ["4", t("4 weeks")]]} />
        </div>
      </div>
      <div className="priceGrid">
        {PROGRAMS.map((p, i) => {
          const q = quote({ program: p.id, mealsPerDay: Number(mealsPerDay), daysPerWeek: 5, weeks: Number(weeks) });
          return (
            <Reveal key={p.id} delay={i * 0.05} className={`priceCard ${p.id === "balance" ? "featured" : ""}`}>
              {p.id === "balance" && <span className="priceFlag">{t("Start here")}</span>}
              <span className="priceGoal">{c.programGoal(p)}</span>
              <h3 className="display m">{c.program(p)}</h3>
              <div className="priceBig"><span className="cur">{t("AED")}</span><Counter value={q.perDayAfterDiscount / 100} duration={0.6} /><small>{t("/day")}</small></div>
              <p className="priceSub">{t("{total} for {days} days", { total: aed(q.total), days: q.days })}</p>
              <p className="priceKcal">{t("{min}–{max} kcal", { min: p.kcalRange[0], max: p.kcalRange[1] })}</p>
              <Link to={`/start?program=${p.id}&meals=${mealsPerDay}&weeks=${weeks}`} className={`btn ${p.id === "balance" ? "primary" : "ghost"}`}>{t("Choose")}</Link>
            </Reveal>
          );
        })}
      </div>
      <p className="fine center">{t("Prices include 5% VAT. Free delivery to all 7 emirates.")}</p>
    </section>
  );
}

/* --------------------------------- Promise -------------------------------- */

function Guarantees() {
  const { t } = useI18n();
  const items = [
    [t("48h"), t("Swap or skip until 48 hours before delivery")],
    ["5–8", t("Morning delivery, before work")],
    ["7/7", t("Every emirate, free delivery")],
    ["1×", t("One payment. Plans never auto-renew")],
  ];
  return (
    <section className="section promise">
      <ul className="promiseRow">
        {items.map(([n, label], i) => (
          <Reveal as="li" key={label} delay={i * 0.06} className="promiseItem">
            <span className="promiseNum">{n}</span>
            <span className="promiseLabel">{label}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

function Faq() {
  const { t } = useI18n();
  const faq = [
    [t("How does delivery work?"), t("Choose a morning (5–8 AM) or night-before (6–10 PM) window. All the day's meals arrive together in an insulated bag. Keep them refrigerated and heat mains for about 2 minutes.")],
    [t("Can I change meals?"), t("Yes. Each day has a rotating menu per programme. Swap any dish until 48 hours before that delivery.")],
    [t("What if I travel?"), t("Skip any day from your dashboard, 48 hours ahead. It isn't lost. We add a delivery day to the end of your plan.")],
    [t("Is this a subscription?"), t("No. You buy a 1, 2 or 4-week plan upfront and it doesn't auto-renew. Renew when you're ready.")],
    [t("Do you handle allergies?"), t("Every dish lists the 8 major allergens. Our kitchen handles nuts, gluten, dairy and sesame, so we can't guarantee there's no cross-contact.")],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faq" id="faq">
      <div className="faqGrid">
        <div>
          <Eyebrow>{t("FAQ")}</Eyebrow>
          <Lines className="display l" lines={[t("Questions,"), <em key="q">{t("answered.")}</em>]} />
          <p className="lead">{t("Something else? Email")} <a href="mailto:hello@dietbox.ae">hello@dietbox.ae</a></p>
        </div>
        <div className="accordion">
          {faq.map(([q, a], i) => (
            <div key={q} className={`accItem ${open === i ? "open" : ""}`}>
              <button className="accHead" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} type="button">
                <span>{q}</span><i className="accIcon" aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div className="accBody" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
                    <p>{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Final CTA ------------------------------- */

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="finalCta">
      <div className="finalInner">
        <Lines className="display l" lines={[t("Your first box"), t("is two days away.")]} />
        <Link to="/start" className="btn secondary lg">{t("Build my plan")} <Arrow /></Link>
      </div>
    </section>
  );
}
