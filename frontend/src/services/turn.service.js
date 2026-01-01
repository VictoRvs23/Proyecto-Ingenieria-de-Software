import axios from './root.service.js';

export const getAllTurns = async () => {
  try {
    const response = await axios.get('/turnos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    throw error;
  }
};

export const getTurnByUser = async (userId) => {
  try {
    const response = await axios.get(`/turnos/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener turno del usuario:", error);
    throw error;
  }
};

export const updateTurn = async (userId, turnData) => {
  try {
    const response = await axios.put(`/turnos/${userId}`, turnData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    throw error;
  }
};

export const updateMultipleTurns = async (turnsData) => {
  try {
    const response = await axios.put('/turnos', { turns: turnsData });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar turnos:", error);
    throw error;
  }
};

export const deleteTurn = async (userId) => {
  try {
    const response = await axios.delete(`/turnos/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    throw error;
  }
};

export const getGuardCurrentTurnWithReplacement = async () => {
  try {
    const response = await axios.get('/turnos/guard/current-with-replacement');
    return response.data;
  } catch (error) {
    console.error("Error al obtener turno actual con reemplazo:", error);
    throw error;
  }
};
