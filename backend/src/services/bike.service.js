import { AppDataSource } from "../config/configDb.js";
import { Bike } from "../entities/bike.entity.js";
import { User } from "../entities/user.entity.js"; 

const bikeRepository = AppDataSource.getRepository(Bike);
const userRepository = AppDataSource.getRepository(User);

export async function getAllBikes(userId) {
  try {
    return await bikeRepository.find({
      where: { user: { id: userId } }
    });
  } catch (error) {
    throw new Error(`Error al obtener bicicletas: ${error.message}`);
  }
}

export async function getOneById(id, userId) {
  try {
    const bike = await bikeRepository.findOne({
      where: { id: Number(id), user: { id: userId } }
    });
    
    if (!bike) throw new Error("Bicicleta no encontrada o no tienes permisos");
    return bike;
  } catch (error) {
    throw new Error(`Error al obtener bicicleta: ${error.message}`);
  }
}

export async function createNewBike(bikeData, userId) {
  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new Error("Usuario no encontrado");

    const bike = bikeRepository.create({
      ...bikeData,
      user: user,
      bikeImage: null 
    });

    return await bikeRepository.save(bike);
  } catch (error) {
    throw new Error(`Error al crear bicicleta: ${error.message}`);
  }
}

export async function updateBikeService(id, userId, bikeData) {
  try {
    const bike = await bikeRepository.findOne({
      where: { id: Number(id), user: { id: userId } }
    });

    if (!bike) throw new Error("Bicicleta no encontrada o no tienes permisos");

    bikeRepository.merge(bike, bikeData);

    return await bikeRepository.save(bike);
  } catch (error) {
    throw new Error(`Error al actualizar bicicleta: ${error.message}`);
  }
}

export async function removeById(id, userId) {
  try {
    const bike = await bikeRepository.findOne({
      where: { id: Number(id), user: { id: userId } }
    });

    if (!bike) throw new Error("Bicicleta no encontrada o no tienes permisos");

    return await bikeRepository.remove(bike);
  } catch (error) {
    throw new Error(`Error al eliminar bicicleta: ${error.message}`);
  }
}