import { Router } from "express";
import { deleteUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.delete("/:id", authMiddleware, deleteUser);

export default router;
