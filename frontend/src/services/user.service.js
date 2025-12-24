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
