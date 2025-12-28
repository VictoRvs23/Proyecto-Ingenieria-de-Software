import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getReserve,
  getReserves,
  createReserve,
  updateReserve,
  deleteReserve,
} from "../controllers/reserve.controller.js";
import { upload, processImage } from "../middleware/upload.middleware.js";
import { allowRoles } from "../middleware/adminbicicletero.middleware.js";

const router = Router();


router.get("/:token", getReserve);
router.get("/", getReserves);
router.post("/", authMiddleware, upload.single("image"), processImage, createReserve);
router.patch("/:token", authMiddleware, upload.single("image"), processImage, allowRoles("admin","adminBicicletero", "guard"), updateReserve);
router.delete("/:token", authMiddleware, deleteReserve);

export default router;