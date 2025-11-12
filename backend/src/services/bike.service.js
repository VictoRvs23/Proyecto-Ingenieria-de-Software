import { AppDataSource } from "../config/configDb.js";
import { Bike } from "../entities/bike.entity.js";

const bikeRepository = AppDataSource.getRepository(Bike);

export async function getAllBikes() {
  try {
    return await bikeRepository.find();
  } catch (error) {
    throw new Error(`Error al obtener bicicletas: ${error.message}`);
  }
}

export async function getOneById(id) {
  try {
    const bike = await bikeRepository.findOneBy({ id });
    if (!bike) throw new Error("Bicicleta no encontrada");
    return bike;
  } catch (error) {
    throw new Error(`Error al obtener bicicleta: ${error.message}`);
  }
}

export async function createNewBike(bikeData) {
  try {
    const bike = bikeRepository.create(bikeData);
    return await bikeRepository.save(bike);
  } catch (error) {
    throw new Error(`Error al crear bicicleta: ${error.message}`);
  }
}

export async function updateBike(id, bikeData) {
  try {
    const bike = await bikeRepository.findOneBy({ id });
    if (!bike) throw new Error("Bicicleta no encontrada");
    Object.assign(bike, bikeData);
    return await bikeRepository.save(bike);
  } catch (error) {
    throw new Error(`Error al actualizar bicicleta: ${error.message}`);
  }
}

export async function removeById(id) {
  try {
    const bike = await bikeRepository.findOneBy({ id });
    if (!bike) throw new Error("Bicicleta no encontrada");
    return await bikeRepository.remove([bike]);
  } catch (error) {
    throw new Error(`Error al eliminar bicicleta: ${error.message}`);
  }
}