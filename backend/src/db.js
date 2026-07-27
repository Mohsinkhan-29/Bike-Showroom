// Neon serverless Postgres client.
// Using @neondatabase/serverless so this works both on long-running
// Node servers and on edge/serverless deployments (Vercel, Netlify, etc.)
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "./config/env.js";

// Required when running in plain Node (not the edge runtime)
neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: env.databaseUrl });

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const ms = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[db] ${text.split("\n")[0]} — ${res.rowCount} rows — ${ms}ms`);
  }
  return res;
}

// sql editor query for neon


// -- ============================================================
// -- S.M. Autos Database Migration
// -- Adds stock support and RAG knowledge base tables
// -- ============================================================

// -- Add stock column to the existing bikes table
// ALTER TABLE bikes
// ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

// -- Create table for RAG document chunks
// CREATE TABLE IF NOT EXISTS rag_chunks (
//     id SERIAL PRIMARY KEY,
//     source TEXT NOT NULL,
//     chunk_index INTEGER NOT NULL DEFAULT 0,
//     content TEXT NOT NULL,
//     embedding JSONB NOT NULL,
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

// -- Index to speed up document lookups
// CREATE INDEX IF NOT EXISTS idx_rag_chunks_source
// ON rag_chunks (source);
