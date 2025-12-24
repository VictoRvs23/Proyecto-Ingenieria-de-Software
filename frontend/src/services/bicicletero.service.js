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
