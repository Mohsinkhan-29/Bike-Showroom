import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { dashboardApi } from "../../api/bikes.js";
import { formatPKR, CATEGORY_LABELS } from "../../utils/format.js";

function KpiCard({ label, value, sub }) {
  return (
    <div className="spec-plate">
      <span className="rivet top-2 left-2" />
      <span className="rivet bottom-2 right-2" />
      <p className="text-chrome-light text-xs uppercase tracking-wide font-mono">{label}</p>
      <p className="text-3xl font-display mt-1">{value}</p>
      {sub && <p className="text-xs text-chrome mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi.kpis().then(setData).catch(() => setError("Couldn't load dashboard data."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p className="text-chrome-light">Loading dashboard…</p>;

  const { totals, byCategory, topViewed, leads, demandForecast } = data;

  return (
    <div>
      <h1 className="text-3xl mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Total bikes" value={totals.total_bikes} />
        <KpiCard label="Avg. price" value={formatPKR(totals.avg_price)} />
        <KpiCard label="Total leads" value={leads.total} sub={`${leads.last7Days} in last 7 days`} />
        <KpiCard label="Price range" value={`${formatPKR(totals.min_price)} – ${formatPKR(totals.max_price)}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="spec-plate">
          <h2 className="text-lg mb-4">Catalog by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory.map((c) => ({ ...c, label: CATEGORY_LABELS[c.category] || c.category }))}>
              <XAxis dataKey="label" stroke="#9A9C9F" fontSize={12} />
              <YAxis stroke="#9A9C9F" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1E2023", border: "1px solid #3A3D43" }} />
              <Bar dataKey="count" fill="#FFB020" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="spec-plate">
          <h2 className="text-lg mb-4">Leads — last 14 days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={leads.byDay}>
              <CartesianGrid stroke="#3A3D43" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#9A9C9F" fontSize={11} />
              <YAxis stroke="#9A9C9F" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1E2023", border: "1px solid #3A3D43" }} />
              <Line type="monotone" dataKey="count" stroke="#FFB020" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="spec-plate">
          <h2 className="text-lg mb-4">Most viewed models</h2>
          <ul className="space-y-2">
            {topViewed.map((b, i) => (
              <li key={b.id} className="flex items-center justify-between text-sm border-b border-steel-line/60 pb-2 last:border-0">
                <span><span className="text-chrome font-mono mr-2">#{i + 1}</span>{b.name}</span>
                <span className="font-mono text-amber">{b.views} views</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="spec-plate">
          <h2 className="text-lg mb-4">Demand forecast — recommendation requests (30d)</h2>
          <p className="text-xs text-chrome-light mb-3">What riders are actually asking the recommender for — use this to guide stocking.</p>
          {demandForecast.length === 0 ? (
            <p className="text-chrome text-sm">No recommendation requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {demandForecast.map((d) => (
                <li key={d.use_case} className="flex items-center justify-between text-sm border-b border-steel-line/60 pb-2 last:border-0">
                  <span className="capitalize">{d.use_case}</span>
                  <span className="font-mono text-amber">{d.requests} requests · avg budget {formatPKR(d.avg_budget)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="spec-plate">
        <h2 className="text-lg mb-4">Recent leads</h2>
        {leads.recent.length === 0 ? (
          <p className="text-chrome text-sm">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-chrome-light font-mono text-xs uppercase">
                  <th className="pb-2">Name</th><th className="pb-2">Phone</th><th className="pb-2">Interest</th><th className="pb-2">Model</th>
                </tr>
              </thead>
              <tbody>
                {leads.recent.map((l) => (
                  <tr key={l.id} className="border-t border-steel-line/60">
                    <td className="py-2">{l.name}</td>
                    <td className="py-2">{l.phone}</td>
                    <td className="py-2">{l.interest || "—"}</td>
                    <td className="py-2">{l.model || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
