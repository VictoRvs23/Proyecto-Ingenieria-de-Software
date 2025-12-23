import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error en register:", error.response?.data);
    return {
      status: "error",
      message: error.response?.data?.message || "Error al conectar con el servidor"
    };
  }
};

export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    console.error("Error en login:", error.response?.data);
    return {
      status: "error",
      message: error.response?.data?.message || "Error al iniciar sesión"
    };
  }
};