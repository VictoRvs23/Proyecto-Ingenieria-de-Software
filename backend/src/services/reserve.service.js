"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";
import { Bike } from "../entities/bike.entity.js";
import { User } from "../entities/user.entity.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { createInformLog } from "./inform.service.js";
import { DailyReport } from "../entities/dailyReport.entity.js";
import { In, LessThan, Not } from "typeorm";

const reserveRepository = AppDataSource.getRepository(Reserve);
const bikeRepository = AppDataSource.getRepository(Bike);
const userRepository = AppDataSource.getRepository(User);
const bicicleteroRepository = AppDataSource.getRepository(Bicicletero);
const dailyReportRepository = AppDataSource.getRepository(DailyReport);

// Función auxiliar para cancelar reservas expiradas
export async function cancelExpiredReserves() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Buscar reservas "solicitada" sin actualizar por 30 minutos
    const expiredReserves = await reserveRepository.find({
      where: {
        estado: "solicitada",
        updated_at: LessThan(thirtyMinutesAgo)
      },
      relations: ["user", "bike", "bicicletero"]
    });
    
    for (const reserve of expiredReserves) {
      // Actualizar estado a cancelada
      reserve.estado = "cancelada";
      reserve.last_status_change = new Date();
      await reserveRepository.save(reserve);
      
      // Crear log del cambio
      await createInformLog(reserve, "Cancelada automáticamente por inactividad (30 minutos)");
      
      console.log(`Reserva ${reserve.token} cancelada automáticamente por expiración`);
    }
    
    return { cancelled: expiredReserves.length };
  } catch (error) {
    console.error(`Error cancelando reservas expiradas: ${error.message}`);
    throw error;
  }
}

async function verificarEspacioDisponible(bicicleteroNumber, space, excludeToken = null) {
    const bicicletero = await bicicleteroRepository.findOne({
        where: { number: bicicleteroNumber }
    });
    
    if (!bicicletero) {
        throw new Error(`Bicicletero con número ${bicicleteroNumber} no encontrado`);
    }
    
    // 1. Verificar que el espacio no esté deshabilitado
    if (bicicletero.disabledSpaces && bicicletero.disabledSpaces.includes(space)) {
        throw new Error(`El espacio ${space} está deshabilitado en el bicicletero ${bicicleteroNumber}`);
    }
    
    // 2. Verificar que el espacio esté dentro del rango válido
    const maxSpaces = bicicletero.space || 15;
    if (space < 1 || space > maxSpaces) {
        throw new Error(`El espacio ${space} no es válido. Debe estar entre 1 y ${maxSpaces}`);
    }
    
    // 3. Verificar que el espacio no esté ocupado por otra reserva activa
    const whereClause = {
        bicicletero: { number: bicicleteroNumber },
        space: space,
        estado: In(["ingresada"]) // SOLO verificamos reservas "ingresadas" que ocupan espacio físico
    };
    
    // Si estamos excluyendo un token (para updates), agregar esa condición
    if (excludeToken) {
        whereClause.token = Not(excludeToken);
    }
    
    const existingReserveInSpace = await reserveRepository.findOne({
        where: whereClause
    });
    
    if (existingReserveInSpace) {
        throw new Error(`El espacio ${space} ya está ocupado por una bicicleta ingresada en el bicicletero ${bicicleteroNumber}`);
    }
    
    return true;
}

export async function getReserveService(token) {
    try {
        const reserve = await reserveRepository.findOne({
            where: { token },
            relations: ["user", "bike", "bicicletero"]
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
            relations: ["user", "bike", "bicicletero"],
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

export async function createReserveService(reserveData, userId) {
    try {
        const { bike_id, bicicletero_number, space, foto_url, doc_url } = reserveData;

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("Usuario no encontrado");

        const bike = await bikeRepository.findOne({ 
            where: { id: bike_id }, 
            relations: ["user"] 
        });

        if (!bike) throw new Error(`La bicicleta con ID ${bike_id} no existe`);
        if (!bike.user) throw new Error("Error crítico: Esta bicicleta no tiene dueño asignado.");
        if (bike.user.id !== userId) throw new Error("No puedes reservar una bicicleta ajena");
        
        // Validar si ya existe una reserva activa para esta bicicleta
        const existingActiveReserve = await reserveRepository.findOne({
            where: {
                bike: { id: bike_id },
                estado: In(["solicitada", "ingresada"])
            }
        });

        if (existingActiveReserve) {
            throw new Error(`Ya existe una reserva activa para esta bicicleta (Token: ${existingActiveReserve.token})`);
        }

        const bicicletero = await bicicleteroRepository.findOne({
            where: { number: bicicletero_number }
        });

        if (!bicicletero) throw new Error(`El bicicletero número ${bicicletero_number} no existe`);
        
        // VALIDACIÓN: Verificar que no haya más de 15 reservas activas en el bicicletero
        const activeReservesCount = await reserveRepository.count({
            where: {
                bicicletero: { number: bicicletero_number },
                estado: In(["solicitada", "ingresada"])
            }
        });
        
        const maxSpaces = bicicletero.space || 15;
        if (activeReservesCount >= maxSpaces) {
            throw new Error(`El bicicletero ${bicicletero_number} está lleno (máximo ${maxSpaces} reservas activas)`);
        }

        // IMPORTANTE: NO asignamos espacio automáticamente al crear la reserva
        // El espacio será null hasta que el guardia ingrese la bicicleta
        // Solo validamos espacio si el usuario intenta especificar uno
        let espacioAsignado = null;
        
        if (space) {
            // Si el usuario proporciona un espacio, validamos que esté disponible
            await verificarEspacioDisponible(bicicletero_number, space);
            espacioAsignado = space;
        }
        // Si no se proporciona espacio, la reserva se crea sin espacio asignado (null)

        const token = Math.floor(1000 + Math.random() * 9000);
        
        const newReserve = reserveRepository.create({
            token,
            estado: "solicitada",
            space: espacioAsignado, // Puede ser null si no se especifica espacio
            foto_url,
            doc_url,
            last_status_change: new Date(),
            user,       
            bike,       
            bicicletero 
        });

        const savedReserve = await reserveRepository.save(newReserve);

        // ✅ CREAR LOG DE RESERVA CREADA
        await createInformLog(savedReserve, 
            `Reserva creada. Token: ${savedReserve.token}. ${espacioAsignado ? `Espacio: ${espacioAsignado}` : 'Sin espacio asignado aún.'}`, 
            "solicitada"
        );

        return savedReserve;

    } catch (error) {
        if (error.code === '23505') throw new Error("Error de token duplicado, intente de nuevo");
        throw error;
    }
}

export async function updateReserveService(token, updateData) {
    try {
        const reserve = await reserveRepository.findOne({
            where: { token: parseInt(token) },
            relations: ["user", "bike", "bicicletero"]
        });

        if (!reserve) throw new Error("Reserva no encontrada");

        const hoy = new Date().toISOString().split('T')[0];
        const informeHoy = await dailyReportRepository.findOneBy({ fecha_reporte: hoy });
        
        if (informeHoy && ["ingresada", "entregada"].includes(updateData.estado)) {
            throw new Error("No se pueden modificar reservas con estados que generen logs después de que el informe del día ya ha sido generado");
        }

        // VALIDACIÓN IMPORTANTE: Verificar si se está cambiando el espacio
        if (updateData.space && updateData.space !== reserve.space) {
            await verificarEspacioDisponible(
                reserve.bicicletero.number, 
                updateData.space, 
                reserve.token // Excluir esta reserva de la verificación
            );
        }

        // VALIDACIÓN ESPECIAL: Si se está cambiando a "ingresada", asegurar que haya espacio
        if (updateData.estado === "ingresada" && !updateData.space && !reserve.space) {
            throw new Error("No se puede cambiar a 'ingresada' sin especificar un espacio");
        }

        // Actualizar el timestamp del último cambio de estado
        if (updateData.estado && updateData.estado !== reserve.estado) {
            updateData.last_status_change = new Date();
        }

        // Guardar el estado anterior para comparar
        const estadoAnterior = reserve.estado;
        const espacioAnterior = reserve.space;

        reserveRepository.merge(reserve, updateData);
        const updatedReserve = await reserveRepository.save(reserve);

        // ✅ CREAR LOGS SEGÚN EL CAMBIO DE ESTADO
        if (updatedReserve.estado === "ingresada") {
            await createInformLog(updatedReserve, 
                `Bicicleta ingresada en espacio ${updatedReserve.space}. ${updateData.nota || "Bicicleta ingresada al bicicletero"}`,
                "ingresada"
            );
        } else if (updatedReserve.estado === "entregada") {
            await createInformLog(updatedReserve, 
                updateData.nota || `Bicicleta retirada del espacio ${espacioAnterior || "sin espacio asignado"}`,
                "entregada"
            );
        } else if (updatedReserve.estado === "cancelada" && estadoAnterior !== "cancelada") {
            // Solo crear log si se cancela por primera vez
            await createInformLog(updatedReserve, 
                updateData.nota || "Reserva cancelada", 
                "cancelada"
            );
        } else if (updateData.space && updateData.space !== espacioAnterior) {
            // Log si solo se cambia el espacio
            await createInformLog(updatedReserve, 
                `Espacio cambiado de ${espacioAnterior || "sin asignar"} a ${updateData.space}. ${updateData.nota || ""}`,
                "espacio_cambiado"
            );
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