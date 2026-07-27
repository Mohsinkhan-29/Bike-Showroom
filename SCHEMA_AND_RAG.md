# Database Schema & RAG Pipeline — S.M. Autos Bike Showroom

## 1. Database

**Engine:** PostgreSQL (hosted on Neon, accessed via the serverless/WebSocket driver)
**Migration strategy:** a single idempotent script (`scripts/migrate.js`) creates all tables with `CREATE TABLE IF NOT EXISTS`, so it is safe to re-run at any time.

### 1.1 Table: `bikes`
The product catalog.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL (PK) | |
| `name` | TEXT | required |
| `category` | TEXT | required; constrained to one of: `commuter`, `sport`, `cruiser`, `adventure`, `electric` |
| `price` | NUMERIC(12,0) | required |
| `description` | TEXT | defaults to empty string |
| `image_url` | TEXT | optional |
| `specs` | JSONB | flexible key/value spec sheet (e.g. Power, Engine, Weight) |
| `views` | INTEGER | popularity counter, used in analytics and the recommender |
| `stock` | INTEGER | current stock count |
| `is_active` | BOOLEAN | soft-delete flag; inactive bikes are hidden from the public site |
| `created_at` / `updated_at` | TIMESTAMPTZ | audit timestamps |

Index: `idx_bikes_category` on `category` for fast catalog filtering.

### 1.2 Table: `leads`
Rider inquiries captured from the contact form (and optionally the recommender).

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL (PK) | |
| `name` | TEXT | required |
| `phone` | TEXT | required |
| `interest` | TEXT | optional free text |
| `model` | TEXT | optional — bike the lead is interested in |
| `message` | TEXT | optional |
| `created_at` | TIMESTAMPTZ | |

Index: `idx_leads_created_at` on `created_at`, used for the "recent leads" and "leads over the last 7/14 days" dashboard widgets.

### 1.3 Table: `recommendation_requests`
Every time a rider uses the "recommend a bike" tool, the request is logged. This doubles as a **demand-signal dataset** for the admin dashboard (e.g. "how many riders are asking for touring bikes under a given budget this month").

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL (PK) | |
| `budget_min` / `budget_max` | NUMERIC(12,0) | rider's stated budget range |
| `use_case` | TEXT | e.g. commute, sport, touring, cruising, eco |
| `experience_level` | TEXT | beginner / intermediate / expert |
| `top_bike_id` | INTEGER (FK → `bikes.id`, `ON DELETE SET NULL`) | the top-scoring bike returned |
| `created_at` | TIMESTAMPTZ | |

### 1.4 Table: `rag_chunks`
The chatbot's knowledge base — every uploaded/pasted document is split into chunks and stored with its embedding vector.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL (PK) | |
| `source` | TEXT | filename or a manually chosen label; groups chunks belonging to the same document |
| `chunk_index` | INTEGER | position of this chunk within its source document |
| `content` | TEXT | the chunk's raw text |
| `embedding` | JSONB | the chunk's embedding vector, stored as a plain float array |
| `created_at` | TIMESTAMPTZ | |

Index: `idx_rag_chunks_source` on `source`, used to list/replace/delete a document's chunks as a group.

> **Design note:** embeddings are stored as JSONB instead of using the `pgvector` extension, specifically so the project runs on any Neon project without needing an extension enabled first. Similarity search is done in the Node application layer rather than in SQL — perfectly adequate for the chunk volumes a project like this realistically has.

### 1.5 Entity Relationships
```
bikes (1) ───< recommendation_requests   (top_bike_id references a bike, nullable)
leads, rag_chunks — standalone tables, no foreign keys
```

---

## 2. RAG (Retrieval-Augmented Generation) — How It's Applied

The chatbot is grounded using a **custom, lightweight RAG pipeline** built directly into the backend — no external vector database or RAG framework is used.

### 2.1 Ingestion (Indexing) Pipeline
Triggered from the admin "Chatbot" screen, either by uploading a text-like file (`.txt`, `.md`, `.csv`, `.json`) or pasting text directly.

1. **Chunking** — the source document is split into ~800-character chunks, preferring to break on paragraph boundaries so each chunk stays semantically coherent; a small overlap is kept between chunks so context isn't lost at the boundaries. Any paragraph longer than the target size is hard-split.
2. **Embedding** — each chunk is sent to Gemini's embedding model (`text-embedding-004` by default), returning a numeric vector that represents its meaning.
3. **Storage** — the chunk's text and embedding are saved to `rag_chunks`, tagged with the source document's name.
4. **Replace-on-reindex** — re-uploading a document under the same source name deletes its old chunks first, so the knowledge base never accumulates stale duplicates.

### 2.2 Retrieval Pipeline (per chat message)
Triggered on every message sent to the chatbot.

1. The rider's message is embedded using the same Gemini embedding model used at ingestion time (so vectors are comparable).
2. All stored chunks are pulled from `rag_chunks` and ranked against the question's embedding using **cosine similarity**.
3. Only the top matches above a similarity threshold are kept (top 4 chunks, similarity ≥ 0.55) — this avoids feeding the model irrelevant context if nothing in the knowledge base is actually related to the question.

### 2.3 Augmentation & Generation
1. A **live catalog snapshot** (active bikes, category, price, and current stock) is pulled directly from Postgres — this keeps price/stock answers accurate to the minute rather than relying on the knowledge base being manually kept up to date.
2. The retrieved knowledge-base chunks + the catalog snapshot are assembled into a single **system instruction**, along with an explicit rule: only state facts backed by those two sections, and say "not sure, contact the showroom" instead of guessing.
3. The system instruction, prior conversation history, and the new message are sent to Gemini's chat model (`gemini-2.0-flash` by default) to generate the reply.
4. The response returned to the frontend includes the reply text and the **distinct source documents** actually used, so the UI can show the rider what the answer is "grounded in."

### 2.4 What the Knowledge Base Currently Contains
An example seeded document (`sm-autos-faq.txt`) covers dealership-specific policy content that a generic LLM couldn't otherwise know — e.g. showroom hours, test-ride rules, financing/installment terms, warranty coverage, and free-service schedules.

### 2.5 Why This Design
- **No extra infrastructure:** by storing embeddings as JSONB and doing similarity ranking in Node, the whole RAG system runs on the same Postgres database as the rest of the app — no separate vector DB (e.g. Pinecone, pgvector-enabled instance) is required.
- **Grounded, not hallucinated:** separating "catalog facts" (always live, always accurate) from "policy/FAQ facts" (retrieved by relevance) keeps the assistant's answers trustworthy for both types of question.
- **Swappable:** the retrieval logic (`utils/rag.js`) and the Gemini wrapper (`utils/gemini.js`) are isolated from the controller, so the embedding/chat provider or the similarity algorithm could be swapped later without touching the rest of the app.
