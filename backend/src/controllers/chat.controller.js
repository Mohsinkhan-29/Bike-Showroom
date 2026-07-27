import { query } from "../db.js";
import { env } from "../config/env.js";
import { embedText, chatComplete } from "../utils/gemini.js";
import { topMatches } from "../utils/rag.js";
import { formatPKR } from "../utils/format.js";

// Gives the model a live snapshot of the catalog (name, category, price,
// stock) so it can answer "what's in stock" / "what do you recommend under
// X budget" questions accurately instead of guessing.
async function getCatalogSnapshot() {
  const { rows } = await query(
    `SELECT name, category, price, stock FROM bikes WHERE is_active = true ORDER BY category, price`
  );
  if (!rows.length) return "The catalog is currently empty.";
  return rows
    .map((b) => `- ${b.name} (${b.category}) — ${formatPKR(b.price)} — ${b.stock > 0 ? `${b.stock} in stock` : "out of stock"}`)
    .join("\n");
}

function buildSystemInstruction(catalogSnapshot, ragContext) {
  return [
    "You are the virtual sales assistant for S.M. Autos, a motorcycle showroom.",
    "Be concise, friendly, and specific. Only state facts that are backed by the CATALOG or KNOWLEDGE BASE sections below — never invent prices, specs, stock, or policies.",
    "If a rider's question isn't covered by the sections below, say you're not sure and suggest they contact the showroom, rather than guessing.",
    "",
    "## CATALOG (live, current stock)",
    catalogSnapshot,
    "",
    "## KNOWLEDGE BASE (dealership policies, FAQs, etc.)",
    ragContext || "No knowledge base documents have been uploaded yet.",
  ].join("\n");
}

// POST /api/chat
// body: { message, history? }
// history: [{ role: 'user'|'assistant', text }, ...] — the running
// conversation so far, sent by the frontend on each turn.
export async function chat(req, res, next) {
  try {
    const { message, history } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!env.geminiApiKey) {
      return res.json({
        reply:
          "The chatbot isn't configured yet — an admin needs to set GEMINI_API_KEY in the backend .env file.",
        configured: false,
        sources: [],
      });
    }

    // 1. Embed the question and pull the most relevant knowledge-base chunks.
    const queryEmbedding = await embedText(message);
    const { rows: allChunks } = await query(`SELECT source, content, embedding FROM rag_chunks`);
    const parsed = allChunks.map((r) => ({
      ...r,
      embedding: Array.isArray(r.embedding) ? r.embedding : JSON.parse(r.embedding),
    }));
    const matches = topMatches(parsed, queryEmbedding, 4);
    const ragContext = matches.map((m) => `[${m.source}]\n${m.content}`).join("\n\n");

    // 2. Live catalog snapshot so stock/price questions are grounded.
    const catalogSnapshot = await getCatalogSnapshot();

    // 3. Ask Gemini, grounded in both sections above.
    const reply = await chatComplete({
      systemInstruction: buildSystemInstruction(catalogSnapshot, ragContext),
      history,
      message,
    });

    // Distinct source filenames used, for a small "grounded in:" UI hint.
    const sources = [...new Set(matches.map((m) => m.source))];

    res.json({ reply, configured: true, sources });
  } catch (err) {
    next(err);
  }
}
