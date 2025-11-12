"use strict";
import { handleErrorClient } from "../Handlers/responseHandlers";

export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
        return handleErrorClient(res, 401, "Acceso denegado. Usuario no autenticado.");
    }

    if (!allowedRoles.includes(req.user.role)) {
        return handleErrorClient(res, 403, "Acceso denegado. No tienes permiso para realizar esta acción.",
    {
        rolRequerido: allowedRoles,
        rolActual: req.user.role
    }
  );
}
    
}
}