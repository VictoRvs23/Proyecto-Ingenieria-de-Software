import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/form.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí conectarás con auth.service.js más adelante
    console.log("Iniciando sesión con:", email);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {/* Logo superior alineado con la pestaña blanca */}
        <div className="logo-badge">
          <img src="/logo-uach.png" alt="UACh" className="uach-logo-img" />
        </div>

        <h1 className="auth-title">¡Bienvenido/a al Bicicletero!</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-main-green">Iniciar Sesion</button>
        </form>

        {/* Barra de navegación inferior */}
        <div className="auth-toggle">
          <button className="active">Iniciar Sesion</button>
          <button onClick={() => navigate("/register")}>Registrar</button>
        </div>
      </div>
    </div>
  );
};

export default Login;