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
        const response = await axios.patch(`/bikes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "error", message: 'Error al actualizar imagen' };
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