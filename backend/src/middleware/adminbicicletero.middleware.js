export function isAdminBicicletero(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.role !== "adminBicicletero") {
    return res.status(403).json({ error: "No autorizado: requiere rol adminBicicletero" });
  }

  next();
}
