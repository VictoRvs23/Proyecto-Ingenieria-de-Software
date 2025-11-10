import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await login({ email, password });
        if (res && res.data && res.data.token) {
            navigate('/home');
        } else {
            setError(res.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="w-full md:w-1/2 bg-gray-900 text-white flex flex-col justify-center p-8 md:p-12">
                <h1 className="text-3xl font-bold mb-8 text-center">REGISTRARSE</h1>

                <form className="space-y-6 max-w-md mx-auto w-full" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-3 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button 
                        type="submit" 
                        className="w-full bg-white text-gray-900 font-bold py-3 rounded-full hover:bg-gray-100 transition"
                    >
                        LOGIN
                    </button>
                </form>

                {error && (
                    <p className="mt-4 text-center text-red-400 font-medium">{error}</p>
                )}

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/auth/register')}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </div>

            
            <div className="hidden md:block w-1/2 bg-pink-600"></div>
        </div>
    );
};

export default Login;