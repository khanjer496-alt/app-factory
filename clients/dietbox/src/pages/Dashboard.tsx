import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { EMIRATES, MEALS_BY_ID, PROGRAMS_BY_ID, SLOTS_BY_MEALS, menuFor, scaled, slotCategory, type Meal, type ProgramId, type Slot } from "../../shared/catalog";
import { macroSplit } from "../../shared/nutrition";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { clearDraft } from "../lib/draft";
import { aed, dateLong, dateMedium, dayNum, dayShort } from "../lib/format";
import { Arrow, Eyebrow } from "../components/brand";
import { EASE_OUT } from "../components/motion";
import { MacroChips, MacroRing, MealDetail, Sheet } from "../components/meal";
import { useI18n } from "../i18n";

interface Day { date: string; status: "scheduled" | "skipped"; editable: boolean; selections: { slot: Slot; mealId: string }[] }
interface Address { emirate: string; area: string; street: string; unit: string; phone: string; notes: string }
interface PlanResponse {
  order: null | { id: string; program: ProgramId; meals_per_day: number; days_per_week: number; weeks: number; start_date: string; delivery_slot: string; kcal_target: number | null; amount_fils: number; status: string };
  address?: Address; days?: Day[]; remainingDays?: number; today?: string;
}

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const { t, c } = useI18n();
  const [params, setParams] = useSearchParams();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [swap, setSwap] = useState<{ date: string; slot: Slot } | null>(null);
  const [detail, setDetail] = useState<Meal | null>(null);
  const [editAddress, setEditAddress] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const checkout = params.get("checkout");

  const load = useCallback(async () => {
    try {
      const data = await api<PlanResponse>("/api/plan");
      setPlan(data);
      setError("");
      return data;
    } catch (e) { setError(e instanceof Error ? t(e.message) : t("Could not load your plan")); return null; }
  }, []);

  useEffect(() => { load(); }, [load]);

  // After Stripe redirects back, the webhook may land a moment later: poll briefly until the plan is active.
  useEffect(() => {
    if (!checkout) return;
    clearDraft();
    let tries = 0;
    const timer = setInterval(async () => {
      const data = await load();
      if (data?.order?.status === "active" || ++tries > 10) { clearInterval(timer); setParams({}, { replace: true }); if (data?.order?.status === "active") flash(t("Payment confirmed. Your plan is live.")); }
    }, 2500);
    return () => clearInterval(timer);
  }, [checkout]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!plan?.days?.length || selected) return;
    setSelected((plan.days.find((d) => d.date >= (plan.today || "") && d.status === "scheduled") || plan.days[0]).date);
  }, [plan, selected]);

  function flash(msg: string) {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }

  const first = session?.user.name?.split(" ")[0];
  if (!plan && !error) return <main className="dash"><div className="dashSkeleton"><i /><i /><i /></div></main>;

  if (error) return <main className="dash"><div className="empty"><h3>{error}</h3><button className="btn secondary" type="button" onClick={load}>{t("Retry")}</button></div></main>;

  if (!plan?.order) {
    return (
      <main className="dash">
        <div className="dashEmpty">
          <Eyebrow>{first ? t("Welcome, {name}", { name: first }) : t("Welcome")}</Eyebrow>
          <h1 className="display l">{t("No plan yet.")}<br /><em>{t("Let's fix that.")}</em></h1>
          <p className="lead">{t("Build a plan in about a minute. Your first box can arrive in two days.")}</p>
          <Link to="/start" className="btn primary lg">{t("Build my plan")} <Arrow /></Link>
        </div>
        <AccountPanel />
      </main>
    );
  }

  const order = plan.order;
  const program = PROGRAMS_BY_ID[order.program];
  const day = plan.days?.find((d) => d.date === selected);
  const target = order.kcal_target ? macroSplit(order.kcal_target, order.program) : null;
  const dayTotals = day?.selections.reduce((sum, s) => {
    const m = scaled(MEALS_BY_ID[s.mealId], order.program);
    return { kcal: sum.kcal + m.kcal, protein: sum.protein + m.protein, carbs: sum.carbs + m.carbs, fat: sum.fat + m.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  async function chooseMeal(mealId: string) {
    if (!swap || !plan) return;
    const { date, slot } = swap;
    const prev = plan;
    // Optimistic update, rolled back on failure.
    setPlan({ ...plan, days: plan.days!.map((d) => d.date !== date ? d : { ...d, selections: d.selections.map((s) => s.slot === slot ? { ...s, mealId } : s) }) });
    setSwap(null);
    try { await api(`/api/plan/days/${date}/slots/${slot}`, { method: "PUT", body: JSON.stringify({ mealId }) }); flash(t("Swapped. Chef's noted it.")); }
    catch (e) { setPlan(prev); flash(e instanceof Error ? t(e.message) : t("Swap failed")); }
  }

  async function skipDay(date: string) {
    if (!confirm(t("Skip {date}? We'll add a delivery day to the end of your plan.", { date: dateLong(date) }))) return;
    try {
      const r = await api<{ addedDate: string }>(`/api/plan/days/${date}/skip`, { method: "POST", body: "{}" });
      await load();
      flash(t("Skipped. Added {date} to the end.", { date: dateMedium(r.addedDate) }));
    } catch (e) { flash(e instanceof Error ? t(e.message) : t("Could not skip")); }
  }

  return (
    <main className="dash">
      <header className="dashHead">
        <div>
          <Eyebrow>{order.status === "active" ? t("Plan live") : t("Awaiting payment")}</Eyebrow>
          <h1 className="display l">{first ? t("Morning, {name}.", { name: first }) : t("Morning.")}</h1>
        </div>
        <Link to="/menu" className="btn ghost">{t("Browse menu")}</Link>
      </header>

      {order.status !== "active" && (
        <div className="notice">
          {checkout ? t("Confirming your payment…") : <>{t("Payment for this plan isn't complete.")} <Link to="/start">{t("Finish checkout")}</Link></>}
        </div>
      )}

      <section className="planCard">
        <div className="planMedia"><img src={program.image} alt="" /></div>
        <div className="planInfo">
          <span className="planName display m">{c.program(program)}</span>
          <dl>
            <div><dt>{t("Meals")}</dt><dd>{t("{m}/day · {d} days/wk", { m: order.meals_per_day, d: order.days_per_week })}</dd></div>
            <div><dt>{t("Deliveries left")}</dt><dd className="tabular">{plan.remainingDays}</dd></div>
            <div><dt>{t("Window")}</dt><dd>{order.delivery_slot === "morning" ? t("5–8 AM") : t("6–10 PM, night before")}</dd></div>
            <div><dt>{t("Paid")}</dt><dd>{aed(order.amount_fils)}</dd></div>
          </dl>
          {plan.address && (
            <p className="planAddress">
              <span>{[plan.address.street, plan.address.unit, plan.address.area, c.emirate(plan.address.emirate)].filter(Boolean).join(t(", "))}</span>
              <button className="linkBtn" type="button" onClick={() => setEditAddress(true)}>{t("Edit")}</button>
            </p>
          )}
        </div>
      </section>

      {plan.days && plan.days.length > 0 ? (
        <>
          <div className="dayStrip" role="tablist" aria-label={t("Delivery days")}>
            {plan.days.map((d) => (
              <button key={d.date} role="tab" aria-selected={selected === d.date} type="button" className={`dayChip ${d.status} ${selected === d.date ? "on" : ""} ${d.date === plan.today ? "today" : ""}`} onClick={() => setSelected(d.date)}>
                {selected === d.date && <motion.span layoutId="dayBg" className="dayBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="dcDay">{dayShort(d.date)}</span>
                <span className="dcNum">{dayNum(d.date)}</span>
                <i className="dcDot" />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {day && (
              <motion.section key={day.date} className="dayView" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }} transition={{ duration: 0.35, ease: EASE_OUT }}>
                <div className="dayHead">
                  <div>
                    <h2 className="display m">{dateLong(day.date)}</h2>
                    <p className="fine">{day.status === "skipped" ? t("Skipped. Moved to the end of your plan.") : day.editable ? t("Editable until 48 hours before delivery.") : t("Locked. The kitchen is on it.")}</p>
                  </div>
                  {day.editable && <button className="btn ghost sm" type="button" onClick={() => skipDay(day.date)}>{t("Skip this day")}</button>}
                </div>
                {day.status === "scheduled" && (
                  <div className="dayGrid">
                    <ol className="dayMeals">
                      {[...day.selections].sort((a, b) => SLOTS_BY_MEALS[order.meals_per_day].indexOf(a.slot) - SLOTS_BY_MEALS[order.meals_per_day].indexOf(b.slot)).map((s, i) => {
                        const meal = MEALS_BY_ID[s.mealId];
                        if (!meal) return null;
                        return (
                          <motion.li key={s.slot} className="dayMeal" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASE_OUT }}>
                            <button type="button" className="dmMedia" onClick={() => setDetail(meal)} aria-label={t("View {name}", { name: c.meal(meal) })}><img src={meal.image} alt="" /></button>
                            <div className="dmText">
                              <small>{c.slot(s.slot)}</small>
                              <b>{c.meal(meal)}</b>
                              <MacroChips m={scaled(meal, order.program)} compact />
                            </div>
                            {day.editable && <button className="btn secondary sm" type="button" onClick={() => setSwap({ date: day.date, slot: s.slot })}>{t("Swap")}</button>}
                          </motion.li>
                        );
                      })}
                    </ol>
                    {dayTotals && (
                      <div className="dayRing">
                        <MacroRing m={dayTotals} size={200} label={t("kcal today")} />
                        {target && <p className="fine">{t("Target {kcal} kcal · {protein}g protein", { kcal: target.kcal.toLocaleString("en"), protein: target.protein })}</p>}
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </>
      ) : order.status === "active" ? (
        <div className="empty"><h3>{t("Plan complete. Nice work.")}</h3><Link to="/start" className="btn primary">{t("Start another plan")}</Link></div>
      ) : null}

      <AccountPanel />

      <Sheet open={!!swap} onClose={() => setSwap(null)} label={t("Swap meal")}>
        {swap && (
          <div className="swapSheet">
            <Eyebrow>{c.slot(swap.slot)} · {dateLong(swap.date)}</Eyebrow>
            <h2 className="display m">{t("Pick your meal")}</h2>
            <div className="swapGrid">
              {menuFor(swap.date, order.program)[slotCategory(swap.slot)].map((meal) => {
                const current = day?.selections.find((s) => s.slot === swap.slot)?.mealId === meal.id;
                return (
                  <button key={meal.id} type="button" className={`swapOpt ${current ? "on" : ""}`} onClick={() => chooseMeal(meal.id)}>
                    <img src={meal.image} alt="" />
                    <span><b>{c.meal(meal)}</b><MacroChips m={scaled(meal, order.program)} compact /></span>
                    {current && <em className="swapCurrent">{t("Current")}</em>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={!!detail} onClose={() => setDetail(null)} label={detail ? c.meal(detail) : t("Meal")}>
        {detail && <MealDetail meal={detail} macros={scaled(detail, order.program)} />}
      </Sheet>

      <Sheet open={editAddress} onClose={() => setEditAddress(false)} label={t("Delivery address")}>
        {plan.address && <AddressForm initial={plan.address} onSaved={async () => { setEditAddress(false); await load(); flash(t("Address updated for upcoming deliveries.")); }} />}
      </Sheet>

      <AnimatePresence>
        {toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }} transition={{ duration: 0.35, ease: EASE_OUT }}>{toast}</motion.div>}
      </AnimatePresence>
    </main>
  );
}

function AddressForm({ initial, onSaved }: { initial: Address; onSaved: () => void }) {
  const { t, c } = useI18n();
  const [a, setA] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { await api("/api/plan/address", { method: "PUT", body: JSON.stringify(a) }); onSaved(); }
    catch (err) { setError(err instanceof Error ? t(err.message) : t("Could not save")); }
    finally { setBusy(false); }
  }
  return (
    <form className="swapSheet" onSubmit={save}>
      <Eyebrow>{t("Delivery address")}</Eyebrow>
      <h2 className="display m">{t("Where should we drop it?")}</h2>
      <div className="formGrid">
        <label className="input"><span>{t("Emirate")}</span><select value={a.emirate} onChange={(e) => setA({ ...a, emirate: e.target.value })}>{EMIRATES.map((x) => <option key={x} value={x}>{c.emirate(x)}</option>)}</select></label>
        <label className="input"><span>{t("Area / community")}</span><input value={a.area} onChange={(e) => setA({ ...a, area: e.target.value })} required /></label>
        <label className="input wide"><span>{t("Street & building")}</span><input value={a.street} onChange={(e) => setA({ ...a, street: e.target.value })} required /></label>
        <label className="input"><span>{t("Apartment / villa")}</span><input value={a.unit} onChange={(e) => setA({ ...a, unit: e.target.value })} /></label>
        <label className="input"><span>{t("Mobile")}</span><input type="tel" value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} required /></label>
        <label className="input wide"><span>{t("Rider notes")}</span><textarea rows={2} value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} /></label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? t("Saving…") : t("Save address")}</button>
    </form>
  );
}

function AccountPanel() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  async function exportData() {
    const data = await api("/api/account/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "dietbox-data.json" });
    link.click();
    URL.revokeObjectURL(url);
  }
  async function remove() {
    if (prompt(t("Type DELETE to request permanent account deletion")) !== "DELETE") return;
    const result = await authClient.deleteUser({ callbackURL: "/" });
    setMessage(result.error ? result.error.message || t("Could not request deletion") : t("Check your email to confirm deletion."));
  }
  return (
    <section className="accountPanel">
      <h3>{t("Account")}</h3>
      <div className="actions">
        <button className="btn ghost sm" type="button" onClick={exportData}>{t("Export my data")}</button>
        <button className="btn ghost sm" type="button" onClick={async () => { await authClient.signOut(); navigate("/"); }}>{t("Sign out")}</button>
        <button className="btn ghost sm danger" type="button" onClick={remove}>{t("Delete account")}</button>
      </div>
      {message && <p className="fine">{message}</p>}
    </section>
  );
}
