"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";
import { Bike } from "../entities/bike.entity.js";
import { User } from "../entities/user.entity.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";

const reserveRepository = AppDataSource.getRepository(Reserve);
const bikeRepository = AppDataSource.getRepository(Bike);
const userRepository = AppDataSource.getRepository(User);
const bicicleteroRepository = AppDataSource.getRepository(Bicicletero);

export async function createReserveService(reserveData, userId) {
  try {
    const { bike_id, bicicletero_number } = reserveData;



    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new Error("Usuario no encontrado");

    const bike = await bikeRepository.findOne({ 
      where: { id: bike_id }, 
      relations: ["user"]
    });

    if (!bike) throw new Error(`La bicicleta con ID ${bike_id} no existe`);
    if (bike.user && bike.user.id !== userId) {
      throw new Error("No puedes reservar una bicicleta que no es tuya");
    }

    const bicicletero = await bicicleteroRepository.findOne({
      where: { number: bicicletero_number }
    });

    if (!bicicletero) throw new Error(`El bicicletero número ${bicicletero_number} no existe`);

    const existingUserReserve = await reserveRepository
      .createQueryBuilder("reserve")
      .leftJoinAndSelect("reserve.bike", "bike")
      .where("reserve.user_id = :userId", { userId })
      .andWhere("reserve.bicicletero_number = :bicicletero_number", { bicicletero_number })
      .andWhere("(reserve.estado = :solicitada OR reserve.estado = :ingresada)", { 
        solicitada: "solicitada",
        ingresada: "ingresada"
      })
      .getOne();



    if (existingUserReserve) {
      if (!existingUserReserve.bike || !existingUserReserve.bike.space) {
        await reserveRepository.remove(existingUserReserve);
      } else {
        throw new Error("Ya tienes una reserva activa en este bicicletero");
      }
    }

    const existingBikeReserve = await reserveRepository
      .createQueryBuilder("reserve")
      .where("reserve.bike_id = :bike_id", { bike_id })
      .andWhere("(reserve.estado = :solicitada OR reserve.estado = :ingresada)", { 
        solicitada: "solicitada", 
        ingresada: "ingresada" 
      })
      .getOne();

    if (existingBikeReserve) {
      throw new Error("Esta bicicleta ya tiene una reserva activa en otro bicicletero");
    }

    const allBikes = await bikeRepository.find({
      where: { bicicletero_number }
    });
    const ocupiedSpaces = allBikes
      .filter(b => b.space !== null)
      .map(b => b.space);
    
    const disabledSpaces = bicicletero.disabledSpaces || [];
    const totalSpaces = bicicletero.space || 15;
    
    let firstAvailableSpace = null;
    for (let i = 1; i <= totalSpaces; i++) {
      if (!ocupiedSpaces.includes(i) && !disabledSpaces.includes(i) && !disabledSpaces.includes(String(i))) {
        firstAvailableSpace = i;
        break;
      }
    }

    if (!firstAvailableSpace) {
      throw new Error("No hay espacios disponibles en este bicicletero");
    }

    const token = Math.floor(1000 + Math.random() * 9000);
    
    const newReserve = reserveRepository.create({
      token,
      estado: "solicitada",
      user_id: userId,
      bike_id,
      bicicletero_number
    });

    const savedReserve = await reserveRepository.save(newReserve);
    
    bike.space = firstAvailableSpace;
    bike.bicicletero_number = bicicletero_number;
    await bikeRepository.save(bike);
    

    
    return savedReserve;

  } catch (error) {
    if (error.code === '23505') throw new Error("Error de token duplicado, intente de nuevo");
    throw error;
  }
}

export async function getReservesService(userId = null) {
  try {
    console.log(`📋 Consultando reservas para usuario: ${userId || 'todos'}`);
    
    const queryBuilder = reserveRepository
      .createQueryBuilder("reserve")
      .leftJoinAndSelect("reserve.user", "user")
      .leftJoinAndSelect("reserve.bike", "bike")
      .orderBy("reserve.created_at", "DESC");
    
    if (userId) {
      queryBuilder.where("reserve.user_id = :userId", { userId });
    }
    
    const reserves = await queryBuilder.getMany();
    console.log(`✅ Encontradas ${reserves.length} reservas`);
    
    const validReserves = [];
    for (const r of reserves) {
      console.log(`  - Reserva ID ${r.id}: token=${r.token}, estado=${r.estado}, bicicletero=${r.bicicletero_number}`);
      console.log(`    Bike info: bike_id=${r.bike_id}, bike=${r.bike ? `ID:${r.bike.id}, space:${r.bike.space}, bicicletero:${r.bike.bicicletero_number}` : 'NULL'}`);
      
      if ((r.estado === 'solicitada' || r.estado === 'ingresada') && (!r.bike || r.bike.space === null)) {
        console.log(`    ⚠️ Reserva huérfana (sin espacio), eliminando...`);
        await reserveRepository.remove(r);
        console.log(`    ✅ Reserva eliminada`);
      } else {
        validReserves.push(r);
      }
    }
    
    console.log(`✅ Reservas válidas: ${validReserves.length}`);
    return validReserves;
  } catch (error) {
    throw new Error(`Error al obtener reservas: ${error.message}`);
  }
}

export async function updateReserveService(token, updateData) {
  try {
    console.log("📝 updateReserveService iniciado");
    console.log("Token:", token);
    console.log("updateData:", updateData);
    
    const reserve = await reserveRepository.findOne({
      where: { token: parseInt(token) },
      relations: ["bike"]
    });

    if (!reserve) throw new Error("Reserva no encontrada");
    
    console.log("Reserva encontrada:", { id: reserve.id, bike_id: reserve.bike_id, estado: reserve.estado });

    if (updateData.estado === "ingresada" && updateData.space_number) {
      console.log("🚲 Actualizando espacio de bici a:", updateData.space_number);
      const bike = await bikeRepository.findOne({ where: { id: reserve.bike_id } });
      if (bike) {
        console.log("Bici antes:", { id: bike.id, space: bike.space });
        bike.space = updateData.space_number;
        await bikeRepository.save(bike);
      }
    }

    if (updateData.estado === "entregada") {
      const bike = await bikeRepository.findOne({ where: { id: reserve.bike_id } });
      if (bike) {
        bike.space = null;
        await bikeRepository.save(bike);
      }
      
      await reserveRepository.remove(reserve);
      
      return { message: "Bicicleta entregada y reserva finalizada" };
    }

    reserveRepository.merge(reserve, { estado: updateData.estado });
    const updatedReserve = await reserveRepository.save(reserve);


    return updatedReserve;
  } catch (error) {
    throw new Error(`Error actualizando reserva: ${error.message}`);
  }
}

export async function deleteReserveService(token) {
  try {
    // Buscar la reserva antes de eliminarla para obtener la bici asociada
    const reserva = await reserveRepository.findOne({ where: { token: parseInt(token) } });
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }
    // Limpiar el campo space de la bicicleta asociada
    if (reserva.bike_id) {
      const bike = await bikeRepository.findOne({ where: { id: reserva.bike_id } });
      if (bike) {
        bike.space = null;
        await bikeRepository.save(bike);
      }
    }
    await reserveRepository.delete({ token: parseInt(token) });
    return { message: "Reserva eliminada exitosamente" };
  } catch (error) {
    throw new Error(`Error al eliminar reserva: ${error.message}`);
  }
}
