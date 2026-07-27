import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import {
  listBikes, getBike, createBike, updateBike, deleteBike, updateStock, uploadBikeImage,
} from "../controllers/bikes.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageUploadMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", listBikes);
router.get("/:id", getBike);
router.post("/", requireAuth, requireAdmin, createBike);
router.post("/upload-image", requireAuth, requireAdmin, upload.single("image"), uploadBikeImage);
router.put("/:id", requireAuth, requireAdmin, updateBike);
router.patch("/:id/stock", requireAuth, requireAdmin, updateStock);
router.delete("/:id", requireAuth, requireAdmin, deleteBike);

export default router;
