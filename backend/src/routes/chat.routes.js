import { Router } from "express";
import { chat } from "../controllers/chat.controller.js";

const router = Router();

// Public — the storefront chatbot widget. Grounded in the live bikes
// catalog and any uploaded RAG knowledge-base documents (see rag.routes.js).
router.post("/", chat);

export default router;
