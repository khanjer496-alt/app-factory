import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { EMIRATES, MEALS_BY_ID, PROGRAMS_BY_ID, SLOTS_BY_MEALS, SLOT_LABEL, menuFor, scaled, slotCategory, type Meal, type ProgramId, type Slot } from "../../shared/catalog";
import { macroSplit } from "../../shared/nutrition";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { clearDraft } from "../lib/draft";
import { aed, dateLong, dateMedium, dayNum, dayShort } from "../lib/format";
import { Arrow, Eyebrow } from "../components/brand";
import { EASE_OUT } from "../components/motion";
import { MacroChips, MacroRing, MealDetail, Sheet } from "../components/meal";

interface Day { date: string; status: "scheduled" | "skipped"; editable: boolean; selections: { slot: Slot; mealId: string }[] }
interface Address { emirate: string; area: string; street: string; unit: string; phone: string; notes: string }
interface PlanResponse {
  order: null | { id: string; program: ProgramId; meals_per_day: number; days_per_week: number; weeks: number; start_date: string; delivery_slot: string; kcal_target: number | null; amount_fils: number; status: string };
  address?: Address; days?: Day[]; remainingDays?: number; today?: string;
}

export default function Dashboard() {
  const { data: session } = authClient.useSession();
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
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load your plan"); return null; }
  }, []);

  useEffect(() => { load(); }, [load]);

  // After Stripe redirects back, the webhook may land a moment later: poll briefly until the plan is active.
  useEffect(() => {
    if (!checkout) return;
    clearDraft();
    let tries = 0;
    const timer = setInterval(async () => {
      const data = await load();
      if (data?.order?.status === "active" || ++tries > 10) { clearInterval(timer); setParams({}, { replace: true }); if (data?.order?.status === "active") flash("Payment confirmed. Your plan is live."); }
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

  if (error) return <main className="dash"><div className="empty"><h3>{error}</h3><button className="btn secondary" type="button" onClick={load}>Retry</button></div></main>;

  if (!plan?.order) {
    return (
      <main className="dash">
        <div className="dashEmpty">
          <Eyebrow>Welcome{first ? `, ${first}` : ""}</Eyebrow>
          <h1 className="display l">No plan yet.<br /><em>Let's fix that.</em></h1>
          <p className="lead">Build a plan in about a minute. Your first box can arrive in two days.</p>
          <Link to="/start" className="btn primary lg">Build my plan <Arrow /></Link>
        </div>
        <AccountPanel />
      </main>
    );
  }

  const order = plan.order;
  const program = PROGRAMS_BY_ID[order.program];
  const day = plan.days?.find((d) => d.date === selected);
  const target = order.kcal_target ? macroSplit(order.kcal_target, order.program) : null;
  const dayTotals = day?.selections.reduce((t, s) => {
    const m = scaled(MEALS_BY_ID[s.mealId], order.program);
    return { kcal: t.kcal + m.kcal, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  async function chooseMeal(mealId: string) {
    if (!swap || !plan) return;
    const { date, slot } = swap;
    const prev = plan;
    // Optimistic update, rolled back on failure.
    setPlan({ ...plan, days: plan.days!.map((d) => d.date !== date ? d : { ...d, selections: d.selections.map((s) => s.slot === slot ? { ...s, mealId } : s) }) });
    setSwap(null);
    try { await api(`/api/plan/days/${date}/slots/${slot}`, { method: "PUT", body: JSON.stringify({ mealId }) }); flash("Swapped. Chef's noted it."); }
    catch (e) { setPlan(prev); flash(e instanceof Error ? e.message : "Swap failed"); }
  }

  async function skipDay(date: string) {
    if (!confirm(`Skip ${dateLong(date)}? We'll add a delivery day to the end of your plan.`)) return;
    try {
      const r = await api<{ addedDate: string }>(`/api/plan/days/${date}/skip`, { method: "POST", body: "{}" });
      await load();
      flash(`Skipped. Added ${dateMedium(r.addedDate)} to the end.`);
    } catch (e) { flash(e instanceof Error ? e.message : "Could not skip"); }
  }

  return (
    <main className="dash">
      <header className="dashHead">
        <div>
          <Eyebrow>{order.status === "active" ? "Plan live" : "Awaiting payment"}</Eyebrow>
          <h1 className="display l">Morning{first ? `, ${first}` : ""}.</h1>
        </div>
        <Link to="/menu" className="btn ghost">Browse menu</Link>
      </header>

      {order.status !== "active" && (
        <div className="notice">
          {checkout ? "Confirming your payment…" : <>Payment for this plan isn't complete. <Link to="/start">Finish checkout</Link></>}
        </div>
      )}

      <section className="planCard">
        <div className="planMedia"><img src={program.image} alt="" /></div>
        <div className="planInfo">
          <span className="planName display m">{program.name}</span>
          <dl>
            <div><dt>Meals</dt><dd>{order.meals_per_day}/day · {order.days_per_week} days/wk</dd></div>
            <div><dt>Deliveries left</dt><dd className="tabular">{plan.remainingDays}</dd></div>
            <div><dt>Window</dt><dd>{order.delivery_slot === "morning" ? "5–8 AM" : "6–10 PM, night before"}</dd></div>
            <div><dt>Paid</dt><dd>{aed(order.amount_fils)}</dd></div>
          </dl>
          {plan.address && (
            <p className="planAddress">
              <span>📍 {plan.address.street}{plan.address.unit && `, ${plan.address.unit}`}, {plan.address.area}, {plan.address.emirate}</span>
              <button className="linkBtn" type="button" onClick={() => setEditAddress(true)}>Edit</button>
            </p>
          )}
        </div>
      </section>

      {plan.days && plan.days.length > 0 ? (
        <>
          <div className="dayStrip" role="tablist" aria-label="Delivery days">
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
                    <p className="fine">{day.status === "skipped" ? "Skipped. Moved to the end of your plan." : day.editable ? "Editable until 48 hours before delivery." : "Locked. The kitchen is on it."}</p>
                  </div>
                  {day.editable && <button className="btn ghost sm" type="button" onClick={() => skipDay(day.date)}>Skip this day</button>}
                </div>
                {day.status === "scheduled" && (
                  <div className="dayGrid">
                    <ol className="dayMeals">
                      {[...day.selections].sort((a, b) => SLOTS_BY_MEALS[order.meals_per_day].indexOf(a.slot) - SLOTS_BY_MEALS[order.meals_per_day].indexOf(b.slot)).map((s, i) => {
                        const meal = MEALS_BY_ID[s.mealId];
                        if (!meal) return null;
                        return (
                          <motion.li key={s.slot} className="dayMeal" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASE_OUT }}>
                            <button type="button" className="dmMedia" onClick={() => setDetail(meal)} aria-label={`About ${meal.name}`}><img src={meal.image} alt="" /></button>
                            <div className="dmText">
                              <small>{SLOT_LABEL[s.slot]}</small>
                              <b>{meal.name}</b>
                              <MacroChips m={scaled(meal, order.program)} compact />
                            </div>
                            {day.editable && <button className="btn secondary sm" type="button" onClick={() => setSwap({ date: day.date, slot: s.slot })}>Swap</button>}
                          </motion.li>
                        );
                      })}
                    </ol>
                    {dayTotals && (
                      <div className="dayRing">
                        <MacroRing m={dayTotals} size={200} label="kcal today" />
                        {target && <p className="fine">Target {target.kcal.toLocaleString()} kcal · {target.protein}g protein</p>}
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </>
      ) : order.status === "active" ? (
        <div className="empty"><h3>Plan complete. Nice work.</h3><Link to="/start" className="btn primary">Start another plan</Link></div>
      ) : null}

      <AccountPanel />

      <Sheet open={!!swap} onClose={() => setSwap(null)} label="Swap meal">
        {swap && (
          <div className="swapSheet">
            <Eyebrow>{SLOT_LABEL[swap.slot]} · {dateLong(swap.date)}</Eyebrow>
            <h2 className="display m">Pick your {SLOT_LABEL[swap.slot].toLowerCase()}</h2>
            <div className="swapGrid">
              {menuFor(swap.date, order.program)[slotCategory(swap.slot)].map((meal) => {
                const current = day?.selections.find((s) => s.slot === swap.slot)?.mealId === meal.id;
                return (
                  <button key={meal.id} type="button" className={`swapOpt ${current ? "on" : ""}`} onClick={() => chooseMeal(meal.id)}>
                    <img src={meal.image} alt="" />
                    <span><b>{meal.name}</b><MacroChips m={scaled(meal, order.program)} compact /></span>
                    {current && <em className="swapCurrent">Current</em>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={!!detail} onClose={() => setDetail(null)} label={detail?.name || "Meal"}>
        {detail && <MealDetail meal={detail} macros={scaled(detail, order.program)} />}
      </Sheet>

      <Sheet open={editAddress} onClose={() => setEditAddress(false)} label="Delivery address">
        {plan.address && <AddressForm initial={plan.address} onSaved={async () => { setEditAddress(false); await load(); flash("Address updated for upcoming deliveries."); }} />}
      </Sheet>

      <AnimatePresence>
        {toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }} transition={{ duration: 0.35, ease: EASE_OUT }}>{toast}</motion.div>}
      </AnimatePresence>
    </main>
  );
}

function AddressForm({ initial, onSaved }: { initial: Address; onSaved: () => void }) {
  const [a, setA] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { await api("/api/plan/address", { method: "PUT", body: JSON.stringify(a) }); onSaved(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save"); }
    finally { setBusy(false); }
  }
  return (
    <form className="swapSheet" onSubmit={save}>
      <Eyebrow>Delivery address</Eyebrow>
      <h2 className="display m">Where should we drop it?</h2>
      <div className="formGrid">
        <label className="input"><span>Emirate</span><select value={a.emirate} onChange={(e) => setA({ ...a, emirate: e.target.value })}>{EMIRATES.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="input"><span>Area</span><input value={a.area} onChange={(e) => setA({ ...a, area: e.target.value })} required /></label>
        <label className="input wide"><span>Street & building</span><input value={a.street} onChange={(e) => setA({ ...a, street: e.target.value })} required /></label>
        <label className="input"><span>Apartment / villa</span><input value={a.unit} onChange={(e) => setA({ ...a, unit: e.target.value })} /></label>
        <label className="input"><span>Mobile</span><input type="tel" value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} required /></label>
        <label className="input wide"><span>Rider notes</span><textarea rows={2} value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} /></label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn primary" disabled={busy}>{busy ? "Saving…" : "Save address"}</button>
    </form>
  );
}

function AccountPanel() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  async function exportData() {
    const data = await api("/api/account/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "dietbox-data.json" });
    link.click();
    URL.revokeObjectURL(url);
  }
  async function remove() {
    if (prompt("Type DELETE to request permanent account deletion") !== "DELETE") return;
    const result = await authClient.deleteUser({ callbackURL: "/" });
    setMessage(result.error ? result.error.message || "Could not request deletion" : "Check your email to confirm deletion.");
  }
  return (
    <section className="accountPanel">
      <h3>Account</h3>
      <div className="actions">
        <button className="btn ghost sm" type="button" onClick={exportData}>Export my data</button>
        <button className="btn ghost sm" type="button" onClick={async () => { await authClient.signOut(); navigate("/"); }}>Sign out</button>
        <button className="btn ghost sm danger" type="button" onClick={remove}>Delete account</button>
      </div>
      {message && <p className="fine">{message}</p>}
    </section>
  );
}
