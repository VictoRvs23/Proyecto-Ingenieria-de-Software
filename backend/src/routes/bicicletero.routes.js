import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isGuard } from "../middleware/guard.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getStatus, entryBike, exitBike } from "../controllers/bicicletero.controller.js";

const router = Router();

router.get("/", isGuard, isAdmin, getStatus);
router.post("/entry", isGuard, isAdmin, entryBike);
router.delete("/exit/:id", isGuard, isAdmin, exitBike);

export default router;
