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
    const responseData = response.data || response;

    if (!responseData || !responseData.token) {
      throw new Error("No se recibió un token de acceso.");
    }

    localStorage.setItem('token', responseData.token);
    
    if (responseData.user) {
      localStorage.setItem('user', JSON.stringify(responseData.user));
      localStorage.setItem('userId', responseData.user.id);
      localStorage.setItem('email', responseData.user.email);
      localStorage.setItem('role', responseData.user.role);
      localStorage.setItem('nombre', responseData.user.nombre);
      localStorage.setItem('name', responseData.user.username || responseData.user.nombre);
    }
    
    
    navigate("/home");

  } catch (error) {
    console.error("Error en login:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error al iniciar sesión";
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