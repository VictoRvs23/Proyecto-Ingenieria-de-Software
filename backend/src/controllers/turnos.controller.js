import { AppDataSource } from "../config/configDb.js";
import { Turno } from "../entities/turno.entity.js";

const turnoRepository = AppDataSource.getRepository(Turno);

// Crear turno
export const crearTurno = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    const nuevoTurno = turnoRepository.create({ date, startTime, endTime });
    await turnoRepository.save(nuevoTurno);

    res.status(201).json({
      message: "Turno creado correctamente",
      turno: nuevoTurno,
    });
  } catch (error) {
    console.error("Error al crear el turno:", error);
    res.status(500).json({ message: "Error al crear el turno" });
  }
};

// Obtener todos los turnos
export const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await turnoRepository.find();
    res.status(200).json(turnos);
  } catch (error) {
    console.error("Error al obtener los turnos:", error);
    res.status(500).json({ message: "Error al obtener los turnos" });
  }
};

// Obtener turno por ID
export const obtenerTurnoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await turnoRepository.findOneBy({ id: parseInt(id) });

    if (!turno) return res.status(404).json({ message: "Turno no encontrado" });

    res.json(turno);
  } catch (error) {
    console.error("Error al obtener el turno:", error);
    res.status(500).json({ message: "Error al obtener el turno" });
  }
};

// Actualizar turno
export const actualizarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;

    const turno = await turnoRepository.findOneBy({ id: parseInt(id) });
    if (!turno) return res.status(404).json({ message: "Turno no encontrado" });

    turno.date = date;
    turno.startTime = startTime;
    turno.endTime = endTime;

    await turnoRepository.save(turno);
    res.json({ message: "Turno actualizado correctamente", turno });
  } catch (error) {
    console.error("Error al actualizar el turno:", error);
    res.status(500).json({ message: "Error al actualizar el turno" });
  }
};

// Eliminar turno
export const eliminarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await turnoRepository.findOneBy({ id: parseInt(id) });

    if (!turno) return res.status(404).json({ message: "Turno no encontrado" });

    await turnoRepository.remove(turno);
    res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el turno:", error);
    res.status(500).json({ message: "Error al eliminar el turno" });
  }
};
