"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";

const reserveRepository = AppDataSource.getRepository(Reserve);

export async function getReserveService(token) {
    try {
        const reserve = await reserveRepository.findOne({
            where: { token },
            relations: ["user"]
        });
        if (!reserve) throw new Error("Reserva no encontrada");
        return reserve;
    } catch (error) {
        throw new Error(`Error al obtener reserva: ${error.message}`);
    }
}

export async function getReservesService(userId = null) {
    try {
        const options = {
            relations: ["user"],
            order: { created_at: "DESC" }
        };
        
        if (userId) {
            options.where = { user: { id: userId } };
        }
        
        const reserves = await reserveRepository.find(options);
        return reserves;
    } catch (error) {
        throw new Error(`Error al obtener reservas: ${error.message}`);
    }
}

export async function getReservesByUserService(userId) {
    try {
        const reserves = await reserveRepository.find({
            where: { user: { id: userId } },
            relations: ["user"],
            order: { created_at: "DESC" }
        });
        return reserves;
    } catch (error) {
        throw new Error(`Error al obtener reservas del usuario: ${error.message}`);
    }
}

export async function createReserveService(reserveData) {
    try {
        if (!reserveData.token) {
            reserveData.token = Math.floor(1000 + Math.random() * 9000);
        }
        
        const newReserve = reserveRepository.create(reserveData);
        return await reserveRepository.save(newReserve);
    } catch (error) {
        if (error.code === '23505') {
            throw new Error("El token de reserva ya existe");
        }
        throw new Error(`Error al crear reserva: ${error.message}`);
    }
}

export async function updateReserveService(token, updateData) {
    try {
        const result = await reserveRepository.update(
            { token }, 
            updateData
        );
        
        if (result.affected === 0) {
            throw new Error("Reserva no encontrada");
        }
        
        return await getReserveService(token);
    } catch (error) {
        throw new Error(`Error al actualizar reserva: ${error.message}`);
    }
}

export async function deleteReserveService(token) {
    try {
        const result = await reserveRepository.delete({ token });
        if (result.affected === 0) {
            throw new Error("Reserva no encontrada");
        }
        return { message: "Reserva eliminada exitosamente" };
    } catch (error) {
        throw new Error(`Error al eliminar reserva: ${error.message}`);
    }
}
