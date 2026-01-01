import {
  getAllTurns,
  getTurnByUserId,
  createOrUpdateTurn,
  deleteTurn,
  updateMultipleTurns,
  getGuardTurnWithReplacement,
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
      return handleErrorClient(res, 400, "ID de usuario invalido");
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
      return handleErrorClient(res, 400, "ID de usuario invalido");
    }

    const { error } = turnValidation.validate(req.body);
    if (error) {
      return handleErrorClient(res, 400, error.details[0].message);
    }

    const { bicicletero, hora_inicio, hora_salida } = req.body;
    const turn = await createOrUpdateTurn(userId, bicicletero, hora_inicio, hora_salida);
    handleSuccess(res, 200, "Turno actualizado exitosamente", turn);
  } catch (error) {
    if (
      error.message.includes("ya tiene asignado el turno") ||
      error.message.includes("Solo se pueden asignar turnos") ||
      error.message.includes("Usuario no encontrado") ||
      error.message.includes("Debe ingresar tanto hora") ||
      error.message.includes("Esto ya fue asignado") 
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
      return handleErrorClient(res, 400, "ID de usuario invalido");
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
      error.message.includes("Error") ||
      error.message.includes("ya tiene asignado el turno") ||
      error.message.includes("Esto ya fue asignado") ||
      error.message.includes("Debe ingresar tanto hora")
    ) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error al actualizar turnos", error.message);
    }
  }
}

export async function getGuardTurnWithReplacementInfo(req, res) {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return handleErrorClient(res, 400, "ID de usuario no encontrado");
    }

    const turnData = await getGuardTurnWithReplacement(userId);
    handleSuccess(res, 200, "Turno y reemplazo obtenidos exitosamente", turnData);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener turno con reemplazo", error.message);
  }
}
