import { Router } from "express";
import { 
  createReport, 
  getMyReports, 
  getReports, 
  updateStatus 
} from "../controllers/reporte.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", authMiddleware, upload.single("image"), createReport);
router.get("/me", authMiddleware, getMyReports); 
router.get("/", authMiddleware, getReports);
router.patch("/:id/status", authMiddleware, updateStatus);

export default router;