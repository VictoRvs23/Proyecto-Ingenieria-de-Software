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

router.get("/Reserve:token", getReserve);
router.get("/Reserve", getReserves);
router.post("/Reserve", uploadFields, authMiddleware, createReserve);
router.patch("/Reserve:token", uploadFields, authMiddleware, updateReserve);
router.delete("/Reserve:token", authMiddleware, deleteReserve);

export default router;