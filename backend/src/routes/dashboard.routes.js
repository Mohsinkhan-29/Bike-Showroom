import { Router } from "express";
import { getKpis } from "../controllers/dashboard.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/kpis", requireAuth, requireAdmin, getKpis);

export default router;
