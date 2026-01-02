import axios from './root.service.js';

export const login = async (credentials) => {
  try {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    const response = await axios.post('/auth/login', credentials);
    
    if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (data) => {
    try {
        const response = await axios.post('/auth/register', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};