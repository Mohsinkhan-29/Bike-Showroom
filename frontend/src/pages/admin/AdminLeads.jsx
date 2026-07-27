import { useEffect, useState } from "react";
import { leadsApi } from "../../api/bikes.js";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    leadsApi.list().then(setLeads).catch(() => setError("Couldn't load leads."));
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8">Leads</h1>
      {error && <p className="text-danger">{error}</p>}
      <div className="overflow-x-auto spec-plate">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-chrome-light font-mono text-xs uppercase">
              <th className="pb-3">Name</th><th className="pb-3">Phone</th><th className="pb-3">Interest</th>
              <th className="pb-3">Model</th><th className="pb-3">Message</th><th className="pb-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-steel-line/60 align-top">
                <td className="py-3">{l.name}</td>
                <td className="py-3">{l.phone}</td>
                <td className="py-3">{l.interest || "—"}</td>
                <td className="py-3">{l.model || "—"}</td>
                <td className="py-3 max-w-xs truncate" title={l.message}>{l.message || "—"}</td>
                <td className="py-3 text-chrome-light">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && !error && <p className="text-chrome-light py-4">No leads yet.</p>}
      </div>
    </div>
  );
}
