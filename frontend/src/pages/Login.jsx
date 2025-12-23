import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
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
  const handleLoginSubmit = (data) => {
    const { email, password } = data;
    setLoading(true);
    setTimeout(() => {
        let isAuthenticated = false;
        let role = "user";
        let userName = "Usuario";

        if (email === "admin@gmail.com") {
            if (password === "admin1234") {
                isAuthenticated = true;
                role = "admin";
                userName = "Administrador Principal";
            } else {
                alert("Contraseña incorrecta para Administrador");
                setLoading(false);
                return;
            }
        } 
        else {
            const usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];
            const foundUser = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (foundUser) {
                if (foundUser.password === password) { 
                    isAuthenticated = true;
                    userName = foundUser.name;
                    role = foundUser.role || "user";
                } else {
                    alert("Contraseña incorrecta");
                    setLoading(false);
                    return;
                }
            } else {
                alert("Usuario no registrado");
                setLoading(false);
                return;
            }
        }

        if (isAuthenticated) {
            console.log("Login exitoso");
            localStorage.setItem("role", role);
            localStorage.setItem("name", userName);
            localStorage.setItem("email", email);
            
            navigate("/home");
        }
        
        setLoading(false);
    }, 1000);
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