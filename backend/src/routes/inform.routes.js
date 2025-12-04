import { Router } from "express";
import { getInform, getInforms, downloadInform, deleteInform } from "../controllers/bibicletero.controller.js";
import { allowRoles } from "../middleware/adminbicicletero.middleware.js";

const router = Router();

router.get("/informs/:id", allowRoles("admin","adminBicicletero", "guard"), getInform);
router.get("/informs", allowRoles("admin","adminBicicletero", "guard"), getInforms);

router.post("/informs/dowloand/:id",  allowRoles("admin","adminBicicletero", "guard"), downloadInform);
router.delete("/informs/:id", allowRoles("admin","adminBicicletero", "guard"), deleteInform);

export default router;