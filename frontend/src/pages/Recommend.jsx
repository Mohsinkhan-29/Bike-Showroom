import { useState } from "react";
import { Link } from "react-router-dom";
import { recommendApi } from "../api/bikes.js";
import BikeCard from "../components/BikeCard.jsx";

const USE_CASES = [
  { value: "commute", label: "Daily commuting" },
  { value: "sport", label: "Speed / sport riding" },
  { value: "touring", label: "Long-distance touring" },
  { value: "cruising", label: "Relaxed cruising" },
  { value: "eco", label: "Eco-friendly / electric" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export default function Recommend() {
  const [form, setForm] = useState({ budgetMin: "", budgetMax: "", useCase: "commute", experience: "beginner" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await recommendApi.submit({
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        useCase: form.useCase,
        experience: form.experience,
      });
      setResults(data.recommendations);
    } catch {
      setError("Couldn't get a recommendation right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page py-16">
      <span className="eyebrow">02 — Find my bike</span>
      <h1 className="text-[clamp(32px,5vw,50px)] mt-3">Get a personalized recommendation</h1>
      <p className="text-chrome-light max-w-2xl mt-2">
        Answer a few questions and we'll score the current catalog against your budget, riding
        style and experience level.
      </p>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5 mt-8 max-w-2xl">
        <div>
          <label className="block text-sm text-chrome-light mb-1">Min budget (₨)</label>
          <input
            type="number" min="0" placeholder="e.g. 200000"
            value={form.budgetMin}
            onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Max budget (₨)</label>
          <input
            type="number" min="0" placeholder="e.g. 900000"
            value={form.budgetMax}
            onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">What will you use it for?</label>
          <select
            value={form.useCase}
            onChange={(e) => setForm((f) => ({ ...f, useCase: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          >
            {USE_CASES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Riding experience</label>
          <select
            value={form.experience}
            onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          >
            {EXPERIENCE.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary sm:col-span-2 justify-self-start">
          {loading ? "Scoring catalog…" : "Show my matches"}
        </button>
      </form>

      {error && <p className="text-danger mt-6">{error}</p>}

      {results && (
        <div className="mt-12">
          <h2 className="text-2xl mb-6">Your top matches</h2>
          {results.length === 0 ? (
            <p className="text-chrome-light">No strong matches — try widening your budget. <Link to="/bikes" className="text-amber hover:underline">Browse the full catalog</Link> instead.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {results.map((b) => (
                <div key={b.id} className="relative">
                  <span className="absolute -top-3 left-4 z-10 bg-amber text-ink text-xs font-mono font-bold px-2 py-1 rounded">
                    {b.matchScore}% match
                  </span>
                  <BikeCard bike={b} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
