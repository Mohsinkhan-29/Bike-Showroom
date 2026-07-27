import { useEffect, useRef, useState } from "react";
import { chatApi } from "../api/bikes.js";

const GREETING = {
  role: "assistant",
  text: "Hey! I'm the S.M. Autos assistant. Ask me about models, prices, stock, or showroom policies.",
  sources: [],
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await chatApi.send(text, history);
      setMessages((m) => [...m, { role: "assistant", text: res.reply, sources: res.sources || [] }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, something went wrong reaching the assistant. Please try again.", sources: [] },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[340px] max-w-[90vw] h-[460px] bg-asphalt-2 border border-steel-line rounded shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-steel border-b border-steel-line flex items-center justify-between">
            <div>
              <p className="font-display uppercase tracking-wide text-sm">Showroom assistant</p>
              <p className="text-xs text-chrome-light">Ask about bikes, stock, or policies</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-chrome-light hover:text-amber text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-amber text-ink" : "bg-steel border border-steel-line text-offwhite"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.sources?.length > 0 && (
                    <p className="text-[10px] text-chrome mt-1.5 font-mono">
                      Grounded in: {m.sources.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-steel border border-steel-line rounded px-3 py-2 text-sm text-chrome-light">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-steel-line flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
              className="flex-1 bg-steel border border-steel-line rounded px-3 py-2 text-sm focus:outline-none focus:border-amber"
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn btn-primary px-4 py-2 text-xs">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-primary w-14 h-14 rounded-full !p-0 shadow-lg text-2xl"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
