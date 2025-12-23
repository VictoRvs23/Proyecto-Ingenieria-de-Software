import axios from './root.service.js'; 

export async function getPrivateProfile() {
    try {
        const response = await axios.get('/profile/private');
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener perfil' };
    }
}

export async function updatePrivateProfile(profileData) {
    try {
        const response = await axios.patch('/profile/private', profileData);
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al actualizar perfil' };
    }
}

export async function deletePrivateProfile() {
    try {
        const response = await axios.delete('/profile/private');
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al eliminar perfil' };
    }
}