import axios from "axios";


const API_URL = "http://localhost:3000/api/informs"; 


const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const InformService = {
  
  getHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/history`, getAuthHeaders());
      
      return response.data.data; 
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateToday: async () => {
    try {
      const response = await axios.get(`${API_URL}/today`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};