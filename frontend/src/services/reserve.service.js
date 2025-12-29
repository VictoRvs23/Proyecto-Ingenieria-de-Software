import axios from './root.service.js';

// Obtener el historial de informes (Lista de URLs)
export const getInformHistory = async () => {
    try {
        const response = await axios.get('/informs/history');
        return response.data; // Retorna { data: [ ...lista... ] }
    } catch (error) {
        throw error.response?.data || { message: "Error obteniendo informes" };
    }
};