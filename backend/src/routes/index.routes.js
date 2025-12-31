import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import bikeRoutes from "./bike.routes.js";
import bicicleteroRoutes from "./bicicletero.routes.js";
import turnRoutes from "./turn.routes.js";
import reserveRoutes from "./reserve.routes.js";
import userRoutes from "./user.routes.js";
import reporteRoutes from "./reporte.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/bikes", bikeRoutes);
  router.use("/bicicletero", bicicleteroRoutes);
  router.use("/reportes", reporteRoutes);
  router.use("/turnos", turnRoutes);
  router.use("/reserve", reserveRoutes);
  router.use("/users", userRoutes);
}


