import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { Reserve } from "../entities/reserve.entity.js";
import { Bike } from "../entities/bike.entity.js";

const bikeRepository = AppDataSource.getRepository(Bike);
const reserveRepository = AppDataSource.getRepository(Reserve);

export async function getReserve(req, res) {
    try {
        const { token } = req.params;

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        const reserve = await reserveRepository.findOne({
            where: { token: parseInt(token) },
            relations: ["user"],
        });
        
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        return handleSuccess(res, 200, reserve);
    } catch (error) {
        console.error("Error in getReserve:", error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReserves(req, res) {
    try {
        const reserves = await reserveRepository.find({ 
            relations: ["user"] 
        });
        return handleSuccess(res, 200, reserves);
    } catch (error) {
        console.error("Error in getReserves:", error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function createReserve(req, res) {
    try {
        const { bike_id } = req.body;
        const userFromToken = req.user;

        console.log("user_id from body:", user_id, "type:", typeof user_id);
        console.log("userFromToken.id:", userFromToken.id, "type:", typeof userFromToken.id);

        if (parseInt(user_id) !== userFromToken.id) {
            return handleErrorClient(res, 403, "No tienes permiso para crear una reserva para otro usuario");
        }
        const bike = await bikeRepository.findOneBy({ id: parseInt(bike_id) });
        if (!bike) {
            return handleErrorClient(res, 404, "La bicicleta especificada no existe");
        }

        // Multer
        const files = req.files || {};
        let foto_url = null;
        let doc_url = null;

        if (files.foto && files.foto[0]) {
            foto_url = `${req.protocol}://${req.get('host')}/uploads/${files.foto[0].filename}`;
        }
        if (files.doc && files.doc[0]) {
            doc_url = `${req.protocol}://${req.get('host')}/uploads/${files.doc[0].filename}`;
        }

        const token = Math.floor(1000 + Math.random() * 9000);

        const newReserve = reserveRepository.create({
            estado: "ingresada",
            token,
            bike: { id: parseInt(bike_id) },
            foto_url: foto_url,
            doc_url: doc_url
        });

        const savedReserve = await reserveRepository.save(newReserve);
        return handleSuccess(res, 201, "Reserva creada exitosamente", savedReserve);
    } catch (error) {
        console.error("Error in createReserve:", error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateReserve(req, res) {
    try {
        const { token } = req.params;
        const { estado } = req.body;

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        const reserve = await reserveRepository.findOneBy({ 
            token: parseInt(token) 
        });
        
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        
        if (estado) reserve.estado = estado;

        const updatedReserve = await reserveRepository.save(reserve);
        return handleSuccess(res, 200, "Reserva actualizada exitosamente", updatedReserve);
    } catch (error) {
        console.error("Error in updateReserve:", error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteReserve(req, res) {
    try {
        const { token } = req.params;
        
        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        const reserve = await reserveRepository.findOneBy({ 
            token: parseInt(token) 
        });  
        
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        
        await reserveRepository.remove(reserve);
        return handleSuccess(res, 200, "Reserva eliminada exitosamente");
    } catch (error) {
        console.error("Error in deleteReserve:", error);
        handleErrorServer(res, 500, error.message);
    }
}