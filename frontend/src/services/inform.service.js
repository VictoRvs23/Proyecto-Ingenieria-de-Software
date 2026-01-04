import axios from "axios";

// Ajusta esta URL base según tu configuración (ej. localhost:3000/api)
const API_URL = "http://localhost:3000/api/informs"; 

// Configuración básica de cabeceras (si manejas tokens, asegúrate de incluirlos aquí o en un interceptor)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // O donde guardes tu token
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const InformService = {
  // Obtener historial de informes (GET /api/informs/history)
  getHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/history`, getAuthHeaders());
      // Tu backend devuelve: { status, message, data: [...] }
      return response.data.data; 
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generar informe de hoy (GET /api/informs/today)
  generateToday: async () => {
    try {
      const response = await axios.get(`${API_URL}/today`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};