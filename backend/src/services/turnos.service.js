import { AppDataSource } from "../config/configDb.js";
import { Turno } from "../entities/turno.entity.js";

const turnoRepository = AppDataSource.getRepository(Turno);

export async function obtenerTurnos() {
  return await turnoRepository.find();
}

export async function obtenerTurnoPorId(id) {
  return await turnoRepository.findOneBy({ id: parseInt(id) });
}

export async function crearTurno(data) {
  const turno = turnoRepository.create(data);
  return await turnoRepository.save(turno);
}

export async function actualizarTurno(id, data) {
  await turnoRepository.update(id, data);
  return await turnoRepository.findOneBy({ id: parseInt(id) });
}

export async function eliminarTurno(id) {
  return await turnoRepository.delete(id);
}