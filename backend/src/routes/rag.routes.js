import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  uploadRagFile,
  addRagText,
  listRagSources,
  deleteRagSource,
} from "../controllers/rag.controller.js";

const router = Router();

// Knowledge-base files are small text documents (FAQs, policies) — keep
// them in memory rather than writing to disk (works the same locally and
// on serverless hosts like Vercel, which have a read-only filesystem).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB is plenty for text documents
});

router.get("/", requireAuth, requireAdmin, listRagSources);
router.post("/upload", requireAuth, requireAdmin, upload.single("file"), uploadRagFile);
router.post("/text", requireAuth, requireAdmin, addRagText);
router.delete("/:source", requireAuth, requireAdmin, deleteRagSource);

export default router;
