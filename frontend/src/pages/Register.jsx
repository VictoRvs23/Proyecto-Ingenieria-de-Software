import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/form.css"; // Asegúrate de importar el estilo

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    numeroTelefonico: "",
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="auth-background">
      <div className="register-container">
        {/* Cabecera con Logo y Título */}
        <div className="register-header">
          <div className="header-logo-container">
            <img src="/logo-uach.png" alt="Logo" className="uach-logo" />
          </div>
          <h1>¡Bienvenido/a al Bicicletero!</h1>
        </div>

        {/* Formulario en Grid (2 columnas como en tu diseño) */}
        <form className="register-form">
          <div className="form-group">
            <label>Nombre</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Número Telefónico</label>
            <input 
              type="text" 
              name="numeroTelefonico" 
              value={formData.numeroTelefonico} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn-registrar">Registrar</button>
        </form>

        {/* Selector inferior de Iniciar Sesión / Registrar */}
        <div className="auth-switch">
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button className="active">Registrar</button>
        </div>
      </div>
    </div>
  );
};

export default Register;