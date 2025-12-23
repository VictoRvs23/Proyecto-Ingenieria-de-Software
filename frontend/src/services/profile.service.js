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
        const config = profileData instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        
        const response = await axios.patch('/profile/private', profileData, config);
        return response.data;
    } catch (error) {
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