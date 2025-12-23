import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service"; 
import Form from "../components/Form"; 
import "@styles/form.css"; 

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const registerFields = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Tu nombre completo",
      required: true
    },
    {
      name: "numeroTelefonico",
      label: "Número Telefónico",
      type: "text",
      placeholder: "+56 9 ...",
      required: true 
    },
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

  const handleRegisterSubmit = async (data) => {
    setLoading(true);

    try {
        // === 1. LIMPIEZA DEL TELÉFONO ===
        // Quitamos '+' y espacios
        let phoneClean = data.numeroTelefonico ? data.numeroTelefonico.replace('+', '').replace(/\s/g, '') : "";

        // SI EL NÚMERO ES MUY LARGO (Más de 10 caracteres):
        // Tu base de datos solo aguanta 10. Si viene como "569..." (11 chars),
        // le quitamos el "56" del principio para que quede "9..." (9 chars).
        if (phoneClean.startsWith('56') && phoneClean.length > 10) {
            phoneClean = phoneClean.slice(2);
        }

        // === 2. PREPARAR DATOS ===
        const dataForBackend = {
            nombre: data.nombre, 
            email: data.email,
            password: data.password,
            numeroTelefonico: phoneClean 
        };

        console.log("Enviando al backend:", dataForBackend);

        // === 3. ENVIAR AL BACKEND ===
        const response = await register(dataForBackend);
        setLoading(false);

        if (response.status === "error") {
            alert("Error del servidor: " + response.message);
            return;
        }

        // === 4. ÉXITO (LocalStorage) ===
        const existingUsers = JSON.parse(localStorage.getItem("usersDB")) || [];
        if (!existingUsers.find(u => u.email === data.email)) {
            existingUsers.push({ 
                email: data.email, 
                name: data.nombre, 
                password: data.password, 
                role: "user" 
            });
            localStorage.setItem("usersDB", JSON.stringify(existingUsers));
        }

        // Limpieza de sesión
        localStorage.removeItem("bikeData");
        localStorage.removeItem("bikeImage");
        localStorage.removeItem("userImage");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        navigate("/login");

    } catch (error) {
        setLoading(false);
        console.error("Error inesperado:", error);
        alert("Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="logo-badge">
          <img src="/logoubb.png" alt="Logo" className="ubb-logo-img" />
        </div>
        
        <h1 className="auth-title">¡Bienvenido/a al Bicicletero!</h1>
        
        <Form 
          fields={registerFields}
          buttonText="Registrar"
          onSubmit={handleRegisterSubmit}
          loading={loading}
        />
        
        <div className="auth-toggle">
          <button type="button" onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button type="button" className="active">Registrar</button>
        </div>

      </div>
    </div>
  );
};

export default Register;