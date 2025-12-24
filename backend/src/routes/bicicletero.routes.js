import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isGuard } from "../middleware/guard.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getStatus, entryBike, exitBike } from "../controllers/bicicletero.controller.js";

const router = Router();

router.get("/", authMiddleware, isGuard, isAdmin, getStatus);
router.post("/entry",authMiddleware, isGuard, isAdmin, entryBike);
router.delete("/exit/:id",authMiddleware, isGuard, isAdmin, exitBike);

export default router;
