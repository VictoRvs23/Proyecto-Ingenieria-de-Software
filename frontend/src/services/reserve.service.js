import axios from './root.service.js';

export const createReserve = async (data) => {
  try {
    const response = await axios.post('/reserve', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error de conexión" };
  }
};

export const getReserves = async () => {
  try {
    const response = await axios.get('/reserve');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateReserve = async (token, updateData) => {
  try {
    const response = await axios.patch(`/reserve/${token}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al actualizar reserva" };
  }
};

export const getReserveByToken = async (token) => {
  try {
    const response = await axios.get(`/reserve/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al obtener reserva" };
  }
};

export const deleteReserve = async (token) => {
  try {
    const response = await axios.delete(`/reserve/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al eliminar reserva" };
  }
};