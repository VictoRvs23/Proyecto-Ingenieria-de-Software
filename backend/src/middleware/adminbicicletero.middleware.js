export function isAdminBicicletero(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.role !== "adminBicicletero") {
    return res.status(403).json({ error: "No autorizado: requiere rol adminBicicletero" });
  }

  next();
}

export function allowRoles(...roles) {
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
