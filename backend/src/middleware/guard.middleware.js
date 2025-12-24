export function isGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.role !== "guard") {
    return res.status(403).json({ error: "No autorizado: requiere rol guard" });
  }

  next();
}
