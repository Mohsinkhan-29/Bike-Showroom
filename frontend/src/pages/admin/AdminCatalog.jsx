import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bikesApi } from "../../api/bikes.js";
import { formatPKR, CATEGORY_LABELS } from "../../utils/format.js";

function StockCell({ bike, onSaved }) {
  const [value, setValue] = useState(bike.stock);
  const [saving, setSaving] = useState(false);
  const dirty = Number(value) !== Number(bike.stock);

  async function save() {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
    setSaving(true);
    try {
      const updated = await bikesApi.updateStock(bike.id, n);
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 bg-steel border border-steel-line rounded px-2 py-1 text-sm focus:outline-none focus:border-amber"
      />
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="text-amber text-xs hover:underline disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      )}
      {!dirty && Number(bike.stock) === 0 && (
        <span className="text-[10px] uppercase tracking-wide text-danger font-mono">Out of stock</span>
      )}
    </div>
  );
}

export default function AdminCatalog() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    bikesApi.list().then(setBikes).catch(() => setError("Couldn't load catalog.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleStockSaved(updated) {
    setBikes((bs) => bs.map((b) => (b.id === updated.id ? updated : b)));
  }

  async function handleDelete(bike) {
    if (!confirm(`Remove "${bike.name}" from the catalog?`)) return;
    await bikesApi.remove(bike.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Catalog</h1>
        <Link to="/admin/catalog/new" className="btn btn-primary">+ Add bike</Link>
      </div>

      {loading && <p className="text-chrome-light">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto spec-plate">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-chrome-light font-mono text-xs uppercase">
                <th className="pb-3">Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Views</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {bikes.map((b) => (
                <tr key={b.id} className="border-t border-steel-line/60">
                  <td className="py-3">{b.name}</td>
                  <td className="py-3">{CATEGORY_LABELS[b.category] || b.category}</td>
                  <td className="py-3 font-mono text-amber">{formatPKR(b.price)}</td>
                  <td className="py-3"><StockCell bike={b} onSaved={handleStockSaved} /></td>
                  <td className="py-3">{b.views}</td>
                  <td className="py-3 text-right space-x-3">
                    <Link to={`/admin/catalog/${b.id}/edit`} className="text-amber hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(b)} className="text-danger hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
