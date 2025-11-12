import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const login = async ({ email, password }) => {
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
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            navigate('/home');
        } else {
            setError(res.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-section">
                <h1 className="login-title">REGISTRARSE</h1>

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="login-input"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="login-input"
                    />

                    <button 
                        type="submit" 
                        className="login-button"
                    >
                        LOGIN
                    </button>
                </form>

                {error && (
                    <p className="login-error">{error}</p>
                )}

                <div className="login-footer">
                    <button
                        type="button"
                        onClick={() => navigate('/auth/register')}
                        className="login-register-link"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;