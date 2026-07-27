import dotenv from "dotenv";
dotenv.config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val === undefined) {
    console.warn(`[env] Missing required env var: ${name}`);
  }
  return val;
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminEmail: required("ADMIN_EMAIL"),
  adminPassword: required("ADMIN_PASSWORD"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,

  // ---- Gemini chatbot + RAG ----
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash",
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",

  // ---- Image upload ----
  maxImageUploadMb: Number(process.env.MAX_IMAGE_UPLOAD_MB || 4),
};
