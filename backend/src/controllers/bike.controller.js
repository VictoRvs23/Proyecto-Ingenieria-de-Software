import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getAllBikes, getOneById, createNewBike, updateBikeService, removeById } from "../services/bike.service.js";
import { bikeValidation } from "../validations/bike.validations.js";

export async function getBikes(req, res) {
    try {
        const userId = req.user.sub; 
        const bikes = await getAllBikes(userId);  
        handleSuccess(res, 200, "Bicicletas obtenidas exitosamente", bikes);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener las bicicletas", error.message);
    }
}

export async function getBike(req, res) { 
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const bike = await getOneById(id, userId);
        
        if (!bike) return handleErrorClient(res, 404, "Bicicleta no encontrada");
        
        handleSuccess(res, 200, "Bicicleta obtenida exitosamente", bike);
    } catch (error) {
        handleErrorClient(res, 404, error.message);
    }
}

export async function createBike(req, res) {
    try {
        const { error, value } = bikeValidation.validate(req.body);
        if (error) {
            return handleErrorClient(res, 400, error.details[0].message);
        }

        const userId = req.user.sub; 

        const newBike = await createNewBike(value, userId);
        handleSuccess(res, 201, "Bicicleta creada exitosamente", newBike);
    } catch (error) {
        handleErrorServer(res, 500, "Error al crear la bicicleta", error.message);
    }
}

export async function updateBike(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        
        let bikeData = { ...req.body };

        if (req.file) {
            bikeData.bikeImage = `/uploads/${req.file.filename}`;
        }

        const updatedBike = await updateBikeService(id, userId, bikeData);

        if (!updatedBike) return handleErrorClient(res, 404, "No se pudo actualizar (no encontrada o no eres el dueño)");

        handleSuccess(res, 200, "Bicicleta actualizada exitosamente", updatedBike);
    } catch (error) {
        handleErrorClient(res, 404, error.message);
    }
}

export async function deleteBike(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const deleted = await removeById(id, userId);  
        
        if (!deleted) return handleErrorClient(res, 404, "No se pudo eliminar (no encontrada o no eres el dueño)");

        handleSuccess(res, 200, "Bicicleta eliminada exitosamente", null);
    } catch (error) {
        handleErrorClient(res, 404, error.message);
    }
}