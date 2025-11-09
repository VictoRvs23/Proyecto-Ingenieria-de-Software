import { Router } from "express";
import { getInform, getInforms, downloadInform, deleteInform } from "../controllers/bibicletero.controller.js";

const router = Router();

router.get("/informs/:id", getInform);
router.get("/informs", getInforms);

router.post("/informs/dowloand/:id", downloadInform);
router.delete("/informs/:id", deleteInform);

export default router;