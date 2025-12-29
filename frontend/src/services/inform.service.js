// Crear una reserva (FormData para soportar imágenes)
export const createReserve = async (formData) => {
    try {
        const response = await axios.post('/reserve', formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error de conexión" };
    }
};

// Obtener todas las reservas (para admin o validaciones)
export const getReserves = async () => {
    try {
        const response = await axios.get('/reserve');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};