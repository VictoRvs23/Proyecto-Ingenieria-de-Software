import axios from './root.service.js';

export const getAllBicicleteros = async () => {
  try {
    const response = await axios.get('/bicicletero/all/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBicicleteroById = async (id) => {
  try {
    const response = await axios.get(`/bicicletero/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleSpaceStatus = async (bicicleteroNumber, spaceNumber, disable) => {
  try {
    const response = await axios.patch(`/bicicletero/${bicicleteroNumber}/space/${spaceNumber}/toggle`, { disable });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkBicicleteroAvailability = async (bicicleteroNumber) => {
  try {
    const response = await axios.get(`/bicicletero/${bicicleteroNumber}/availability`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al verificar disponibilidad" };
  }
};
