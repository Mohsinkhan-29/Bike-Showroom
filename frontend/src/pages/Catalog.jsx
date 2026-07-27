import { useEffect, useState } from "react";
import { bikesApi } from "../api/bikes.js";
import BikeCard from "../components/BikeCard.jsx";
import { CATEGORY_LABELS } from "../utils/format.js";

const FILTERS = [{ value: "all", label: "All models" }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))];

export default function Catalog() {
  const [bikes, setBikes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bikesApi
      .list({ category: filter, search: search || undefined })
      .then(setBikes)
      .catch(() => setError("Couldn't load the catalog. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [filter, search]);

  return (
    <section className="container-page py-16">
      <span className="eyebrow">01 — Catalog</span>
      <h1 className="text-[clamp(32px,5vw,50px)] mt-3">Full bike catalog</h1>
      <p className="text-chrome-light max-w-2xl mt-2">
        Every model currently in the database — managed live from the admin panel.
      </p>

      <div className="flex flex-wrap gap-2 mt-8 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded text-sm font-display uppercase tracking-wide border ${
              filter === f.value ? "bg-amber text-ink border-amber" : "border-steel-line text-chrome-light hover:border-amber"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search models…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto bg-steel border border-steel-line rounded px-4 py-2 text-sm placeholder:text-chrome focus:outline-none focus:border-amber"
        />
      </div>

      {loading && <p className="text-chrome-light">Loading catalog…</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && bikes.length === 0 && (
        <p className="text-chrome-light">No bikes match that filter.</p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {bikes.map((b) => <BikeCard key={b.id} bike={b} />)}
      </div>
    </section>
  );
}
