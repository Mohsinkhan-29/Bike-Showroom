import { useState } from "react";
import { leadsApi } from "../api/bikes.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", interest: "Booking a test ride", model: "", message: "" });
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await leadsApi.create(form);
      setStatus("sent");
      setForm({ name: "", phone: "", interest: "Booking a test ride", model: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="container-page py-16">
      <span className="eyebrow">04 — Contact</span>
      <h1 className="text-[clamp(32px,5vw,50px)] mt-3">Book a test ride, or just ask</h1>
      <p className="text-chrome-light max-w-xl mt-2">
        Fill out the form and the sales desk gets back to you within one business day.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-5 max-w-xl mt-8">
        <div>
          <label className="block text-sm text-chrome-light mb-1">Full name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Phone number</label>
          <input required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">I'm interested in</label>
          <select value={form.interest} onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber">
            <option>Booking a test ride</option>
            <option>General sales question</option>
            <option>Service appointment</option>
            <option>Financing / EMI</option>
            <option>Trade-in valuation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Model (optional)</label>
          <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Message</label>
          <textarea rows="4" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber" />
        </div>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary justify-self-start">
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" && <p className="text-amber text-sm">Thanks — the sales desk will reach out shortly.</p>}
        {status === "error" && <p className="text-danger text-sm">Something went wrong. Please try again.</p>}
      </form>
    </section>
  );
}
