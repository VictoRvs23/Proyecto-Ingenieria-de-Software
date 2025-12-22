import axios from './root.service';

export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    return response.data; 
  } catch (error) {
    console.error("Error en register:", error);
    return { 
        status: "error", 
        message: error.response?.data?.message || "Error al conectar con el servidor" 
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Error en login:", error);
    return { 
        status: "error", 
        message: error.response?.data?.message || "Credenciales incorrectas" 
    };
  }
};

export const logout = () => {
};