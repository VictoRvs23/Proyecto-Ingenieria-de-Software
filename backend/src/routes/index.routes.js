import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import reserveRoutes from "./reserve.routes.js";
import bikeRoutes from "./bike.routes.js";
import bicicleteroRoutes from "./bicicletero.routes.js";
import informRoutes from "./inform.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/reserve", reserveRoutes);
  router.use("/bikes", bikeRoutes);
  router.use("/bicicletero", bicicleteroRoutes);
  router.use("/informs", informRoutes);
}


