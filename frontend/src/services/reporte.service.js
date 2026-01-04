import axios from './root.service.js';

export const createReport = async (reportData) => {
    try {
        const response = await axios.post('/reportes', reportData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyReports = async () => {
    try {
        const response = await axios.get('/reportes/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllReports = async () => {
    try {
        const response = await axios.get('/reportes');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateReportStatus = async (id, status, respuestaAdmin) => {
    try {
        const body = { 
            estado: status,
            respuesta: respuestaAdmin 
        };
        
        const response = await axios.patch(`/reportes/${id}/status`, body);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteReport = async (id) => {
    try {
        const response = await axios.delete(`/reportes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar reporte:", error);
        throw error;
    }
};