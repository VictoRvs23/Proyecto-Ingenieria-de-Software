import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return res.status(401).json({ error: "No autenticado" });

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub ?? decoded.id ?? decoded.userId,
      email: decoded.email,
      role: decoded.role,
      numeroTelefonico: decoded.numeroTelefonico,
      nombre: decoded.nombre,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "No autenticado", details: err.message });
  }
}
