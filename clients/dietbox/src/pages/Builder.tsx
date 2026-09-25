import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  DAYS_PER_WEEK, DELIVERY_SLOTS, EMIRATES, MEALS_PER_DAY, PROGRAMS, PROGRAMS_BY_ID, SLOTS_BY_MEALS, WEEKS, WEEK_DISCOUNT,
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
import { useI18n } from "../i18n";

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
  const { t, c } = useI18n();
  const stepNames = [t("Goal"), t("Numbers"), t("Rhythm"), t("Delivery"), t("Review")];
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
      if (!a.emirate || a.area.trim().length < 2 || a.street.trim().length < 3) return setError(t("Add your emirate, area and street so we can find you."));
      if (!/^\+?[0-9 ()-]{7,20}$/.test(a.phone.trim())) return setError(t("Add a phone number the rider can call."));
    }
    go(Math.min(d.step + 1, 4));
  }

  return (
    <main className="builder">
      <div className="builderTop">
        <div className="stepper" aria-label={t("Progress")}>
          {stepNames.map((name, i) => (
            <button key={name} type="button" className={`stepDot ${i === d.step ? "on" : ""} ${i < d.step ? "done" : ""}`} onClick={() => i < d.step && go(i)} disabled={i > d.step} aria-current={i === d.step ? "step" : undefined}>
              <span className="stepNum">{i < d.step ? "✓" : i + 1}</span><span className="stepName">{name}</span>
            </button>
          ))}
          <div className="stepperBar"><motion.i animate={{ scaleX: d.step / (stepNames.length - 1) }} transition={{ duration: 0.6, ease: EASE_OUT }} /></div>
        </div>
      </div>

      <div className="builderGrid">
        <div className="builderMain">
          {cancelled && d.step === 4 && <p className="notice">{t("Checkout was cancelled. Your plan is saved, so you can pay whenever you're ready.")}</p>}
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
              {d.step > 0 ? <button type="button" className="btn ghost" onClick={() => go(d.step - 1)}>{t("Back")}</button> : <span />}
              <div className="builderNavRight">
                {d.step === 1 && <button type="button" className="btn ghost" onClick={() => { set({ body: null, kcalTarget: null }); go(2); }}>{t("Skip this")}</button>}
                <button type="button" className="btn primary lg" onClick={next}>{t("Continue")} <Arrow /></button>
              </div>
            </div>
          )}
          {d.step === 4 && <button type="button" className="btn ghost" onClick={() => go(3)}>{t("Back")}</button>}
        </div>

        <aside className="summary" aria-label={t("Plan summary")}>
          <div className="summaryMedia"><AnimatePresence mode="popLayout"><motion.img key={program.id} src={program.image} alt="" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} /></AnimatePresence><span className="summaryProgram display m">{c.program(program)}</span></div>
          <dl className="summaryList">
            <div><dt>{t("Goal")}</dt><dd>{c.programGoal(program)}</dd></div>
            <div><dt>{t("Daily target")}</dt><dd>{d.kcalTarget ? t("{n} kcal", { n: d.kcalTarget.toLocaleString("en") }) : t("{min}–{max} kcal", { min: program.kcalRange[0], max: program.kcalRange[1] })}</dd></div>
            <div><dt>{t("Meals")}</dt><dd>{t("{m} a day · {d} days/wk", { m: d.mealsPerDay, d: d.daysPerWeek })}</dd></div>
            <div><dt>{t("Length")}</dt><dd>{t(d.weeks > 1 ? "{w} weeks · {n} deliveries" : "{w} week · {n} deliveries", { w: d.weeks, n: price.days })}</dd></div>
            <div><dt>{t("First delivery")}</dt><dd>{dateLong(firstDelivery)}</dd></div>
          </dl>
          <div className="summaryPrice">
            <span>{t("Total")}</span>
            <AnimatePresence mode="popLayout"><motion.strong key={price.total} className="tabular" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }}>{aed(price.total)}</motion.strong></AnimatePresence>
            <small>{t("{price}/day", { price: aed(price.perDayAfterDiscount) })}{price.discount > 0 && ` · ${t("you save {amount}", { amount: aed(price.discount) })}`}</small>
          </div>
        </aside>
      </div>
    </main>
  );
}

type StepProps = { d: Draft; set: (patch: Partial<Draft>) => void };

function StepGoal({ d, set }: StepProps) {
  const { t, c } = useI18n();
  return (
    <>
      <Eyebrow>{t("Step 1 · Goal")}</Eyebrow>
      <h1 className="display l">{t("What are you training for?")}</h1>
      <div className="programPick" role="radiogroup" aria-label={t("Programme")}>
        {PROGRAMS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={d.program === p.id} className={`programOpt ${d.program === p.id ? "on" : ""}`} onClick={() => set({ program: p.id })}>
            <img src={p.image} alt="" />
            <span className="poText"><b className="display s">{c.program(p)}</b><small>{c.programGoal(p)} · {t("{min}–{max} kcal", { min: p.kcalRange[0], max: p.kcalRange[1] })}</small><span>{c.programDesc(p)}</span></span>
            <span className="poCheck" aria-hidden />
          </button>
        ))}
      </div>
    </>
  );
}

function StepBody({ d, set }: StepProps) {
  const { t, c } = useI18n();
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
      <Eyebrow>{t("Step 2 · Your numbers")}</Eyebrow>
      <h1 className="display l">{t("Set your daily target.")}</h1>
      <div className="bodyGrid">
        <div className="bodyInputs">
          <Segmented id="b-goal" label={t("Goal")} value={body.goal} onChange={(v) => update({ goal: v as Body["goal"] })} options={[["lose", t("Lose fat")], ["maintain", t("Maintain")], ["gain", t("Build")]]} />
          <Segmented id="b-sex" label={t("Formula uses")} value={body.sex} onChange={(v) => update({ sex: v as Body["sex"] })} options={[["male", t("Male")], ["female", t("Female")]]} />
          <Slider label={t("Age")} unit={t("yrs")} min={16} max={75} value={body.age} onChange={(v) => update({ age: v })} />
          <Slider label={t("Height")} unit={t("cm")} min={145} max={210} value={body.heightCm} onChange={(v) => update({ heightCm: v })} />
          <Slider label={t("Weight")} unit={t("kg")} min={40} max={160} value={body.weightKg} onChange={(v) => update({ weightKg: v })} />
          <Segmented id="b-act" label={t("Training")} value={String(body.activity)} onChange={(v) => update({ activity: Number(v) })} options={ACTIVITY.map((a) => [String(a.id), t(a.label)])} />
        </div>
        <div className="bodyRing"><MacroRing m={macroSplit(kcal, d.program)} size={240} /><p className="fine">{t("Split for {program}. This is an estimate, not medical advice.", { program: c.program(PROGRAMS_BY_ID[d.program]) })}</p></div>
      </div>
    </>
  );
}

function StepRhythm({ d, set }: StepProps) {
  const { t, c } = useI18n();
  const slots = SLOTS_BY_MEALS[d.mealsPerDay];
  const preview = defaultSelections(deliveryDates(d.startDate, d.daysPerWeek, 1)[0], d.program, d.mealsPerDay);
  return (
    <>
      <Eyebrow>{t("Step 3 · Rhythm")}</Eyebrow>
      <h1 className="display l">{t("How much, how often?")}</h1>
      <Segmented id="r-meals" label={t("Meals a day")} value={String(d.mealsPerDay)} onChange={(v) => set({ mealsPerDay: Number(v) })} options={MEALS_PER_DAY.map((n) => [String(n), `${n}`])} />
      <p className="slotLine">{slots.map((s) => c.slot(s)).join(" · ")}</p>
      <Segmented id="r-days" label={t("Days a week")} value={String(d.daysPerWeek)} onChange={(v) => set({ daysPerWeek: Number(v) })} options={DAYS_PER_WEEK.map((n) => [String(n), n === 5 ? t("5 · Mon–Fri") : n === 6 ? t("6 · Mon–Sat") : t("7 · Every day")])} />
      <Segmented id="r-weeks" label={t("Plan length")} value={String(d.weeks)} onChange={(v) => set({ weeks: Number(v) })} options={WEEKS.map((n) => [String(n), `${t(n > 1 ? "{n} weeks" : "{n} week", { n })}${WEEK_DISCOUNT[n] ? ` · −${WEEK_DISCOUNT[n] * 100}%` : ""}`])} />
      <div className="dayPreview">
        <span className="fieldLabel">{t("Your first day, chef's picks (swap anytime)")}</span>
        <div className="dayPreviewRow">
          <AnimatePresence mode="popLayout" initial={false}>
            {preview.map((s, i) => {
              const meal = MEALS_BY_ID[s.mealId];
              return (
                <motion.figure key={`${s.slot}-${s.mealId}`} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.4, ease: EASE_OUT } }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}>
                  <img src={meal.image} alt="" />
                  <figcaption><small>{c.slot(s.slot)}</small>{c.meal(meal)}</figcaption>
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
  const { t, c } = useI18n();
  const a = d.address;
  const setA = (patch: Partial<Draft["address"]>) => set({ address: { ...a, ...patch } });
  const min = earliestStart();
  return (
    <>
      <Eyebrow>{t("Step 4 · Delivery")}</Eyebrow>
      <h1 className="display l">{t("Where and when?")}</h1>
      <div className="formGrid">
        <label className="input"><span>{t("Start from")}</span><input type="date" min={min} max={addDays(min, 60)} value={d.startDate} onChange={(e) => e.target.value >= min && set({ startDate: e.target.value })} required /></label>
        <Segmented id="d-slot" label={t("Delivery window")} value={d.deliverySlot} onChange={(v) => set({ deliverySlot: v })} options={DELIVERY_SLOTS.map((s) => [s.id, t(s.label)])} />
        <label className="input"><span>{t("Emirate")}</span>
          <select value={a.emirate} onChange={(e) => setA({ emirate: e.target.value })} required>
            <option value="">{t("Select…")}</option>
            {EMIRATES.map((e) => <option key={e} value={e}>{c.emirate(e)}</option>)}
          </select>
        </label>
        <label className="input"><span>{t("Area / community")}</span><input value={a.area} onChange={(e) => setA({ area: e.target.value })} autoComplete="address-level3" required /></label>
        <label className="input wide"><span>{t("Street & building")}</span><input value={a.street} onChange={(e) => setA({ street: e.target.value })} autoComplete="street-address" required /></label>
        <label className="input"><span>{t("Apartment / villa")}</span><input value={a.unit} onChange={(e) => setA({ unit: e.target.value })} /></label>
        <label className="input"><span>{t("Mobile")}</span><input type="tel" inputMode="tel" value={a.phone} onChange={(e) => setA({ phone: e.target.value })} autoComplete="tel" placeholder="+971 5X XXX XXXX" required /></label>
        <label className="input wide"><span>{t("Rider notes")}</span><textarea rows={2} value={a.notes} onChange={(e) => setA({ notes: e.target.value })} placeholder={t("Gate code, leave with reception…")} /></label>
      </div>
    </>
  );
}

function StepReview({ d, signedIn, onError }: { d: Draft; signedIn: boolean; onError: (e: string) => void }) {
  const [busy, setBusy] = useState(false);
  const { t, c } = useI18n();
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
      onError(e instanceof Error ? t(e.message) : t("Checkout failed"));
      setBusy(false);
    }
  }

  return (
    <>
      <Eyebrow>{t("Step 5 · Review")}</Eyebrow>
      <h1 className="display l">{t("Looks strong.")}</h1>
      <div className="receipt">
        <div className="rRow"><span>{t("{program} · {m} meals × {n} days", { program: c.program(program), m: d.mealsPerDay, n: price.days })}</span><b>{aed(price.subtotal)}</b></div>
        {price.discount > 0 && <div className="rRow save"><span>{t("{w}-week saving", { w: d.weeks })}</span><b>−{aed(price.discount)}</b></div>}
        <div className="rRow"><span>{t("Delivery")} · {t(DELIVERY_SLOTS.find((s) => s.id === d.deliverySlot)?.label || "")}</span><b>{t("Free")}</b></div>
        <div className="rRule" />
        <div className="rRow total"><span>{t("Total")} <small>{t("incl. VAT")}</small></span><b className="tabular">{aed(price.total)}</b></div>
        <p className="fine">{t("First delivery {date} to {place}.", { date: dateLong(deliveryDates(d.startDate, d.daysPerWeek, 1)[0]), place: `${d.address.area}${t(", ")}${c.emirate(d.address.emirate)}` })}</p>
        <p className="fine renewNote">{d.weeks === 1
          ? t("Renews every week for {amount} until you cancel. We charge 3 days before each new week and email you before the first renewal. Pause or cancel anytime in your dashboard.", { amount: aed(price.total) })
          : t("Renews every {w} weeks for {amount} until you cancel. We charge 3 days before each new cycle and email you before every renewal. Pause or cancel anytime in your dashboard.", { amount: aed(price.total), w: d.weeks })}</p>
      </div>
      {signedIn ? (
        <button type="button" className="btn primary lg block" disabled={busy || !valid} onClick={pay}>{busy ? t("Opening secure checkout…") : <>{t("Start plan · {amount}", { amount: aed(price.total) })} <Arrow /></>}</button>
      ) : (
        <div className="authGate">
          <p><b>{t("Last step:")}</b> {t("create an account to manage deliveries. Your plan is saved.")}</p>
          <div className="actions">
            <Link className="btn secondary lg" to="/signup?next=/start">{t("Create account")}</Link>
            <Link className="btn ghost lg" to="/login?next=/start">{t("I have an account")}</Link>
          </div>
        </div>
      )}
    </>
  );
}
