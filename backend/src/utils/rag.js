// Small, dependency-free RAG helpers: split text into chunks small enough
// to embed well, and rank chunks by cosine similarity to a query vector.

// Splits text into ~chunkSize-character chunks, trying to break on
// paragraph/sentence boundaries so chunks stay coherent for retrieval.
export function chunkText(text, chunkSize = 800, overlap = 100) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  // Prefer splitting on blank lines (paragraphs) first.
  const paragraphs = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > chunkSize && current) {
      chunks.push(current.trim());
      // keep a little overlap for context continuity between chunks
      current = current.slice(Math.max(0, current.length - overlap)) + "\n\n" + para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }

    // A single paragraph longer than chunkSize on its own — hard-split it.
    while (current.length > chunkSize * 1.5) {
      chunks.push(current.slice(0, chunkSize).trim());
      current = current.slice(chunkSize - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Ranks rows (each with an `embedding` array) against a query vector and
// returns the top `limit` with a `similarity` score attached.
export function topMatches(rows, queryEmbedding, limit = 4, minSimilarity = 0.55) {
  return rows
    .map((row) => ({ ...row, similarity: cosineSimilarity(row.embedding, queryEmbedding) }))
    .sort((a, b) => b.similarity - a.similarity)
    .filter((r) => r.similarity >= minSimilarity)
    .slice(0, limit);
}
