import axios from './root.service.js';

export async function getBikes() {
    try {
        const response = await axios.get('/bikes');
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "error", message: 'Error al obtener bicicletas' };
    }
}

export async function createBike(bikeData) {
    try {
        const response = await axios.post('/bikes', bikeData);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "error", message: 'Error al crear bicicleta' };
    }
}

export async function updateBikeImage(id, formData) {
    try {
        console.log('📤 Actualizando imagen de bicicleta ID:', id);
        const response = await axios.patch(`/bikes/${id}`, formData);
        console.log('✅ Respuesta exitosa:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error al actualizar imagen de bicicleta:', {
            status: error.response?.status,
            data: error.response?.data
        });
        return error.response?.data || { status: "error", message: 'Error al actualizar imagen' };
    }
}

export async function updateBike(id, bikeData) {
    try {
        const response = await axios.patch(`/bikes/${id}`, bikeData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function deleteBike(id) {
    try {
        const response = await axios.delete(`/bikes/${id}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "error", message: 'Error al eliminar bicicleta' };
    }
}