import { useState } from 'react';
import { login } from '../services/auth.service.js';

export const useLogin = () => {
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    const errorData = (dataMessage) => {
        if (dataMessage) {
            if (dataMessage.includes('email') || dataMessage.includes('Email')) {
                setErrorEmail(dataMessage);
            } else if (dataMessage.includes('password') || dataMessage.includes('contraseña')) {
                setErrorPassword(dataMessage);
            }
        }
    };

    const handleInputChange = () => {
        setErrorEmail('');
        setErrorPassword('');
    };

    const handleLogin = async (credentials) => {
        try {
            const response = await login(credentials);
            
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    };

    return {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange,
        handleLogin
    };
};

export default useLogin;
