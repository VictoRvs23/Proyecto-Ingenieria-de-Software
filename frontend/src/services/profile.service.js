import axios from '@services/root.service.js';

export async function getProfile() {
    try {
        const response = await axios.get('/profile/private');
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener perfil' };
    }
}

export async function updateProfile(profileData) {
    try {
        const response = await axios.patch('/profile/private', profileData);
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al actualizar perfil' };
    }
}
export async function eliminateProfile() {
    try {
        const response = await axios.delete('/profile/private');
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al eliminar perfil' };
    }
}

