import { Router } from "express";
import { createLead, listLeads } from "../controllers/leads.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", createLead);
router.get("/", requireAuth, requireAdmin, listLeads);

export default router;
