import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/adminbicicletero.middleware.js";
import { getHistoryUrls, downloadReportById, generateToday } from "../controllers/inform.controller.js";

const router = Router();

router.get("/history", authMiddleware, allowRoles("admin", "adminBicicletero"), getHistoryUrls);
router.get("/today", authMiddleware, allowRoles("admin", "adminBicicletero", "guard"), generateToday);
router.get("/download/:id", downloadReportById);

export default router;