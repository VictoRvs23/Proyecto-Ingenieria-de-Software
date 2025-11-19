export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "No autorizado: requiere rol admin" });
  }

  next();
}
