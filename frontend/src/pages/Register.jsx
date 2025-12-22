import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service"; 
// Importar los iconos
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import "@styles/form.css"; 

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    numeroTelefonico: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nombre || !formData.email || !formData.password) {
        alert("Por favor completa los campos obligatorios");
        setLoading(false);
        return;
    }

    const response = await register(formData);
    setLoading(false);

    if (response.status === "error") {
        alert("Error: " + response.message);
    } else {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        navigate("/login");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        
        <div className="logo-badge">
          <img src="/logoubb.png" alt="Logo" className="ubb-logo-img" />
        </div>

        <h1 className="auth-title">¡Bienvenido/a al Bicicletero!</h1>

        <form className="register-grid" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>Nombre</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="input-group">
            <label>Número Telefónico</label>
            <input 
              type="text" 
              name="numeroTelefonico" 
              value={formData.numeroTelefonico} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-main-green"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
        
        <div className="auth-toggle" style={{ zIndex: 10, position: 'relative' }}>
          <button type="button" onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button type="button" className="active">Registrar</button>
        </div>

      </div>
    </div>
  );
};

export default Register;