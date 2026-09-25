import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  DAYS_PER_WEEK, DELIVERY_SLOTS, EMIRATES, MEALS_PER_DAY, PROGRAMS, PROGRAMS_BY_ID, SLOTS_BY_MEALS, SLOT_LABEL, WEEKS, WEEK_DISCOUNT,
  addDays, defaultSelections, deliveryDates, earliestStart, isValidPlan, MEALS_BY_ID, quote, type ProgramId,
} from "../../shared/catalog";
import { ACTIVITY, GOAL_PROGRAM, dailyTarget, macroSplit, type Body } from "../../shared/nutrition";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";
import { aed, dateLong } from "../lib/format";
import { loadDraft, saveDraft, type Draft } from "../lib/draft";
import { Arrow, Eyebrow } from "../components/brand";
import { EASE_OUT } from "../components/motion";
import { MacroRing } from "../components/meal";
import { Segmented, Slider } from "./Landing";

const STEP_NAMES = ["Goal", "Numbers", "Rhythm", "Delivery", "Review"];
const DEFAULT_BODY: Body = { sex: "male", age: 30, weightKg: 75, heightCm: 175, activity: 1.55, goal: "maintain" };

function initialDraft(params: URLSearchParams): Draft {
  const saved = loadDraft() || {};
  const base: Draft = {
    step: 0, program: "balance", body: null, kcalTarget: null, mealsPerDay: 3, daysPerWeek: 5, weeks: 4,
    startDate: earliestStart(), deliverySlot: "morning",
    address: { emirate: "", area: "", street: "", unit: "", phone: "", notes: "" },
    ...saved,
  } as Draft;
  const program = params.get("program");
  if (program && PROGRAMS_BY_ID[program]) { base.program = program as ProgramId; base.step = Math.max(base.step, 1); }
  const kcal = Number(params.get("kcal"));
  if (kcal >= 1000 && kcal <= 5000) { base.kcalTarget = Math.round(kcal); base.step = Math.max(base.step, 2); }
  const meals = Number(params.get("meals"));
  if ((MEALS_PER_DAY as readonly number[]).includes(meals)) base.mealsPerDay = meals;
  const weeks = Number(params.get("weeks"));
  if ((WEEKS as readonly number[]).includes(weeks)) base.weeks = weeks;
  if (base.startDate < earliestStart()) base.startDate = earliestStart();
  return base;
}

export default function Builder() {
  const [params] = useSearchParams();
  const [d, setD] = useState<Draft>(() => initialDraft(params));
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const { data: session } = authClient.useSession();
  useEffect(() => saveDraft(d), [d]);
  const cancelled = params.get("checkout") === "cancelled";

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const go = (step: number) => { setError(""); setDir(step > d.step ? 1 : -1); set({ step }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const price = quote(d);
  const program = PROGRAMS_BY_ID[d.program];
  const firstDelivery = deliveryDates(d.startDate, d.daysPerWeek, 1)[0];

  function next() {
    if (d.step === 3) {
      const a = d.address;
      if (!a.emirate || a.area.trim().length < 2 || a.street.trim().length < 3) return setError("Add your emirate, area and street so we can find you.");
      if (!/^\+?[0-9 ()-]{7,20}$/.test(a.phone.trim())) return setError("Add a phone number the rider can call.");
    }
    go(Math.min(d.step + 1, 4));
  }

  return (
    <main className="builder">
      <div className="builderTop">
        <div className="stepper" aria-label="Progress">
          {STEP_NAMES.map((name, i) => (
            <button key={name} type="button" className={`stepDot ${i === d.step ? "on" : ""} ${i < d.step ? "done" : ""}`} onClick={() => i < d.step && go(i)} disabled={i > d.step} aria-current={i === d.step ? "step" : undefined}>
              <span className="stepNum">{i < d.step ? "✓" : i + 1}</span><span className="stepName">{name}</span>
            </button>
          ))}
          <div className="stepperBar"><motion.i animate={{ scaleX: d.step / (STEP_NAMES.length - 1) }} transition={{ duration: 0.6, ease: EASE_OUT }} /></div>
        </div>
      </div>

      <div className="builderGrid">
        <div className="builderMain">
          {cancelled && d.step === 4 && <p className="notice">Checkout was cancelled. Your plan is saved, so you can pay whenever you're ready.</p>}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.section
              key={d.step} custom={dir}
              initial={{ opacity: 0, x: dir * 40, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: dir * -40, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="builderStep"
            >
              {d.step === 0 && <StepGoal d={d} set={set} />}
              {d.step === 1 && <StepBody d={d} set={set} />}
              {d.step === 2 && <StepRhythm d={d} set={set} />}
              {d.step === 3 && <StepDelivery d={d} set={set} />}
              {d.step === 4 && <StepReview d={d} signedIn={!!session} onError={setError} />}
            </motion.section>
          </AnimatePresence>
          {error && <p className="error" role="alert">{error}</p>}
          {d.step < 4 && (
            <div className="builderNav">
              {d.step > 0 ? <button type="button" className="btn ghost" onClick={() => go(d.step - 1)}>Back</button> : <span />}
              <div className="builderNavRight">
                {d.step === 1 && <button type="button" className="btn ghost" onClick={() => { set({ body: null, kcalTarget: null }); go(2); }}>Skip this</button>}
                <button type="button" className="btn primary lg" onClick={next}>Continue <Arrow /></button>
              </div>
            </div>
          )}
          {d.step === 4 && <button type="button" className="btn ghost" onClick={() => go(3)}>Back</button>}
        </div>

        <aside className="summary" aria-label="Plan summary">
          <div className="summaryMedia"><AnimatePresence mode="popLayout"><motion.img key={program.id} src={program.image} alt="" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} /></AnimatePresence><span className="summaryProgram display m">{program.name}</span></div>
          <dl className="summaryList">
            <div><dt>Goal</dt><dd>{program.goal}</dd></div>
            <div><dt>Daily target</dt><dd>{d.kcalTarget ? `${d.kcalTarget.toLocaleString()} kcal` : `${program.kcalRange[0]}–${program.kcalRange[1]} kcal`}</dd></div>
            <div><dt>Meals</dt><dd>{d.mealsPerDay} a day · {d.daysPerWeek} days/wk</dd></div>
            <div><dt>Length</dt><dd>{d.weeks} week{d.weeks > 1 ? "s" : ""} · {price.days} deliveries</dd></div>
            <div><dt>First delivery</dt><dd>{dateLong(firstDelivery)}</dd></div>
          </dl>
          <div className="summaryPrice">
            <span>Total</span>
            <AnimatePresence mode="popLayout"><motion.strong key={price.total} className="tabular" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }}>{aed(price.total)}</motion.strong></AnimatePresence>
            <small>{aed(price.perDayAfterDiscount)}/day{price.discount > 0 && ` · you save ${aed(price.discount)}`}</small>
          </div>
        </aside>
      </div>
    </main>
  );
}

type StepProps = { d: Draft; set: (patch: Partial<Draft>) => void };

function StepGoal({ d, set }: StepProps) {
  return (
    <>
      <Eyebrow>Step 1 · Goal</Eyebrow>
      <h1 className="display l">What are you training for?</h1>
      <div className="programPick" role="radiogroup" aria-label="Programme">
        {PROGRAMS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={d.program === p.id} className={`programOpt ${d.program === p.id ? "on" : ""}`} onClick={() => set({ program: p.id })}>
            <img src={p.image} alt="" />
            <span className="poText"><b className="display s">{p.name}</b><small>{p.goal} · {p.kcalRange[0]}–{p.kcalRange[1]} kcal</small><span>{p.description}</span></span>
            <span className="poCheck" aria-hidden />
          </button>
        ))}
      </div>
    </>
  );
}

function StepBody({ d, set }: StepProps) {
  const body = d.body || { ...DEFAULT_BODY, goal: d.program === "lean" ? "lose" : d.program === "muscle" ? "gain" : "maintain" };
  const kcal = dailyTarget(body);
  const update = (patch: Partial<Body>) => {
    const next = { ...body, ...patch };
    const program = patch.goal && (d.program === "lean" || d.program === "balance" || d.program === "muscle") ? GOAL_PROGRAM[next.goal] : d.program;
    set({ body: next, kcalTarget: dailyTarget(next), program });
  };
  useEffect(() => { if (!d.body) set({ body, kcalTarget: kcal }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Eyebrow>Step 2 · Your numbers</Eyebrow>
      <h1 className="display l">Set your daily target.</h1>
      <div className="bodyGrid">
        <div className="bodyInputs">
          <Segmented id="b-goal" label="Goal" value={body.goal} onChange={(v) => update({ goal: v as Body["goal"] })} options={[["lose", "Lose fat"], ["maintain", "Maintain"], ["gain", "Build"]]} />
          <Segmented id="b-sex" label="Formula uses" value={body.sex} onChange={(v) => update({ sex: v as Body["sex"] })} options={[["male", "Male"], ["female", "Female"]]} />
          <Slider label="Age" unit="yrs" min={16} max={75} value={body.age} onChange={(v) => update({ age: v })} />
          <Slider label="Height" unit="cm" min={145} max={210} value={body.heightCm} onChange={(v) => update({ heightCm: v })} />
          <Slider label="Weight" unit="kg" min={40} max={160} value={body.weightKg} onChange={(v) => update({ weightKg: v })} />
          <Segmented id="b-act" label="Training" value={String(body.activity)} onChange={(v) => update({ activity: Number(v) })} options={ACTIVITY.map((a) => [String(a.id), a.label])} />
        </div>
        <div className="bodyRing"><MacroRing m={macroSplit(kcal, d.program)} size={240} /><p className="fine">Split for {PROGRAMS_BY_ID[d.program].name}. This is an estimate, not medical advice.</p></div>
      </div>
    </>
  );
}

function StepRhythm({ d, set }: StepProps) {
  const slots = SLOTS_BY_MEALS[d.mealsPerDay];
  const preview = defaultSelections(deliveryDates(d.startDate, d.daysPerWeek, 1)[0], d.program, d.mealsPerDay);
  return (
    <>
      <Eyebrow>Step 3 · Rhythm</Eyebrow>
      <h1 className="display l">How much, how often?</h1>
      <Segmented id="r-meals" label="Meals a day" value={String(d.mealsPerDay)} onChange={(v) => set({ mealsPerDay: Number(v) })} options={MEALS_PER_DAY.map((n) => [String(n), `${n}`])} />
      <p className="slotLine">{slots.map((s) => SLOT_LABEL[s]).join(" · ")}</p>
      <Segmented id="r-days" label="Days a week" value={String(d.daysPerWeek)} onChange={(v) => set({ daysPerWeek: Number(v) })} options={DAYS_PER_WEEK.map((n) => [String(n), n === 5 ? "5 · Mon–Fri" : n === 6 ? "6 · Mon–Sat" : "7 · Every day"])} />
      <Segmented id="r-weeks" label="Plan length" value={String(d.weeks)} onChange={(v) => set({ weeks: Number(v) })} options={WEEKS.map((n) => [String(n), `${n} week${n > 1 ? "s" : ""}${WEEK_DISCOUNT[n] ? ` · −${WEEK_DISCOUNT[n] * 100}%` : ""}`])} />
      <div className="dayPreview">
        <span className="fieldLabel">Your first day, chef's picks (swap anytime)</span>
        <div className="dayPreviewRow">
          <AnimatePresence mode="popLayout" initial={false}>
            {preview.map((s, i) => {
              const meal = MEALS_BY_ID[s.mealId];
              return (
                <motion.figure key={`${s.slot}-${s.mealId}`} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.4, ease: EASE_OUT } }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}>
                  <img src={meal.image} alt="" />
                  <figcaption><small>{SLOT_LABEL[s.slot]}</small>{meal.name}</figcaption>
                </motion.figure>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function StepDelivery({ d, set }: StepProps) {
  const a = d.address;
  const setA = (patch: Partial<Draft["address"]>) => set({ address: { ...a, ...patch } });
  const min = earliestStart();
  return (
    <>
      <Eyebrow>Step 4 · Delivery</Eyebrow>
      <h1 className="display l">Where and when?</h1>
      <div className="formGrid">
        <label className="input"><span>Start from</span><input type="date" min={min} max={addDays(min, 60)} value={d.startDate} onChange={(e) => e.target.value >= min && set({ startDate: e.target.value })} required /></label>
        <Segmented id="d-slot" label="Delivery window" value={d.deliverySlot} onChange={(v) => set({ deliverySlot: v })} options={DELIVERY_SLOTS.map((s) => [s.id, s.label])} />
        <label className="input"><span>Emirate</span>
          <select value={a.emirate} onChange={(e) => setA({ emirate: e.target.value })} required>
            <option value="">Select…</option>
            {EMIRATES.map((e) => <option key={e}>{e}</option>)}
          </select>
        </label>
        <label className="input"><span>Area / community</span><input value={a.area} onChange={(e) => setA({ area: e.target.value })} autoComplete="address-level3" required /></label>
        <label className="input wide"><span>Street & building</span><input value={a.street} onChange={(e) => setA({ street: e.target.value })} autoComplete="street-address" required /></label>
        <label className="input"><span>Apartment / villa</span><input value={a.unit} onChange={(e) => setA({ unit: e.target.value })} /></label>
        <label className="input"><span>Mobile</span><input type="tel" inputMode="tel" value={a.phone} onChange={(e) => setA({ phone: e.target.value })} autoComplete="tel" placeholder="+971 5X XXX XXXX" required /></label>
        <label className="input wide"><span>Rider notes</span><textarea rows={2} value={a.notes} onChange={(e) => setA({ notes: e.target.value })} placeholder="Gate code, leave with reception…" /></label>
      </div>
    </>
  );
}

function StepReview({ d, signedIn, onError }: { d: Draft; signedIn: boolean; onError: (e: string) => void }) {
  const [busy, setBusy] = useState(false);
  const price = quote(d);
  const program = PROGRAMS_BY_ID[d.program];
  const valid = useMemo(() => isValidPlan(d), [d]);

  async function pay() {
    setBusy(true);
    onError("");
    try {
      const { url } = await api<{ url: string }>("/api/orders", { method: "POST", body: JSON.stringify({
        program: d.program, mealsPerDay: d.mealsPerDay, daysPerWeek: d.daysPerWeek, weeks: d.weeks,
        startDate: d.startDate, deliverySlot: d.deliverySlot, kcalTarget: d.kcalTarget, address: d.address,
      }) });
      window.location.href = url;
    } catch (e) {
      onError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <>
      <Eyebrow>Step 5 · Review</Eyebrow>
      <h1 className="display l">Looks strong.</h1>
      <div className="receipt">
        <div className="rRow"><span>{program.name} · {d.mealsPerDay} meals × {price.days} days</span><b>{aed(price.subtotal)}</b></div>
        {price.discount > 0 && <div className="rRow save"><span>{d.weeks}-week saving</span><b>−{aed(price.discount)}</b></div>}
        <div className="rRow"><span>Delivery · {DELIVERY_SLOTS.find((s) => s.id === d.deliverySlot)?.label}</span><b>Free</b></div>
        <div className="rRule" />
        <div className="rRow total"><span>Total <small>incl. VAT</small></span><b className="tabular">{aed(price.total)}</b></div>
        <p className="fine">First delivery {dateLong(deliveryDates(d.startDate, d.daysPerWeek, 1)[0])} to {d.address.area}, {d.address.emirate}. One-off payment that doesn't auto-renew.</p>
      </div>
      {signedIn ? (
        <button type="button" className="btn primary lg block" disabled={busy || !valid} onClick={pay}>{busy ? "Opening secure checkout…" : <>Pay {aed(price.total)} <Arrow /></>}</button>
      ) : (
        <div className="authGate">
          <p><b>Last step:</b> create an account to manage deliveries. Your plan is saved.</p>
          <div className="actions">
            <Link className="btn secondary lg" to="/signup?next=/start">Create account</Link>
            <Link className="btn ghost lg" to="/login?next=/start">I have an account</Link>
          </div>
        </div>
      )}
    </>
  );
}
