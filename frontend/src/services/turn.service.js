import axios from './root.service.js';

export const getAllTurns = async () => {
  try {
    const response = await axios.get('/turns');
    return response.data;
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    throw error;
  }
};

export const getTurnByUser = async (userId) => {
  try {
    const response = await axios.get(`/turns/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener turno del usuario:", error);
    throw error;
  }
};

export const updateTurn = async (userId, turnData) => {
  try {
    const response = await axios.put(`/turns/${userId}`, turnData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    throw error;
  }
};

export const updateMultipleTurns = async (turnsData) => {
  try {
    const response = await axios.put('/turns', { turns: turnsData });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar turnos:", error);
    throw error;
  }
};

export const deleteTurn = async (userId) => {
  try {
    const response = await axios.delete(`/turns/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    throw error;
  }
};
