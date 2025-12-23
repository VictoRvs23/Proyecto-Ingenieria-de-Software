import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js"; 
import {
  getPublicProfile,
  getPrivateProfile,
  updatePrivateProfile,
  deletePrivateProfile,
  updateUserRole,
} from "../controllers/profile.controller.js";

const router = Router();

router.get("/public", getPublicProfile);

router.get("/private", authMiddleware, getPrivateProfile);

router.patch("/private", authMiddleware, upload.single("image"), updatePrivateProfile);

router.delete("/private", authMiddleware, deletePrivateProfile);

router.put("/role/:id", authMiddleware, isAdmin, updateUserRole);

export default router;