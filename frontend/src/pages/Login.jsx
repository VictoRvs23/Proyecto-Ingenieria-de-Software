import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock de login para probar frontend sin backend
const login = async ({ email, password }) => {
    // Simula un login exitoso si hay email y password
    if (email && password) {
        return {
            data: {
                token: 'mock-token-123',
                username: email
            }
        };
    } else {
        return {
            message: 'Credenciales incorrectas'
        };
    }
};

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
            // Guarda token en localStorage si quieres simular sesión
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            navigate('/home'); // redirige a la página principal
        } else {
            setError(res.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo: Formulario en azul profundo */}
            <div className="w-full md:w-1/2 bg-blue-800 text-white flex flex-col justify-center p-8 md:p-12">
                <h1 className="text-3xl font-bold mb-8 text-center">REGISTRARSE</h1>

                <form className="space-y-6 max-w-md mx-auto w-full" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full px-4 py-3 bg-blue-700 rounded-full text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3 bg-blue-700 rounded-full text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button 
                        type="submit" 
                        className="w-full bg-white text-blue-800 font-bold py-3 rounded-full hover:bg-blue-50 transition"
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
                        className="text-blue-300 hover:text-blue-200 hover:underline"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
