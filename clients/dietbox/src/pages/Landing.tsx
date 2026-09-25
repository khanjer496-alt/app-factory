import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, useInView } from "motion/react";
import { EMIRATES, MEALS, MEALS_BY_ID, PROGRAMS, quote, type Meal, type ProgramId } from "../../shared/catalog";
import { ACTIVITY, GOAL_PROGRAM, dailyTarget, macroSplit, type Body, type Goal } from "../../shared/nutrition";
import { Arrow, Eyebrow, Ticker } from "../components/brand";
import { Counter, EASE_OUT, Lines, Reveal } from "../components/motion";
import { MacroRing, MealCard, MealDetail, Sheet } from "../components/meal";
import { Footer } from "../components/layout";
import { aed } from "../lib/format";

export default function Landing() {
  const [openMeal, setOpenMeal] = useState<Meal | null>(null);
  return (
    <>
      <Hero />
      <Ticker items={["High protein", "Chef-cooked daily", "Macro-counted", "Delivered 5–8 AM", "Swap any meal", "Skip any day", "5 programmes"]} />
      <Goals />
      <HowItWorks />
      <MenuPreview onOpen={setOpenMeal} />
      <Calculator />
      <Pricing />
      <Why />
      <Faq />
      <FinalCta />
      <Footer />
      <Sheet open={!!openMeal} onClose={() => setOpenMeal(null)} label={openMeal?.name || "Meal"}>
        {openMeal && <MealDetail meal={openMeal} footer={<Link className="btn primary" to="/start">Get it in my plan <Arrow /></Link>} />}
      </Sheet>
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Spring-smoothed pointer tilt: decorative, so it gets momentum instead of 1:1 tracking.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 120, damping: 18 });
  const chipX = useSpring(useTransform(mx, [-1, 1], [-18, 18]), { stiffness: 90, damping: 16 });
  const chipY = useSpring(useTransform(my, [-1, 1], [-14, 14]), { stiffness: 90, damping: 16 });

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
            <Eyebrow tone="dark">Meal plans · Delivered daily across the UAE</Eyebrow>
          </motion.div>
          <Lines as="h1" immediate className="display xl" lines={["Eat for the", "body you're", <em key="b">building.</em>]} />
          <motion.p className="heroLead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: EASE_OUT }}>
            Chef-cooked meals, weighed to your macros and at your door by 8&nbsp;AM. Swap, skip or pause in two taps.
          </motion.p>
          <motion.div className="heroActions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: EASE_OUT }}>
            <Link to="/start" className="btn primary lg">Build my plan <Arrow /></Link>
            <Link to="/menu" className="btn ghost lg onDark">See this week's menu</Link>
          </motion.div>
          <motion.dl className="heroStats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
            <div><dt>Programmes</dt><dd><Counter value={PROGRAMS.length} /></dd></div>
            <div><dt>Dishes in rotation</dt><dd><Counter value={MEALS.length} /></dd></div>
            <div><dt>Meals a day</dt><dd>2–5</dd></div>
          </motion.dl>
        </motion.div>

        <motion.div className="heroVisual" style={{ y: visualY }}>
          <motion.div className="heroDisc" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: EASE_OUT }} />
          <motion.div className="heroPlateWrap" style={{ rotateX: rx, rotateY: ry }} initial={{ opacity: 0, scale: 0.85, rotate: -25 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.1 }}>
            <img className="heroPlate" src="/scenes/hero-bowl.webp" alt="Avocado quinoa bowl with chilli and black sesame" width={1600} height={1600} fetchPriority="high" />
          </motion.div>
          <motion.div className="orbit" style={{ x: chipX, y: chipY }}>
            <HeroChip className="c1" delay={0.9}>{hero.name}</HeroChip>
            <HeroChip className="c2" delay={1.05}><b>{hero.kcal}</b> kcal</HeroChip>
            <HeroChip className="c3" delay={1.2}><span className="pulse" /> Delivered 5–8 AM</HeroChip>
            <HeroChip className="c4" delay={1.35}>P {hero.protein} · C {hero.carbs} · F {hero.fat}</HeroChip>
          </motion.div>
        </motion.div>
      </div>
      <a href="#goals" className="scrollCue" aria-label="Scroll to programmes"><span /></a>
    </section>
  );
}

function HeroChip({ children, className, delay }: { children: React.ReactNode; className: string; delay: number }) {
  return (
    <motion.span className={`heroChip ${className}`} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: EASE_OUT }}>
      <span className="float">{children}</span>
    </motion.span>
  );
}

/* ---------------------------------- Goals --------------------------------- */

function Goals() {
  return (
    <section className="section goals" id="goals">
      <div className="sectionHead">
        <Eyebrow>Five programmes</Eyebrow>
        <Lines className="display l" lines={["Pick your goal.", <em key="w">We'll do the maths.</em>]} />
      </div>
      <div className="goalGrid">
        {PROGRAMS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06} className="goalCell">
            <Link to={`/start?program=${p.id}`} className="goalCard">
              <div className="goalMedia"><img src={p.image} alt="" loading="lazy" /></div>
              <div className="goalShade" />
              <div className="goalTop"><span className="goalIndex">0{i + 1}</span><span className="goalKcal">{p.kcalRange[0]}–{p.kcalRange[1]} kcal</span></div>
              <div className="goalBottom">
                <span className="goalGoal">{p.goal}</span>
                <h3 className="display m">{p.name}</h3>
                <p>{p.tagline}</p>
                <span className="goalFrom">from {aed(p.mealPriceFils)}/meal <Arrow /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- How it works ------------------------------ */

const STEPS = [
  { title: "Pick your goal", body: "Lean, Balance, Muscle, Keto or Plant. Each one has its own portions and macro split.", image: "/scenes/green-flatlay.webp" },
  { title: "Dial in your macros", body: "Tell us your height, weight and training load. We set a daily calorie target and portion every meal to hit it.", image: "/meals/grilled-chicken-peas.webp" },
  { title: "Set your rhythm", body: "2–5 meals a day, 5–7 days a week, for 1, 2 or 4 weeks. Longer plans cost less per day.", image: "/scenes/bowls-overhead.webp" },
  { title: "We cook. You train.", body: "Cooked fresh and delivered 5–8 AM or the night before. Swap dishes or skip days up to 48 hours ahead.", image: "/scenes/ingredients.webp" },
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <section className="section how" id="how">
      <div className="sectionHead">
        <Eyebrow>How it works</Eyebrow>
        <Lines className="display l" lines={["Four steps.", <em key="z">Zero meal prep.</em>]} />
      </div>
      <div className="howGrid" ref={ref}>
        <div className="howSticky">
          <div className="howVisual">
            <AnimatePresence mode="popLayout">
              <motion.img key={active} src={STEPS[active].image} alt="" initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE_OUT }} />
            </AnimatePresence>
            <div className="howNumber"><AnimatePresence mode="popLayout"><motion.span key={active} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.5, ease: EASE_OUT }}>0{active + 1}</motion.span></AnimatePresence></div>
          </div>
          <div className="howProgress"><motion.i style={{ scaleY: bar }} /></div>
        </div>
        <ol className="howSteps">
          {STEPS.map((s, i) => <Step key={s.title} index={i} step={s} active={active === i} onActive={setActive} />)}
        </ol>
      </div>
    </section>
  );
}

function Step({ step, index, active, onActive }: { step: (typeof STEPS)[number]; index: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (inView) onActive(index); }, [inView, index, onActive]);
  return (
    <li ref={ref} className={`howStep ${active ? "active" : ""}`}>
      <span className="howStepNum">0{index + 1}</span>
      <h3 className="display m">{step.title}</h3>
      <p>{step.body}</p>
      <img className="howStepImg" src={step.image} alt="" loading="lazy" />
    </li>
  );
}

/* ------------------------------ Menu preview ------------------------------ */

const FILTERS: { id: string; label: string; test: (m: Meal) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "protein", label: "High protein", test: (m) => m.tags.includes("high-protein") },
  { id: "plant", label: "Plant", test: (m) => m.tags.includes("vegetarian") || m.tags.includes("vegan") },
  { id: "keto", label: "Keto", test: (m) => m.tags.includes("keto") },
  { id: "breakfast", label: "Breakfast", test: (m) => m.category === "breakfast" },
];

function MenuPreview({ onOpen }: { onOpen: (m: Meal) => void }) {
  const [filter, setFilter] = useState("all");
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(0);
  const meals = useMemo(() => MEALS.filter(FILTERS.find((f) => f.id === filter)!.test).slice(0, 10), [filter]);
  const x = useMotionValue(0);
  useEffect(() => {
    const measure = () => setLimit(Math.max(0, (track.current?.scrollWidth || 0) - (viewport.current?.clientWidth || 0)));
    measure();
    x.set(0);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [meals, x]);

  return (
    <section className="section menuPreview">
      <div className="sectionHead row">
        <div>
          <Eyebrow>On the menu</Eyebrow>
          <Lines className="display l" lines={["Food you'd order", <em key="a">anyway.</em>]} />
        </div>
        <div className="filterPills" role="tablist" aria-label="Filter dishes">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} className={`pill ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)} type="button">
              {filter === f.id && <motion.span layoutId="pillBg" className="pillBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="pillText">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="dragViewport" ref={viewport}>
        <motion.div className="dragTrack" ref={track} drag="x" style={{ x }} dragConstraints={{ left: -limit, right: 0 }} dragElastic={0.08}>
          <AnimatePresence mode="popLayout" initial={false}>
            {meals.map((meal, i) => (
              <motion.div key={meal.id} className="dragItem" layout initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.04, duration: 0.5, ease: EASE_OUT } }} exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}>
                <MealCard meal={meal} onOpen={() => onOpen(meal)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="menuPreviewFoot">
        <span className="hint">Drag to explore <Arrow /></span>
        <Link to="/menu" className="btn secondary">Full menu ({MEALS.length} dishes) <Arrow /></Link>
      </div>
    </section>
  );
}

/* ------------------------------- Calculator ------------------------------- */

function Calculator() {
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
          <Eyebrow tone="dark">Macro calculator</Eyebrow>
          <Lines className="display l" lines={["Your numbers,", <em key="n">in 20 seconds.</em>]} />
          <Segmented label="Goal" value={body.goal} onChange={(v) => set("goal", v as Goal)} options={[["lose", "Lose fat"], ["maintain", "Maintain"], ["gain", "Build muscle"]]} />
          <Segmented label="Formula uses" value={body.sex} onChange={(v) => set("sex", v as Body["sex"])} options={[["male", "Male"], ["female", "Female"]]} />
          <Slider label="Age" unit="yrs" min={16} max={75} value={body.age} onChange={(v) => set("age", v)} />
          <Slider label="Height" unit="cm" min={145} max={210} value={body.heightCm} onChange={(v) => set("heightCm", v)} />
          <Slider label="Weight" unit="kg" min={40} max={160} value={body.weightKg} onChange={(v) => set("weightKg", v)} />
          <Segmented label="Training" value={String(body.activity)} onChange={(v) => set("activity", Number(v))} options={ACTIVITY.map((a) => [String(a.id), a.label])} />
        </div>
        <div className="calcResult">
          <MacroRing m={macros} size={300} stroke={22} />
          <div className="calcMacros">
            <div className="protein"><span>Protein</span><b className="tabular">{macros.protein}g</b></div>
            <div className="carbs"><span>Carbs</span><b className="tabular">{macros.carbs}g</b></div>
            <div className="fat"><span>Fat</span><b className="tabular">{macros.fat}g</b></div>
          </div>
          <div className="calcPick">
            <span>We'd put you on</span>
            <AnimatePresence mode="popLayout"><motion.strong key={program} className="display m" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>{program}</motion.strong></AnimatePresence>
          </div>
          <button className="btn primary lg" type="button" onClick={() => navigate(`/start?program=${program}&kcal=${kcal}`)}>Build this plan <Arrow /></button>
          <p className="fine">Mifflin–St Jeor estimate. It's guidance, not medical advice.</p>
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
  const [mealsPerDay, setMeals] = useState("3");
  const [weeks, setWeeks] = useState("4");
  return (
    <section className="section pricing" id="plans">
      <div className="sectionHead row">
        <div>
          <Eyebrow>Plans & pricing</Eyebrow>
          <Lines className="display l" lines={["Straight prices.", <em key="p">No subscription traps.</em>]} />
        </div>
        <div className="pricingControls">
          <Segmented id="p-meals" label="Meals a day" value={mealsPerDay} onChange={setMeals} options={[["2", "2"], ["3", "3"], ["4", "3 + snack"], ["5", "3 + 2 snacks"]]} />
          <Segmented id="p-weeks" label="Plan length" value={weeks} onChange={setWeeks} options={[["1", "1 week"], ["2", "2 weeks"], ["4", "4 weeks"]]} />
        </div>
      </div>
      <div className="priceGrid">
        {PROGRAMS.map((p, i) => {
          const q = quote({ program: p.id, mealsPerDay: Number(mealsPerDay), daysPerWeek: 5, weeks: Number(weeks) });
          return (
            <Reveal key={p.id} delay={i * 0.05} className={`priceCard ${p.id === "balance" ? "featured" : ""}`}>
              {p.id === "balance" && <span className="priceFlag">Start here</span>}
              <span className="priceGoal">{p.goal}</span>
              <h3 className="display m">{p.name}</h3>
              <div className="priceBig"><span className="cur">AED</span><Counter value={q.perDayAfterDiscount / 100} duration={0.6} /><small>/day</small></div>
              <p className="priceSub">{aed(q.total)} for {q.days} days · Mon–Fri</p>
              <ul>
                <li>{p.kcalRange[0]}–{p.kcalRange[1]} kcal/day</li>
                <li>{Math.round(p.split.protein * 100)} / {Math.round(p.split.carbs * 100)} / {Math.round(p.split.fat * 100)} P·C·F split</li>
                <li>Free delivery, all 7 emirates</li>
              </ul>
              <Link to={`/start?program=${p.id}&meals=${mealsPerDay}&weeks=${weeks}`} className={`btn ${p.id === "balance" ? "primary" : "secondary"}`}>Choose {p.name}</Link>
            </Reveal>
          );
        })}
      </div>
      <p className="fine center">Prices include 5% VAT. Weekend delivery (6–7 days) available at the same per-day price. {Number(weeks) > 1 && `${weeks}-week plans save ${Number(weeks) === 2 ? 5 : 10}%.`}</p>
    </section>
  );
}

/* ----------------------------------- Why ---------------------------------- */

function Why() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  return (
    <section className="section why" ref={ref}>
      <div className="sectionHead">
        <Eyebrow>Why Dietbox</Eyebrow>
        <Lines className="display l" lines={["Built like a", <em key="t">training plan.</em>]} />
      </div>
      <div className="bento">
        <div className="bentoImg tall"><motion.img style={{ y: y1 }} src="/scenes/bowls-overhead.webp" alt="Overhead view of assorted Dietbox bowls" loading="lazy" /></div>
        <Reveal className="bentoCard volt"><span className="bentoNum">±5<small>g</small></span><h3>Weighed, not guessed</h3><p>Every portion is weighed and macro-counted for your programme.</p></Reveal>
        <Reveal className="bentoCard" delay={0.05}><span className="bentoNum">48<small>h</small></span><h3>Change your mind</h3><p>Swap dishes or skip days until 48 hours before delivery. Skipped days move to the end of your plan.</p></Reveal>
        <div className="bentoImg"><motion.img style={{ y: y2 }} src="/scenes/ingredients.webp" alt="Fresh vegetables and grains" loading="lazy" /></div>
        <Reveal className="bentoCard dark" delay={0.1}><span className="bentoNum">5–8<small>am</small></span><h3>At your door before work</h3><p>Morning drops, or the night before if you train early.</p></Reveal>
        <Reveal className="bentoCard wide" delay={0.15}><span className="bentoNum">7<small>/7</small></span><div><h3>Every emirate</h3><p>Free delivery, same menu, same morning window.</p></div><div className="emirates">{EMIRATES.map((e) => <span key={e}>{e}</span>)}</div></Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

const FAQ = [
  ["How does delivery work?", "Choose a morning (5–8 AM) or night-before (6–10 PM) window. All the day's meals arrive together in an insulated bag. Keep them refrigerated and heat mains for about 2 minutes."],
  ["Can I change meals?", "Yes. Each day has a rotating menu per programme. Swap any dish until 48 hours before that delivery."],
  ["What if I travel?", "Skip any day from your dashboard, 48 hours ahead. It isn't lost. We add a delivery day to the end of your plan."],
  ["Is this a subscription?", "No. You buy a 1, 2 or 4-week plan upfront and it doesn't auto-renew. Renew when you're ready."],
  ["Do you handle allergies?", "Every dish lists the 8 major allergens. Our kitchen handles nuts, gluten, dairy and sesame, so we can't guarantee there's no cross-contact."],
  ["How are calories calculated?", "Your target uses the Mifflin–St Jeor equation adjusted for training and goal. Portions scale by programme: Lean runs smaller and Muscle runs larger."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faq" id="faq">
      <div className="faqGrid">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <Lines className="display l" lines={["Questions,", <em key="q">answered.</em>]} />
          <p className="lead">Something else? Email <a href="mailto:hello@dietbox.ae">hello@dietbox.ae</a>.</p>
        </div>
        <div className="accordion">
          {FAQ.map(([q, a], i) => (
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-35%"]);
  return (
    <section className="finalCta" ref={ref}>
      <motion.div className="finalGiant" style={{ x }} aria-hidden>START MONDAY · START MONDAY ·</motion.div>
      <div className="finalInner">
        <Lines className="display l" lines={["Your first box", "is two days away."]} />
        <Link to="/start" className="btn secondary lg">Build my plan <Arrow /></Link>
      </div>
    </section>
  );
}
