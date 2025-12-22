import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import "@styles/form.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
        alert("Por favor ingrese sus credenciales");
        setLoading(false);
        return;
    }

    const response = await login({ email, password });
    setLoading(false);

    if (response.status === "error") {
        alert(response.message);
    } else {
        console.log("Login exitoso:", response);
        navigate("/home");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="logo-badge">
          <img src="/logoubb.png" alt="Logo UBB" className="ubb-logo-img" />
        </div>

        <h1 className="auth-title">¡Bienvenido/a al Bicicletero!</h1>

        <form className="login-stack" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com"
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="********"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-main-green"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Iniciar Sesion"}
          </button>
        </form>
        <div className="auth-toggle" style={{ zIndex: 10, position: 'relative' }}>
          <button type="button" className="active">Iniciar Sesión</button>
          <button type="button" onClick={() => navigate("/register")}>Registrar</button>
        </div>

      </div>
    </div>
  );
};

export default Login;