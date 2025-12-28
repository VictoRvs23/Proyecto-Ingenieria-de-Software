import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/adminbicicletero.middleware.js";
import { downloadInform } from "../controllers/inform.controller.js";

const router = Router();

router.get("/", authMiddleware, allowRoles("admin","adminBicicletero", "guard"), downloadInform);

export default router;