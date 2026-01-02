import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createConsulta,
  getConsultas,
  getMyConsultas,
  updateConsultaResponse,
  deleteConsulta,
} from "../controllers/consulta.controller.js";

const router = Router();

router.post("/", authMiddleware, createConsulta);
router.get("/my-consultas", authMiddleware, getMyConsultas);
router.delete("/:id", authMiddleware, deleteConsulta);
router.get("/", authMiddleware, getConsultas);
router.put("/:id/responder", authMiddleware, updateConsultaResponse);

export default router;
