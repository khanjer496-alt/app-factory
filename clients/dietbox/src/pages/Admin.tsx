import { useEffect, useState } from "react";
import { MEALS_BY_ID, PROGRAMS_BY_ID, marketToday } from "../../shared/catalog";
import { api } from "../lib/api";
import { aed, dateLong, dateMedium } from "../lib/format";
import { Eyebrow } from "../components/brand";

interface Kitchen { date: string; dishes: { meal_id: string; program: string; portions: number }[]; drops: { emirate: string; delivery_slot: string; drops: number }[] }
interface Order { id: string; email: string; program: string; meals_per_day: number; days_per_week: number; weeks: number; start_date: string; amount_fils: number; status: string; created_at: number }
interface Overview { users: number; activeSubscriptions: number; failedWebhooks: number }

// Admin access is enforced server-side (requireAdmin); this page only renders what the API allows.
export default function Admin() {
  const [tab, setTab] = useState<"kitchen" | "orders">("kitchen");
  const [date, setDate] = useState(marketToday());
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { api<Overview>("/api/admin/overview").then(setOverview).catch((e) => setError(String(e.message || e))); }, []);
  useEffect(() => {
    if (tab === "kitchen") api<Kitchen>(`/api/admin/kitchen?date=${date}`).then(setKitchen).catch((e) => setError(String(e.message || e)));
    else api<Order[]>("/api/admin/orders").then(setOrders).catch((e) => setError(String(e.message || e)));
  }, [tab, date]);

  const totalPortions = kitchen?.dishes.reduce((n, d) => n + d.portions, 0) || 0;
  const totalDrops = kitchen?.drops.reduce((n, d) => n + d.drops, 0) || 0;

  return (
    <main className="dash admin">
      <header className="dashHead">
        <div><Eyebrow>Operations</Eyebrow><h1 className="display l">Kitchen control</h1></div>
        <div className="segmented" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "kitchen"} className={tab === "kitchen" ? "on solid" : ""} onClick={() => setTab("kitchen")}><span className="segText">Production</span></button>
          <button type="button" role="tab" aria-selected={tab === "orders"} className={tab === "orders" ? "on solid" : ""} onClick={() => setTab("orders")}><span className="segText">Orders</span></button>
        </div>
      </header>
      {error && <p className="error">{error}</p>}
      {overview && (
        <div className="statRow">
          <div className="stat"><span>Customers</span><b>{overview.users}</b></div>
          <div className="stat"><span>Portions {dateMedium(date)}</span><b>{totalPortions}</b></div>
          <div className="stat"><span>Drops {dateMedium(date)}</span><b>{totalDrops}</b></div>
          <div className="stat"><span>Failed webhooks</span><b>{overview.failedWebhooks}</b></div>
        </div>
      )}
      {tab === "kitchen" && (
        <section className="adminCard">
          <div className="adminCardHead">
            <h2 className="display s">{dateLong(date)}</h2>
            <label className="input inline"><span>Date</span><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
          </div>
          {kitchen && kitchen.dishes.length === 0 ? <p className="fine">Nothing scheduled for this date.</p> : (
            <table className="table">
              <thead><tr><th>Dish</th><th>Programme</th><th>Portion</th><th className="num">Portions</th></tr></thead>
              <tbody>
                {kitchen?.dishes.map((d) => (
                  <tr key={`${d.meal_id}-${d.program}`}>
                    <td><span className="cellMeal"><img src={MEALS_BY_ID[d.meal_id]?.image} alt="" />{MEALS_BY_ID[d.meal_id]?.name || d.meal_id}</span></td>
                    <td>{PROGRAMS_BY_ID[d.program]?.name || d.program}</td>
                    <td>×{PROGRAMS_BY_ID[d.program]?.portion ?? 1}</td>
                    <td className="num">{d.portions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {kitchen && kitchen.drops.length > 0 && (
            <>
              <h3>Delivery drops</h3>
              <table className="table">
                <thead><tr><th>Emirate</th><th>Window</th><th className="num">Drops</th></tr></thead>
                <tbody>{kitchen.drops.map((d) => <tr key={`${d.emirate}-${d.delivery_slot}`}><td>{d.emirate}</td><td>{d.delivery_slot}</td><td className="num">{d.drops}</td></tr>)}</tbody>
              </table>
            </>
          )}
        </section>
      )}
      {tab === "orders" && (
        <section className="adminCard">
          <table className="table">
            <thead><tr><th>Customer</th><th>Plan</th><th>Starts</th><th>Status</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.email}</td>
                  <td>{PROGRAMS_BY_ID[o.program]?.name} · {o.meals_per_day}×{o.days_per_week} · {o.weeks}w</td>
                  <td>{dateMedium(o.start_date)}</td>
                  <td><span className={`status ${o.status}`}>{o.status.replace("_", " ")}</span></td>
                  <td className="num">{aed(o.amount_fils)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="fine">No orders yet.</p>}
        </section>
      )}
    </main>
  );
}
