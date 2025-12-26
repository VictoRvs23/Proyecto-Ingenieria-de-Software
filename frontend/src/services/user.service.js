import axios from './root.service.js';

export const getAllUsers = async () => {
  try {
    const response = await axios.get('/profile/users');
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const response = await axios.put(
      `/profile/role/${userId}`,
      { role: newRole }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.patch(`/profile/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};
