import axiosOriginal from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axiosOriginal.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    return {
      status: "error",
      message: error.response?.data?.message || "Error al registrarse"
    };
  }
};

export const login = async (userData) => {
  try {
    const response = await axiosOriginal.post(`${API_URL}/login`, userData);
    const loginData = response.data.data; 
    const token = loginData?.token;
    const user = loginData?.user;

    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    console.error("Error en login:", error);
    return {
      status: "error",
      message: error.response?.data?.message || "Error al iniciar sesión"
    };
  }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
};