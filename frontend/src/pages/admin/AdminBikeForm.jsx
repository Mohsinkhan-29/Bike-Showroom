import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bikesApi } from "../../api/bikes.js";
import { CATEGORY_LABELS } from "../../utils/format.js";

const EMPTY = {
  name: "", category: "commuter", price: "", description: "", image_url: "", stock: "",
};

export default function AdminBikeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [specs, setSpecs] = useState([{ key: "Engine", value: "" }]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    bikesApi.get(id).then((b) => {
      setForm({
        name: b.name, category: b.category, price: b.price, description: b.description,
        image_url: b.image_url || "", stock: b.stock ?? 0,
      });
      const entries = Object.entries(b.specs || {});
      setSpecs(entries.length ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }]);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setUploadingImage(true);
    try {
      const { image_url } = await bikesApi.uploadImage(file);
      setForm((f) => ({ ...f, image_url }));
    } catch (err) {
      setImageError(err.response?.data?.error || "Couldn't upload that image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function updateSpec(i, field, value) {
    setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function addSpecRow() {
    setSpecs((s) => [...s, { key: "", value: "" }]);
  }
  function removeSpecRow(i) {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const specsObj = {};
      specs.forEach(({ key, value }) => {
        if (key.trim()) specsObj[key.trim()] = value;
      });
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0, specs: specsObj };
      if (isEdit) {
        await bikesApi.update(id, payload);
      } else {
        await bikesApi.create(payload);
      }
      navigate("/admin/catalog");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save this bike.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-chrome-light">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl mb-8">{isEdit ? "Edit bike" : "Add a new bike"}</h1>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <label className="block text-sm text-chrome-light mb-1">Model name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm text-chrome-light mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber">
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-chrome-light mb-1">Price (₨)</label>
            <input required type="number" min="0" value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
          </div>
          <div>
            <label className="block text-sm text-chrome-light mb-1">Units in stock</label>
            <input required type="number" min="0" step="1" value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-chrome-light mb-1">Description</label>
          <textarea rows="3" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>

        <div>
          <label className="block text-sm text-chrome-light mb-1">Bike photo (optional)</label>
          <div className="flex items-center gap-4">
            <div className="w-28 h-20 bg-steel border border-steel-line rounded flex items-center justify-center overflow-hidden shrink-0">
              {form.image_url ? (
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-chrome text-xs">No photo</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImage}
                className="text-sm text-chrome-light file:mr-3 file:btn file:btn-outline file:cursor-pointer file:text-xs"
              />
              {uploadingImage && <p className="text-xs text-amber mt-1">Uploading…</p>}
              {imageError && <p className="text-xs text-danger mt-1">{imageError}</p>}
              {form.image_url && !uploadingImage && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                  className="text-xs text-danger hover:underline mt-1"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-chrome mt-1">Leave blank to show the default placeholder icon. JPG/PNG, up to 4MB.</p>
        </div>

        <div>
          <label className="block text-sm text-chrome-light mb-2">Spec sheet</label>
          <div className="grid gap-2">
            {specs.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Label (e.g. Engine)" value={row.key}
                  onChange={(e) => updateSpec(i, "key", e.target.value)}
                  className="flex-1 bg-steel border border-steel-line rounded px-3 py-2 text-sm focus:outline-none focus:border-amber" />
                <input placeholder="Value (e.g. 249cc, twin)" value={row.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  className="flex-1 bg-steel border border-steel-line rounded px-3 py-2 text-sm focus:outline-none focus:border-amber" />
                <button type="button" onClick={() => removeSpecRow(i)} className="px-3 text-danger">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSpecRow} className="text-amber text-sm mt-2 hover:underline">+ Add spec row</button>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add bike"}
          </button>
          <button type="button" onClick={() => navigate("/admin/catalog")} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
