import { AppDataSource } from "../config/configDb.js";
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { Bike } from "../entities/bike.entity.js";

export class BicicleteroService {
  async getAllBicicleteros() {
    const repo = AppDataSource.getRepository(Bicicletero);
    const bicicleteros = await repo.find({
      relations: ["bikes"]
    });
    
    return bicicleteros.map(b => ({
      numero: b.number,
      espaciosOcupados: b.bikes ? b.bikes.length : 0,
      espaciosTotales: b.space
    }));
  }

  async getStatus() {
    const repo = AppDataSource.getRepository(Bicicletero);
    const data = await repo.findOne({ 
      where: { number: 1 }, 
      relations: ["bikes"]
    });
    return data;
  }

  async addBike(guardId, bikeData, bicicleteroId) {
    const bikeRepo = AppDataSource.getRepository(Bike);
    const bicicleteroRepo = AppDataSource.getRepository(Bicicletero);

    const bicicletero = await bicicleteroRepo.findOne({
      where: { number: bicicleteroId },
      relations: ["bikes"]
    });

    if (!bicicletero) {
      throw new Error(`Bicicletero con número ${bicicleteroId} no existe`);
    }
    if (bicicletero.bikes.length >= bicicletero.space) {
      throw new Error("Bicicletero lleno");
    }

    const bike = bikeRepo.create({
      ...bikeData,
      bicicletero
    });
    return await bikeRepo.save(bike);
  }

  async removeBike(guardId, bikeId) {
    const bikeRepo = AppDataSource.getRepository(Bike);
    const bike = await bikeRepo.findOneBy({ number: bikeId });
    if (!bike) throw new Error("Bicicleta no encontrada");
    await bikeRepo.remove(bike);
    return { message: "Bicicleta removida" };
  }

  async getBicicleteroByNumber(number) {
    const repo = AppDataSource.getRepository(Bicicletero);
    const bicicletero = await repo.findOne({
      where: { number: Number(number) },
      relations: ["bikes"]
    });
    if (!bicicletero) {
      throw new Error(`Bicicletero con número ${number} no encontrado`);
    }
    return bicicletero;
  }
}
