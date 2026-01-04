import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { 
  getStatus, 
  getBicicleteroByNumber, 
  getAllBicicleteros, 
  toggleSpaceStatus,
  checkAvailability 
} from "../controllers/bicicletero.controller.js";

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

router.get("/all/list", authMiddleware, getAllBicicleteros);
router.get("/:number", authMiddleware, getBicicleteroByNumber);
router.get("/:number/availability", authMiddleware, checkAvailability);
router.get("/", authMiddleware, allowRoles("admin","adminBicicletero", "guard"), getStatus);
// Eliminamos entryBike y exitBike ya que ahora se manejan por reservas
router.patch("/:number/space/:spaceNumber/toggle", authMiddleware, allowRoles("admin", "adminBicicletero", "guard"), toggleSpaceStatus);

export default router;
