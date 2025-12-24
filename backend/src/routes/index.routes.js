import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import bikeRoutes from "./bike.routes.js";
import bicicleteroRoutes from "./bicicletero.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/bikes", bikeRoutes);
  router.use("/bicicletero", bicicleteroRoutes);
}


