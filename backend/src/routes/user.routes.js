import { Router } from "express";
import { deleteUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Eliminar usuario por ID (requiere autenticación y permisos adecuados)
router.delete("/:id", authMiddleware, deleteUser);

export default router;
