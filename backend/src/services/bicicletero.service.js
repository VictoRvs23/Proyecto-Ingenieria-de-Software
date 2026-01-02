import { AppDataSource } from "../config/configDb.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { Bike } from "../entities/bike.entity.js";
import { Reserve } from "../entities/reserve.entity.js";
import { In } from "typeorm";

export class BicicleteroService {
  async getAllBicicleteros() {
    const repo = AppDataSource.getRepository(Bicicletero);
    const bicicleteros = await repo.find({
      relations: ["reserves"]
    });
    
    return bicicleteros.map(b => {
      // Contar reservas activas en lugar de bicicletas
      const activeReservesCount = b.reserves ? 
        b.reserves.filter(r => ["solicitada", "ingresada"].includes(r.estado)).length : 0;
      
      const markedOccupiedCount = b.disabledSpaces ? b.disabledSpaces.length : 0;
      
      return {
        numero: b.number,
        espaciosOcupados: activeReservesCount + markedOccupiedCount,
        espaciosTotales: b.space || 15, // Default 15
        reservasActivas: activeReservesCount,
        espaciosDeshabilitados: markedOccupiedCount
      };
    });
  }

  async getStatus() {
    const repo = AppDataSource.getRepository(Bicicletero);
    const data = await repo.findOne({ 
      where: { number: 1 }, 
      relations: ["reserves"]
    });
    return data;
  }

  async addBike(guardId, bikeData, bicicleteroId) {
    // Esta función ya no debería usarse para agregar bicicletas directamente
    // Las bicicletas ahora se asocian a través de reservas
    throw new Error("Esta función está obsoleta. Use el sistema de reservas en su lugar.");
  }

  async removeBike(guardId, bikeId) {
    // Esta función también está obsoleta
    throw new Error("Esta función está obsoleta. Use el sistema de reservas en su lugar.");
  }

  async getBicicleteroByNumber(number) {
    const repo = AppDataSource.getRepository(Bicicletero);
    const reserveRepo = AppDataSource.getRepository(Reserve);
    
    const bicicletero = await repo.findOne({
      where: { number: Number(number) }
    });
    
    if (!bicicletero) {
      throw new Error(`Bicicletero con número ${number} no encontrado`);
    }
    
    // Obtener reservas activas para este bicicletero
    const activeReserves = await reserveRepo.find({
      where: {
        bicicletero: { number: Number(number) },
        estado: In(["solicitada", "ingresada"])
      },
      relations: ["bike", "user"],
      order: { created_at: "DESC" }
    });
    
    return {
      ...bicicletero,
      activeReserves: activeReserves,
      activeReservesCount: activeReserves.length,
      availableSpaces: (bicicletero.space || 15) - activeReserves.length
    };
  }

  async toggleSpaceStatus(bicicleteroNumber, spaceNumber, disable) {
    const repo = AppDataSource.getRepository(Bicicletero);
    const bicicletero = await repo.findOne({
      where: { number: Number(bicicleteroNumber) }
    });
    
    if (!bicicletero) {
      throw new Error(`Bicicletero con número ${bicicleteroNumber} no encontrado`);
    }

    let disabledSpaces = bicicletero.disabledSpaces || [];
    const spaceNum = Number(spaceNumber);

    if (disable) {
      if (!disabledSpaces.includes(spaceNum)) {
        disabledSpaces.push(spaceNum);
      }
    } else {
      disabledSpaces = disabledSpaces.filter(s => Number(s) !== spaceNum);
    }

    bicicletero.disabledSpaces = disabledSpaces;
    await repo.save(bicicletero);
    
    return bicicletero;
  }
  
  // Nueva función para verificar disponibilidad - CORREGIDA
  async checkAvailability(bicicleteroNumber) {
    const repo = AppDataSource.getRepository(Bicicletero);
    const reserveRepo = AppDataSource.getRepository(Reserve);
    
    const bicicletero = await repo.findOne({
      where: { number: Number(bicicleteroNumber) }
    });
    
    if (!bicicletero) {
      throw new Error(`Bicicletero con número ${bicicleteroNumber} no encontrado`);
    }
    
    // Obtener reservas activas
    const activeReserves = await reserveRepo.find({
      where: {
        bicicletero: { number: Number(bicicleteroNumber) },
        estado: In(["solicitada", "ingresada"])
      }
    });
    
    const maxSpaces = bicicletero.space || 15;
    const activeReservesCount = activeReserves.length;
    
    // Determinar espacios ocupados y disponibles
    const espaciosOcupados = activeReserves.map(r => r.space).filter(s => s != null);
    const espaciosDeshabilitados = bicicletero.disabledSpaces || [];
    
    // Calcular espacios disponibles (1-15)
    const todosEspacios = Array.from({length: maxSpaces}, (_, i) => i + 1);
    const espaciosDisponibles = todosEspacios.filter(espacio => 
      !espaciosOcupados.includes(espacio) && 
      !espaciosDeshabilitados.includes(espacio)
    );
    
    return {
      bicicleteroNumber,
      maxSpaces,
      activeReserves: activeReservesCount,
      availableSpaces: espaciosDisponibles.length,
      isFull: espaciosDisponibles.length === 0,
      espaciosOcupados: espaciosOcupados.sort((a, b) => a - b),
      espaciosDeshabilitados: espaciosDeshabilitados.sort((a, b) => a - b),
      espaciosDisponibles: espaciosDisponibles.sort((a, b) => a - b),
      totalOcupados: espaciosOcupados.length + espaciosDeshabilitados.length
    };
  }
}
