import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) {
      console.log('❌ No hay header de autorización');
      return res.status(401).json({ error: "No autenticado" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token) {
      console.log('❌ No hay token');
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    req.user = {
      sub: decoded.sub ?? decoded.id ?? decoded.userId, 
      id: decoded.sub ?? decoded.id ?? decoded.userId,
      email: decoded.email,
      role: decoded.role,
      numeroTelefonico: decoded.numeroTelefonico,
      nombre: decoded.nombre,
    };
    
    console.log('✅ req.user establecido:', req.user);
    return next();
  } catch (err) {
    console.error('❌ Error en authMiddleware:', err.message);
    return res.status(401).json({ error: "No autenticado", details: err.message });
  }
}
