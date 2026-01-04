import { Router } from "express";
import { getNotificaciones, markAsRead } from "../controllers/notificacion.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getNotificaciones);
router.patch("/:id/leida", markAsRead);

export default router;