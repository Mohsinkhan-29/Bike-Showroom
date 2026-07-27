import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import bikesRoutes from "./routes/bikes.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import recommendRoutes from "./routes/recommend.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
// Bike payloads can carry a base64 data-URL image (see bikes.controller.js
// uploadBikeImage), so the default 100kb JSON limit is raised comfortably
// above the image upload cap.
app.use(express.json({ limit: "8mb" }));

// Basic protection against brute-forcing the single admin login.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth/admin/login", authLimiter);

app.get("/api/health", (req, res) => res.json({ ok: true, service: "sm-autos-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes); // Gemini + RAG storefront chatbot
app.use("/api/rag", ragRoutes); // admin: manage chatbot knowledge-base documents

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`S.M. Autos backend running on http://localhost:${env.port}`);
});
