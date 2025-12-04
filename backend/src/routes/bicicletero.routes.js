import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getStatus, entryBike, exitBike, getBicicleteroByNumber } from "../controllers/bicicletero.controller.js";

const router = Router();

function allowRoles(...roles) {
  const allowed = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const role = String(req.user.role ?? "").toLowerCase();
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: `No autorizado: requiere rol ${roles.join(" o ")}` });
    }
    next();
  };
}

router.get("/:number", authMiddleware, allowRoles("admin","adminBicicletero", "guard"), getBicicleteroByNumber);
router.get("/", authMiddleware, allowRoles("admin","adminBicicletero", "guard"), getStatus);
router.post("/entry/:number", authMiddleware, allowRoles("admin", "adminBicicletero", "guard"), entryBike);
router.delete("/exit/:number/:id", authMiddleware, allowRoles("admin", "adminBicicletero", "guard"), exitBike);

export default router;
