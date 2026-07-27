// Thin wrapper around Google's Gemini REST API — no SDK dependency needed,
// just fetch (built into Node 18+). Two things live here:
//   1. embedText()  -> turns text into a vector, used for RAG retrieval
//   2. chatComplete() -> generates the chatbot's reply given context
import { env } from "../config/env.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

function assertConfigured() {
  if (!env.geminiApiKey) {
    const err = new Error("GEMINI_API_KEY is not set on the backend");
    err.status = 503;
    throw err;
  }
}

// Turns a piece of text into an embedding vector (array of floats).
// Used both when indexing RAG documents and when embedding the user's
// question, so the two can be compared with cosine similarity.
export async function embedText(text) {
  assertConfigured();
  const url = `${BASE}/models/${env.geminiEmbeddingModel}:embedContent?key=${env.geminiApiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Gemini embedding request failed (${res.status}): ${detail}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values)) {
    const err = new Error("Gemini embedding response missing values");
    err.status = 502;
    throw err;
  }
  return values;
}

// Calls Gemini's chat model with a system instruction (the retrieved RAG
// context + catalog snapshot) plus the running conversation.
// history: [{ role: 'user' | 'model', text: string }, ...]
export async function chatComplete({ systemInstruction, history, message }) {
  assertConfigured();
  const url = `${BASE}/models/${env.geminiChatModel}:generateContent?key=${env.geminiApiKey}`;

  const contents = [
    ...(history || []).map((turn) => ({
      role: turn.role === "assistant" || turn.role === "model" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Gemini chat request failed (${res.status}): ${detail}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return text.trim() || "Sorry, I couldn't come up with a reply for that.";
}
