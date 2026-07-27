import { Router } from "express";
import { recommend } from "../controllers/recommend.controller.js";

const router = Router();
router.post("/", recommend);

export default router;
