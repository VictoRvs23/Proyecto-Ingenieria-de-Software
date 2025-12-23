import axios from './root.service.js'; 

export async function getPrivateProfile() {
    try {
        const response = await axios.get('/profile/private');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function updatePrivateProfile(profileData) {
    try {
        console.log('📤 Enviando actualización de perfil');
        console.log('📦 Tipo de datos:', profileData instanceof FormData ? 'FormData' : typeof profileData);
        
        // Para FormData, no establecer ninguna configuración especial
        // El navegador lo manejará automáticamente
        const response = await axios.patch('/profile/private', profileData);
        console.log('✅ Respuesta exitosa del servicio:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en servicio de perfil:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error; 
    }
}

export async function deletePrivateProfile() {
    try {
        const response = await axios.delete('/profile/private');
        return response.data;
    } catch (error) {
        throw error;
    }
}