import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { 
  createReserveService, 
  getReservesService, 
  updateReserveService, 
  deleteReserveService 
} from "../services/reserve.service.js";
import { createReserveValidation, updateReserveValidation } from "../validations/reserve.validation.js";

export async function getReserves(req, res) {
  try {
    const userId = req.user.sub || req.user.id;
    const reserves = await getReservesService(userId);
    
    return handleSuccess(res, 200, "Lista de reservas", reserves);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createReserve(req, res) {
  try {
    const { error, value } = createReserveValidation.validate(req.body);

    if (error) {
      return handleErrorClient(res, 400, error.details[0].message);
    }

    const userId = req.user.sub || req.user.id; 
    const newReserve = await createReserveService(value, userId);

    handleSuccess(res, 201, "Reserva creada exitosamente", newReserve);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateReserve(req, res) {
  try {
    const { token } = req.params;

    if (!token || isNaN(token)) {
      return handleErrorClient(res, 400, "Token de reserva inválido");
    }

    const { error, value } = updateReserveValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.details[0].message);

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

    const result = await deleteReserveService(parseInt(token));
    handleSuccess(res, 200, "Reserva eliminada exitosamente", result);
  } catch (error) {
    if (error.message.includes("no encontrada")) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
}
