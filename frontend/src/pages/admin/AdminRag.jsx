import { useEffect, useRef, useState } from "react";
import { ragApi } from "../../api/rag.js";

export default function AdminRag() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const [textSource, setTextSource] = useState("");
  const [textContent, setTextContent] = useState("");
  const fileInputRef = useRef(null);

  function load() {
    setLoading(true);
    ragApi.list().then(setSources).catch(() => setError("Couldn't load the knowledge base.")).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await ragApi.upload(file);
      setStatus(`Indexed "${res.source}" into ${res.chunks} chunk(s).`);
      load();
    } catch (err) {
      setStatus(err.response?.data?.error || "Upload failed.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleTextSubmit(e) {
    e.preventDefault();
    if (!textSource.trim() || !textContent.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await ragApi.addText(textSource.trim(), textContent);
      setStatus(`Indexed "${res.source}" into ${res.chunks} chunk(s).`);
      setTextSource("");
      setTextContent("");
      load();
    } catch (err) {
      setStatus(err.response?.data?.error || "Couldn't save that document.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(source) {
    if (!confirm(`Remove "${source}" from the chatbot's knowledge base?`)) return;
    await ragApi.remove(source);
    load();
  }

  return (
    <div>
      <h1 className="text-3xl mb-2">Chatbot knowledge base</h1>
      <p className="text-chrome-light max-w-2xl mb-8">
        Upload FAQs, policies, or any dealership documents here. The chatbot searches these
        alongside the live bike catalog to answer visitor questions — it won't invent facts
        that aren't in either place.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="spec-plate">
          <h2 className="text-lg mb-3">Upload a file</h2>
          <p className="text-xs text-chrome-light mb-3">Plain text formats: .txt, .md, .csv (max 2MB).</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,.json"
            onChange={handleFileUpload}
            disabled={busy}
            className="text-sm text-chrome-light file:mr-3 file:btn file:btn-outline file:cursor-pointer"
          />
        </div>

        <form onSubmit={handleTextSubmit} className="spec-plate">
          <h2 className="text-lg mb-3">Or paste text directly</h2>
          <div className="grid gap-3">
            <input
              value={textSource}
              onChange={(e) => setTextSource(e.target.value)}
              placeholder="Document name (e.g. warranty-policy)"
              className="bg-steel border border-steel-line rounded px-3 py-2 text-sm focus:outline-none focus:border-amber"
            />
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows="4"
              placeholder="Paste the document content…"
              className="bg-steel border border-steel-line rounded px-3 py-2 text-sm focus:outline-none focus:border-amber"
            />
            <button type="submit" disabled={busy} className="btn btn-primary self-start text-xs px-4 py-2">
              {busy ? "Indexing…" : "Add to knowledge base"}
            </button>
          </div>
        </form>
      </div>

      {status && <p className="text-amber text-sm mb-6">{status}</p>}

      <div className="spec-plate">
        <h2 className="text-lg mb-4">Indexed documents</h2>
        {loading && <p className="text-chrome-light text-sm">Loading…</p>}
        {error && <p className="text-danger text-sm">{error}</p>}
        {!loading && !error && sources.length === 0 && (
          <p className="text-chrome text-sm">No documents yet — upload one above to get started.</p>
        )}
        {!loading && !error && sources.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-chrome-light font-mono text-xs uppercase">
                <th className="pb-2">Source</th>
                <th className="pb-2">Chunks</th>
                <th className="pb-2">Added</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.source} className="border-t border-steel-line/60">
                  <td className="py-2">{s.source}</td>
                  <td className="py-2">{s.chunks}</td>
                  <td className="py-2 text-chrome-light">{new Date(s.added_at).toLocaleDateString()}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => handleDelete(s.source)} className="text-danger hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
