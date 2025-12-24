import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getAllBikes, getOneById, createNewBike, updateBike, removeById } from "../services/bike.service.js";
import { bikeValidation } from "../validations/bike.validations.js";

export async function getBikes(req, res) {
    try {
        const bikes = await getAllBikes();  
        handleSuccess(res, 200, "Bicicletas obtenidas exitosamente", bikes);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener las bicicletas", error.message);
    }
}

export async function getBike(req, res) { 
    try {
        const { id } = req.params;
        const bike = await getOneById(id);
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
        const newBike = await createNewBike(value);
        handleSuccess(res, 201, "Bicicleta creada exitosamente", newBike);
    } catch (error) {
        handleErrorServer(res, 500, "Error al crear la bicicleta", error.message);
    }
}

export async function uploadBike(req, res) {
    try {
        const { id } = req.params;
        const bikeData = req.body;
        const updatedBike = await updateBike(id, bikeData);
        handleSuccess(res, 200, "Bicicleta actualizada exitosamente", updatedBike);
    } catch (error) {
        handleErrorClient(res, 404, error.message);
    }
}

export async function deleteBike(req, res) {
    try {
        const { id } = req.params;
        await removeById(id);  
        handleSuccess(res, 200, "Bicicleta eliminada exitosamente", null);
    } catch (error) {
        handleErrorClient(res, 404, error.message);
    }
}
