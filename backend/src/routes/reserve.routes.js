import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getReserves,
  createReserve,
  updateReserve,
  deleteReserve,
} from "../controllers/reserve.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getReserves);
router.post("/", createReserve);
router.patch("/:token", updateReserve);
router.delete("/:token", deleteReserve);

export default router;
