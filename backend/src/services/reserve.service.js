"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";

const reserveRepository = AppDataSource.getRepository(Reserve);

export async function getReserveService(token) {
    try {
    const reserve = await bikeRepository.findOneBy({ token });
    if (!reserve) throw new Error("Bicicleta no encontrada");
    return bike;
  } catch (error) {
    throw new Error(`Error al obtener bicicleta: ${error.message}`);
  }
}
export async function getReservesService() {
    try {
    const reserves = await reserveRepository.find();
    return reserves;
  } catch (error) {
    throw new Error(`Error al obtener reservas: ${error.message}`);
  }
}

export async function createReserveService(reserveData) {
  try {
    const newReserve = reserveRepository.create(reserveData);
    return await reserveRepository.save(newReserve);
  } catch (error) {
    throw new Error(`Error al crear reserva: ${error.message}`);
  }
}

export async function updateReserveService(token, updateData) {
    try {
    const reserve = await reserveRepository.findOneBy({ token });
    if (!reserve) throw new Error("Reserva no encontrada");
    reserveRepository.merge(reserve, updateData);
    return await reserveRepository.save(reserve);
  } catch (error) {
    throw new Error(`Error al actualizar reserva: ${error.message}`);
  }
}

export async function deleteReserveService(token) {
    try {
    const reserve = await reserveRepository.findOneBy({ token });
    if (!reserve) throw new Error("Reserva no encontrada");
    return await reserveRepository.remove(reserve);
  } catch (error) {
    throw new Error(`Error al eliminar reserva: ${error.message}`);
  }
}