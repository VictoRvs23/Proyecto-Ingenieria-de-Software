import {
  getAllTurns,
  getTurnByUserId,
  createOrUpdateTurn,
  deleteTurn,
  updateMultipleTurns,
} from "../services/turn.service.js";
import { turnValidation, batchTurnsValidation } from "../validations/turn.validation.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getTurns(req, res) {
  try {
    const turns = await getAllTurns();
    handleSuccess(res, 200, "Turnos obtenidos exitosamente", turns);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener turnos", error.message);
  }
}

export async function getTurnByUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return handleErrorClient(res, 400, "ID de usuario inválido");
    }
    
    const turn = await getTurnByUserId(userId);
    
    if (!turn) {
      return handleSuccess(res, 200, "No se encontró turno asignado", null);
    }
    
    handleSuccess(res, 200, "Turno obtenido exitosamente", turn);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener turno", error.message);
  }
}

export async function updateTurn(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return handleErrorClient(res, 400, "ID de usuario inválido");
    }

    const { error } = turnValidation.validate(req.body);
    if (error) {
      return handleErrorClient(res, 400, error.details[0].message);
    }

    const { bicicletero, jornada } = req.body;
    const turn = await createOrUpdateTurn(userId, bicicletero, jornada);
    handleSuccess(res, 200, "Turno actualizado exitosamente", turn);
  } catch (error) {
    if (
      error.message.includes("ya tiene asignado el turno") ||
      error.message.includes("Solo se pueden asignar turnos") ||
      error.message.includes("Usuario no encontrado")
    ) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error al actualizar turno", error.message);
    }
  }
}

export async function removeTurn(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return handleErrorClient(res, 400, "ID de usuario inválido");
    }
    
    const result = await deleteTurn(userId);
    handleSuccess(res, 200, "Turno eliminado exitosamente", result);
  } catch (error) {
    if (error.message.includes("Turno no encontrado")) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al eliminar turno", error.message);
    }
  }
}

export async function updateTurnsInBatch(req, res) {
  try {
    const { error } = batchTurnsValidation.validate(req.body);
    if (error) {
      return handleErrorClient(res, 400, error.details[0].message);
    }

    const { turns } = req.body;
    
    const results = await updateMultipleTurns(turns);
    handleSuccess(res, 200, "Turnos actualizados exitosamente", results);
  } catch (error) {
    if (
      error.message.includes("Conflicto") ||
      error.message.includes("ya tiene asignado el turno")
    ) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error al actualizar turnos", error.message);
    }
  }
}
