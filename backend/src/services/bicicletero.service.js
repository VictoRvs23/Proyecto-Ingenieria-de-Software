import { AppDataSource } from "../config/configDb.js"; 
import { Bicicletero } from "../entities/bicicletero.entity.js";
import { Bike } from "../entities/bike.entity.js";

export class BicicleteroService {
    async getStatus() {
        const repo = AppDataSource.getRepository(Bicicletero);
        const data = await repo.findOne({ where: { id: 1 }, relations: ["bikes"] });

        return {
            capacidad: data.capacity,
            ocupados: data.bikes.length,
            disponibles: data.capacity - data.bikes.length,
            bikes: data.bikes
        };
    }

    async addBike(guardId, bikeData) {
        const repo = AppDataSource.getRepository(Bicicletero);
        const bikeRepo = AppDataSource.getRepository(Bike);

        const bicicletero = await repo.findOne({ where: { id: 1 }, relations: ["bikes"] });

        if (bicicletero.bikes.length >= bicicletero.capacity) {
            throw new Error("Bicicletero lleno");
        }

        const bike = bikeRepo.create({
            ...bikeData,
            guardId
        });

        await bikeRepo.save(bike);

        bicicletero.bikes.push(bike);
        await repo.save(bicicletero);

        return bike;
    }

    async removeBike(guardId, bikeId) {
        const bikeRepo = AppDataSource.getRepository(Bike);
        const bike = await bikeRepo.findOne({ where: { id: bikeId } });

        if (!bike) throw new Error("Bicicleta no encontrada");

        if (bike.guardId !== guardId) {
            throw new Error("Solo el guardia puede retirarla");
        }

        await bikeRepo.delete(bikeId);
        return true;
    }
}
