import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getReserve,
  getReserves,
  createReserve,
  updateReserve,
  deleteReserve,
} from "../controllers/reserve.controller.js";
import { uploadFields } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/:token", getReserve);
router.get("/", getReserves);
router.post("/", uploadFields, authMiddleware, createReserve);
router.patch("/:token", uploadFields, authMiddleware, updateReserve);
router.delete("/:token", authMiddleware, deleteReserve);

export default router;