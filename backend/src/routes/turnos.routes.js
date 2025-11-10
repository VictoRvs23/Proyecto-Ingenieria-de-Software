import express from "express";
import { AppDataSource } from "../data-source.js";
import { Turno } from "../entities/Turno.entity.js";

const router = express.Router();

// Crear un turno
router.post("/turnos", async (req, res) => {
  const { date, startTime, endTime, bikeRackId } = req.body;

  if (!date || !startTime || !endTime || !bikeRackId) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  const turnoRepo = AppDataSource.getRepository(Turno);
  const turno = turnoRepo.create({ date, startTime, endTime, bikeRackId });

  await turnoRepo.save(turno);
  res.json(turno);
});

// Modificar un turno
router.put("/turnos/:id", async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime, bikeRackId } = req.body;

  const turnoRepo = AppDataSource.getRepository(Turno);
  const turno = await turnoRepo.findOneBy({ id: parseInt(id) });

  if (!turno) return res.status(404).json({ message: "Turno no encontrado" });

  // Actualizamos solo los campos que vienen en el body
  if (date) turno.date = date;
  if (startTime) turno.startTime = startTime;
  if (endTime) turno.endTime = endTime;
  if (bikeRackId) turno.bikeRackId = bikeRackId;

  await turnoRepo.save(turno);
  res.json(turno);
});

// Eliminar un turno
router.delete("/turnos/:id", async (req, res) => {
  const { id } = req.params;

  const turnoRepo = AppDataSource.getRepository(Turno);
  const result = await turnoRepo.delete(id);

  if (result.affected === 0) return res.status(404).json({ message: "Turno no encontrado" });

  res.json({ message: "Turno eliminado" });
});

// Listar todos los turnos
router.get("/turnos", async (req, res) => {
  const turnoRepo = AppDataSource.getRepository(Turno);
  const turnos = await turnoRepo.find(); // solo devuelve columnas simples
  res.json(turnos);
});

export default router;
