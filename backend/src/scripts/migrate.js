// Creates all tables needed by the app. Safe to re-run (IF NOT EXISTS).
import { pool } from "../db.js";

const SQL = `
CREATE TABLE IF NOT EXISTS bikes (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('commuter','sport','cruiser','adventure','electric')),
  price         NUMERIC(12,0) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  image_url     TEXT,
  specs         JSONB NOT NULL DEFAULT '{}'::jsonb,
  views         INTEGER NOT NULL DEFAULT 0,
  stock         INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safe to re-run on a database created before the "stock" column existed.
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS leads (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  interest      TEXT,
  model         TEXT,
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendation_requests (
  id                SERIAL PRIMARY KEY,
  budget_min        NUMERIC(12,0),
  budget_max        NUMERIC(12,0),
  use_case          TEXT,
  experience_level  TEXT,
  top_bike_id       INTEGER REFERENCES bikes(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chatbot knowledge base. Each row is one chunk of a source document plus
-- its embedding vector (stored as JSONB — a plain float array). We keep it
-- as JSONB instead of requiring the pgvector extension so this runs on any
-- Neon project without needing an extension enabled first. Similarity search
-- happens in the Node app (see backend/src/utils/rag.js) — perfectly fast
-- for the chunk counts an FYP knowledge base will realistically have.
CREATE TABLE IF NOT EXISTS rag_chunks (
  id            SERIAL PRIMARY KEY,
  source        TEXT NOT NULL,
  chunk_index   INTEGER NOT NULL DEFAULT 0,
  content       TEXT NOT NULL,
  embedding     JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bikes_category ON bikes(category);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_source ON rag_chunks(source);
`;

async function migrate() {
  console.log("Running migration...");
  await pool.query(SQL);
  console.log("Migration complete. Tables ready: bikes, leads, recommendation_requests, rag_chunks");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
