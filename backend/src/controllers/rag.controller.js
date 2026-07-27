import { query } from "../db.js";
import { embedText } from "../utils/gemini.js";
import { chunkText } from "../utils/rag.js";

// Shared by both "upload a file" and "paste text" — chunks the content,
// embeds each chunk, and stores it against a `source` label so it can be
// listed/deleted as a group later.
async function indexDocument(source, content) {
  const chunks = chunkText(content);
  if (!chunks.length) {
    const err = new Error("That document has no readable text content.");
    err.status = 400;
    throw err;
  }

  // Remove any previous version of this source so re-uploading replaces it
  // instead of duplicating chunks.
  await query(`DELETE FROM rag_chunks WHERE source = $1`, [source]);

  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    await query(
      `INSERT INTO rag_chunks (source, chunk_index, content, embedding) VALUES ($1,$2,$3,$4)`,
      [source, i, chunks[i], JSON.stringify(embedding)]
    );
    inserted++;
  }
  return inserted;
}

// POST /api/rag/upload (admin) — multipart/form-data, field name "file".
// Accepts plain-text-ish files: .txt, .md, .csv, .json.
export async function uploadRagFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Attach it under field name 'file'." });
    }
    const source = req.file.originalname;
    const content = req.file.buffer.toString("utf-8");
    const chunkCount = await indexDocument(source, content);
    res.status(201).json({ source, chunks: chunkCount });
  } catch (err) {
    next(err);
  }
}

// POST /api/rag/text (admin) — body: { source, content }
// Lets the admin paste text directly instead of uploading a file.
export async function addRagText(req, res, next) {
  try {
    const { source, content } = req.body || {};
    if (!source || !content) {
      const err = new Error("source and content are required");
      err.status = 400;
      throw err;
    }
    const chunkCount = await indexDocument(String(source).trim(), String(content));
    res.status(201).json({ source, chunks: chunkCount });
  } catch (err) {
    next(err);
  }
}

// GET /api/rag (admin) — one row per source document, with chunk count.
export async function listRagSources(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT source, COUNT(*)::int AS chunks, MIN(created_at) AS added_at
       FROM rag_chunks GROUP BY source ORDER BY added_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/rag/:source (admin) — removes every chunk for that source.
export async function deleteRagSource(req, res, next) {
  try {
    const source = decodeURIComponent(req.params.source);
    const { rowCount } = await query(`DELETE FROM rag_chunks WHERE source = $1`, [source]);
    if (!rowCount) return res.status(404).json({ error: "No knowledge-base entry with that source name." });
    res.json({ deleted: true, source });
  } catch (err) {
    next(err);
  }
}
