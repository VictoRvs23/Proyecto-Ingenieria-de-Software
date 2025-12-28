import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getTurns,
  getTurnByUser,
  updateTurn,
  removeTurn,
  updateTurnsInBatch,
} from "../controllers/turn.controller.js";

const router = Router();

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos para acceder a este recurso" });
    }
    next();
  };
}

// Obtener todos los turnos (solo admin y adminBicicletero)
router.get("/", authMiddleware, allowRoles("admin", "adminBicicletero"), getTurns);

// Obtener turno de un usuario específico
router.get("/:userId", authMiddleware, getTurnByUser);

// Actualizar turno de un usuario (solo admin y adminBicicletero)
router.put("/:userId", authMiddleware, allowRoles("admin", "adminBicicletero"), updateTurn);

// Actualizar múltiples turnos a la vez (solo admin y adminBicicletero)
router.put("/", authMiddleware, allowRoles("admin", "adminBicicletero"), updateTurnsInBatch);

// Eliminar turno de un usuario (solo admin y adminBicicletero)
router.delete("/:userId", authMiddleware, allowRoles("admin", "adminBicicletero"), removeTurn);

export default router;
