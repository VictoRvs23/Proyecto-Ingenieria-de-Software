import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form"; 
import { login } from "../services/auth.service.js";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import "@styles/form.css"; 

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const loginFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "correo@ejemplo.com",
      required: true
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "********",
      required: true
    }
  ];

  const handleLoginSubmit = async (data) => {
    const { email, password } = data;
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('email', response.data.user.email);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('name', response.data.user.username || response.data.user.nombre);
      }
      
      showSuccessAlert("¡Éxito!", "Inicio de sesión exitoso");
      navigate("/home");
    } catch (error) {
      console.error("Error en login:", error);
      const errorMessage = error.response?.data?.message || "Error al iniciar sesión";
      showErrorAlert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="logo-badge">
          <img src="/logoubb.png" alt="Logo UBB" className="ubb-logo-img" />
        </div>
        
        <h1 className="auth-title">¡Bienvenido/a al Bicicletero!</h1>
        <Form 
          fields={loginFields}
          buttonText="Iniciar Sesión"
          onSubmit={handleLoginSubmit}
          loading={loading}
        />

        <div className="auth-toggle">
          <button type="button" className="active">Iniciar Sesión</button>
          <button type="button" onClick={() => navigate("/register")}>Registrar</button>
        </div>
      </div>
    </div>
  );
};

export default Login;