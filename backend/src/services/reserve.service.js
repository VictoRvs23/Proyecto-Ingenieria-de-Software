"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";
import { Bike } from "../entities/bike.entity.js";
import { User } from "../entities/user.entity.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { createInformLog } from "./inform.service.js";
import { DailyReport } from "../entities/dailyReport.entity.js";
import { In, LessThan, Not } from "typeorm";
import { sendEmail } from "./email.service.js"; 

const reserveRepository = AppDataSource.getRepository(Reserve);
const bikeRepository = AppDataSource.getRepository(Bike);
const userRepository = AppDataSource.getRepository(User);
const bicicleteroRepository = AppDataSource.getRepository(Bicicletero);
const dailyReportRepository = AppDataSource.getRepository(DailyReport);

//correo

const emailStyles = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  color: #333;
  background-color: #ffffff;
`;

const getTemplateHeader = (title, color = "#1565C0") => `
  <div style="background-color: ${color}; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${title}</h1>
  </div>
`;

const reserveCreatedHTML = (nombre, token, bicicletero) => `
  <div style="${emailStyles}">
    ${getTemplateHeader("¡Reserva Solicitada!")}
    <div style="padding: 40px 30px; line-height: 1.6;">
      <h2 style="color: #1565C0; margin-top: 0;">Hola ${nombre},</h2>
      <p>Tu solicitud para el <b>Bicicletero N° ${bicicletero}</b> esta en proceso.</p>
      <div style="background: #f0f7ff; border: 2px dashed #1565C0; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
        <span style="font-size: 14px; color: #555; font-weight: bold;">TU TOKEN DE ACCESO:</span><br>
        <b style="font-size: 38px; color: #1565C0; letter-spacing: 8px;">${token}</b>
      </div>
      <p style="font-size: 13px; color: #666; background: #fff3cd; padding: 10px; border-radius: 5px;">
         <b>Importante:</b> Presenta este código al guardia de turno. Tienes 30 minutos para ingresar antes de que la reserva expire.
      </p>
    </div>
  </div>
`;

const bikeEnteredHTML = (nombre, bicicletero, espacio) => `
  <div style="${emailStyles}">
    ${getTemplateHeader("Ingreso Confirmado", "#2E7D32")}
    <div style="padding: 40px 30px; line-height: 1.6;">
      <h2 style="color: #2E7D32; margin-top: 0;">¡Bicicleta Guardada!</h2>
      <p>Hola <b>${nombre}</b>, confirmamos que tu bicicleta ya se encuentra dentro del bicicletero.</p>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;">📍 <b>Bicicletero:</b> Bicicletero N° ${bicicletero}</p>
        <p style="margin: 5px 0;">🔢 <b>Espacio Asignado:</b> Espacio numero ${espacio}</p>
      </div>
    </div>
  </div>
`;

const genericNoticeHTML = (title, message, color = "#555") => `
  <div style="${emailStyles}">
    ${getTemplateHeader(title, color)}
    <div style="padding: 40px 30px; line-height: 1.6; text-align: center;">
      <p style="font-size: 16px;">${message}</p>
      <p style="margin-top: 25px; font-size: 12px; color: #999;">Sistema de Gestión Bicicletero UBB</p>
    </div>
  </div>
`;

//funciones

export async function cancelExpiredReserves() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const expiredReserves = await reserveRepository.find({
      where: {
        estado: "solicitada",
        updated_at: LessThan(thirtyMinutesAgo)
      },
      relations: ["user", "bike", "bicicletero"]
    });
    
    for (const reserve of expiredReserves) {
      reserve.estado = "cancelada";
      reserve.last_status_change = new Date();
      await reserveRepository.save(reserve);
      await createInformLog(reserve, "Cancelada automáticamente por inactividad (30 minutos)");
      
      
      sendEmail(
        reserve.user.email,
        "Reserva Expirada - Bicicletero UBB",
        genericNoticeHTML("Reserva Expirada", `Hola ${reserve.user.nombre}, tu reserva ha expirado por superar el límite de 30 minutos.`, "#d32f2f")
      ).catch(e => console.error(e));
    }
    return { cancelled: expiredReserves.length };
  } catch (error) {
    throw error;
  }
}

async function verificarEspacioDisponible(bicicleteroNumber, space, excludeToken = null) {
    const bicicletero = await bicicleteroRepository.findOne({ where: { number: bicicleteroNumber } });
    if (!bicicletero) throw new Error(`Bicicletero con número ${bicicleteroNumber} no encontrado`);
    if (bicicletero.disabledSpaces && bicicletero.disabledSpaces.includes(space)) throw new Error(`El espacio ${space} está deshabilitado`);
    const maxSpaces = bicicletero.space || 15;
    if (space < 1 || space > maxSpaces) throw new Error(`Espacio inválido (1-${maxSpaces})`);

    const whereClause = {
        bicicletero: { number: bicicleteroNumber },
        space: space,
        estado: In(["ingresada"]) 
    };
    if (excludeToken) whereClause.token = Not(excludeToken);

    const existingReserveInSpace = await reserveRepository.findOne({ where: whereClause });
    if (existingReserveInSpace) throw new Error(`El espacio ${space} ya está ocupado`);
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
        if (userId) options.where = { user: { id: userId } };
        return await reserveRepository.find(options);
    } catch (error) {
        throw new Error(`Error al obtener reservas: ${error.message}`);
    }
}

export async function createReserveService(reserveData, userId) {
    try {
        const { bike_id, bicicletero_number, space, foto_url, doc_url } = reserveData;
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("Usuario no encontrado");

        const bike = await bikeRepository.findOne({ where: { id: bike_id }, relations: ["user"] });
        if (!bike || bike.user.id !== userId) throw new Error("Bicicleta no válida o ajena");
        
        const existingActiveReserve = await reserveRepository.findOne({
            where: { bike: { id: bike_id }, estado: In(["solicitada", "ingresada"]) }
        });
        if (existingActiveReserve) throw new Error(`Ya tienes una reserva activa (Token: ${existingActiveReserve.token})`);

        const bicicletero = await bicicleteroRepository.findOne({ where: { number: bicicletero_number } });
        const activeReservesCount = await reserveRepository.count({
            where: { bicicletero: { number: bicicletero_number }, estado: In(["solicitada", "ingresada"]) }
        });
        if (activeReservesCount >= (bicicletero.space || 15)) throw new Error("Bicicletero lleno");

        let espacioAsignado = space || null;
        if (space) await verificarEspacioDisponible(bicicletero_number, space);

        const token = Math.floor(1000 + Math.random() * 9000);
        const newReserve = reserveRepository.create({
            token, estado: "solicitada", space: espacioAsignado, foto_url, doc_url,
            last_status_change: new Date(), user, bike, bicicletero 
        });

        const savedReserve = await reserveRepository.save(newReserve);

        await createInformLog(savedReserve, `Reserva creada. Token: ${token}`, "solicitada");

        
        sendEmail(
            user.email,
            `Tu Token de Acceso: ${token}`,
            reserveCreatedHTML(user.nombre, token, bicicletero_number)
        ).catch(err => console.error("Error email token:", err));

        return savedReserve;
    } catch (error) {
        if (error.code === '23505') throw new Error("Error de token, intente de nuevo");
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

        // Validaciones de reporte diario
        const hoy = new Date().toISOString().split('T')[0];
        const informeHoy = await dailyReportRepository.findOneBy({ fecha_reporte: hoy });
        if (informeHoy && ["ingresada", "entregada"].includes(updateData.estado)) {
            throw new Error("Informe diario ya generado, no se admiten más movimientos.");
        }

        if (updateData.space && updateData.space !== reserve.space) {
            await verificarEspacioDisponible(reserve.bicicletero.number, updateData.space, reserve.token);
        }

        if (updateData.estado === "ingresada" && !updateData.space && !reserve.space) {
            throw new Error("Se requiere asignar un espacio para ingresar.");
        }

        const estadoAnterior = reserve.estado;
        const espacioAnterior = reserve.space;

        if (updateData.estado && updateData.estado !== reserve.estado) {
            updateData.last_status_change = new Date();
        }

        reserveRepository.merge(reserve, updateData);
        const updatedReserve = await reserveRepository.save(reserve);

        
        if (updatedReserve.estado === "ingresada") {
            await createInformLog(updatedReserve, `Ingreso en espacio ${updatedReserve.space}`, "ingresada");
            
            sendEmail(
                updatedReserve.user.email,
                "Confirmación de Ingreso - Bicicletero UBB",
                bikeEnteredHTML(updatedReserve.user.nombre, updatedReserve.bicicletero.number, updatedReserve.space)
            ).catch(e => console.error(e));

        } else if (updatedReserve.estado === "entregada") {
            await createInformLog(updatedReserve, updateData.nota || `Retiro de bicicleta`, "entregada");

            sendEmail(
                updatedReserve.user.email,
                "Bicicleta Retirada Exitosamente",
                genericNoticeHTML("¡Buen viaje!", `Hola ${updatedReserve.user.nombre}, has retirado tu bicicleta.`, "#455A64")
            ).catch(e => console.error(e));

        } else if (updatedReserve.estado === "cancelada" && estadoAnterior !== "cancelada") {
            await createInformLog(updatedReserve, updateData.nota || "Reserva cancelada", "cancelada");

            sendEmail(
                updatedReserve.user.email,
                "Reserva Cancelada",
                genericNoticeHTML("Reserva Cancelada", "Tu reserva ha sido cancelada y el espacio ha sido liberado.", "#d32f2f")
            ).catch(e => console.error(e));
        }

        return updatedReserve;
    } catch (error) {
        throw new Error(`Error actualizando reserva: ${error.message}`);
    }
}

export async function deleteReserveService(token) {
    try {
        const result = await reserveRepository.delete({ token });
        if (result.affected === 0) throw new Error("Reserva no encontrada");
        return { message: "Reserva eliminada exitosamente" };
    } catch (error) {
        throw new Error(`Error al eliminar reserva: ${error.message}`);
    }
}