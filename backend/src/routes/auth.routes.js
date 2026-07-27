import { Router } from "express";
import { adminLogin, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/admin/login", adminLogin);
router.get("/me", requireAuth, me);

export default router;
