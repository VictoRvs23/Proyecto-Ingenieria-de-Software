import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { 
    createReserveService, 
    getReserveService, 
    getReservesService, 
    updateReserveService, 
    deleteReserveService 
} from "../services/reserve.service.js";
import { createReserveValidation, updateReserveValidation } from "../validations/reserve.validation.js";

// NOTA: Ya no necesitamos importar AppDataSource ni los Repositorios aquí,
// porque toda la lógica de base de datos se movió al archivo reserve.service.js

export async function getReserve(req, res) {
    try {
        const { token } = req.params;

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        // Usamos el servicio
        const reserve = await getReserveService(parseInt(token));
        
        return handleSuccess(res, 200, "Reserva obtenida", reserve);
    } catch (error) {
        // Si el servicio lanza error (ej: "No encontrada"), lo capturamos aquí
        if (error.message.includes("no encontrada")) {
            return handleErrorClient(res, 404, error.message);
        }
        handleErrorServer(res, 500, error.message);
    }
}

export async function getReserves(req, res) {
    try {
        const userId = req.user.sub || req.user.id; // Para filtrar por usuario si es necesario
        // Puedes ajustar getReservesService para aceptar userId si quieres filtrar, o dejarlo vacío para traer todas
        const reserves = await getReservesService(userId);
        
        return handleSuccess(res, 200, "Lista de reservas", reserves);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function createReserve(req, res) {
    try {
        // 1. Validar Body
        const { error, value } = createReserveValidation.validate(req.body);

        if (error) {
            return handleErrorClient(res, 400, error.details[0].message);
        }

        // 2. Obtener User ID del token
        const userId = req.user.sub || req.user.id; 

        // 3. Usar el servicio (Aquí valida bicicletero, bici y crea el registro en Informs si aplica)
        const newReserve = await createReserveService(value, userId);

        handleSuccess(res, 201, "Reserva creada exitosamente", newReserve);
    } catch (error) {
        // Errores de validación de negocio (ej: bicicletero lleno)
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateReserve(req, res) {
    try {
        const { token } = req.params;
        const changes = req.body; // Aquí viene { estado: "...", nota: "..." }

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        // Validar datos de entrada (opcional, pero recomendado)
        const { error, value } = updateReserveValidation.validate(changes);
        if (error) return handleErrorClient(res, 400, error.details[0].message);

        // USAMOS EL SERVICIO: Esto es vital para que se dispare el Trigger del PDF
        const updatedReserve = await updateReserveService(parseInt(token), value);

        return handleSuccess(res, 200, "Reserva actualizada exitosamente", updatedReserve);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteReserve(req, res) {
    try {
        const { token } = req.params;
        
        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }

        // Usamos el servicio
        const result = await deleteReserveService(parseInt(token));
        
        return handleSuccess(res, 200, result.message);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}