"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";
import { Bike } from "../entities/bike.entity.js";
import { User } from "../entities/user.entity.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { createInformLog } from "./inform.service.js";

const reserveRepository = AppDataSource.getRepository(Reserve);
const bikeRepository = AppDataSource.getRepository(Bike);
const userRepository = AppDataSource.getRepository(User);
const bicicleteroRepository = AppDataSource.getRepository(Bicicletero);

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

export async function createReserveService(reserveData, userId) {
    try {
        const { bike_id, bicicletero_number, foto_url, doc_url } = reserveData;

        // 1. Validar Usuario (opcional si confías en el middleware)
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("Usuario no encontrado");

        // 2. BUSCAR BICICLETA + DUEÑO
        const bike = await bikeRepository.findOne({ 
            where: { id: bike_id }, 
            relations: ["user"] // <--- ¡ESTO FALTABA! Sin esto, bike.user es null
        });

        if (!bike) throw new Error(`La bicicleta con ID ${bike_id} no existe`);
        
        // Validación de seguridad por si la BD tiene datos sucios
        if (!bike.user) throw new Error("Error crítico: Esta bicicleta no tiene dueño asignado.");

        if (bike.user.id !== userId) throw new Error("No puedes reservar una bicicleta ajena");

        // 3. VALIDAR BICICLETERO
        const bicicletero = await bicicleteroRepository.findOne({
            where: { number: bicicletero_number },
            relations: ["bikes"] 
        });

        if (!bicicletero) throw new Error(`El bicicletero número ${bicicletero_number} no existe`);

        // Validar espacio
        const currentOccupancy = bicicletero.bikes ? bicicletero.bikes.length : 0;
        if (currentOccupancy >= bicicletero.space) {
            throw new Error(`El bicicletero ${bicicletero_number} está lleno`);
        }

        // 4. Crear Reserva
        const token = Math.floor(1000 + Math.random() * 9000);
        
        const newReserve = reserveRepository.create({
            token,
            estado: "solicitada",
            foto_url,
            doc_url,
            user,       
            bike,       
            bicicletero 
        });

        const savedReserve = await reserveRepository.save(newReserve);

        // 5. TRIGGER INFORME
        if (savedReserve.estado === "ingresada") {
            await createInformLog(savedReserve, "Reserva inicial creada");
        }

        return savedReserve;

    } catch (error) {
        if (error.code === '23505') throw new Error("Error de token duplicado, intente de nuevo");
        throw error;
    }
}

export async function updateReserveService(token, updateData) {
    try {
        // Cargar relaciones vitales para el informe
        const reserve = await reserveRepository.findOne({
            where: { token: parseInt(token) },
            relations: ["user", "bike", "bicicletero"]
        });

        if (!reserve) throw new Error("Reserva no encontrada");

        // Actualizar
        reserveRepository.merge(reserve, updateData);
        const updatedReserve = await reserveRepository.save(reserve);

        // TRIGGER AUTOMÁTICO
        // Si cambió a estado "ingresada" o "entregada", generar registro en Inform
        if (["ingresada", "entregada"].includes(updatedReserve.estado)) {
            // updateData.nota puede venir del body si el usuario quiere dejar una nota al editar
            await createInformLog(updatedReserve, updateData.nota);
        }

        return updatedReserve;
    } catch (error) {
        throw new Error(`Error actualizando reserva: ${error.message}`);
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
