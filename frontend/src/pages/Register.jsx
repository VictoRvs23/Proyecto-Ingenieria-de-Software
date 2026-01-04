import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service"; 
import Form from "../components/Form"; 
import Swal from "sweetalert2";
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
      placeholder: "12345678 (máx. 8 caracteres)",
      required: true 
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "ejemplo@ubiobio.cl",
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

    // ============================================================
    // SOLUCIÓN: VALIDACIÓN DE DOMINIOS PERMITIDOS
    // ============================================================
    const allowedDomains = ['@gmail.com', '@ubiobio.cl', '@gmail.cl', '@alumnos.ubiobio.cl'];
    const emailLower = data.email.toLowerCase();
    
    // Verificamos si el correo termina con alguno de los dominios de la lista
    const isValidDomain = allowedDomains.some(domain => emailLower.endsWith(domain));

    if (!isValidDomain) {
        await Swal.fire({
            icon: 'error',
            title: 'Correo Inválido',
            // Mensaje claro para el usuario
            html: 'El correo debe pertenecer a uno de los siguientes dominios:<br><br><b>@ubiobio.cl<br>@alumnos.ubiobio.cl<br>@gmail.com<br>@gmail.cl</b>',
            confirmButtonColor: '#d33'
        });
        setLoading(false);
        return; // Detenemos el registro aquí si el dominio no es válido
    }
    // ============================================================

    try {
        // Limpieza básica del teléfono (deja solo números)
        let phoneClean = data.numeroTelefonico ? data.numeroTelefonico.replace(/\D/g, '') : "";

        // Agrega el '9' si el usuario puso solo 8 dígitos
        if (phoneClean.length === 8) {
            phoneClean = '9' + phoneClean;
        }
        
        const dataForBackend = {
            nombre: data.nombre, 
            email: data.email,
            password: data.password,
            numeroTelefonico: phoneClean 
        };

        const response = await register(dataForBackend);
        setLoading(false);

        if (response.status === "error") {
            await Swal.fire({
                icon: 'error',
                title: 'Error en el registro',
                text: response.message || 'No se pudo completar el registro',
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        // Limpiamos datos antiguos por seguridad antes de ir al login
        localStorage.clear();

        await Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Ahora puedes iniciar sesión',
            confirmButtonColor: '#1565C0',
            timer: 2000
        });
        navigate("/login");

    } catch (error) {
        setLoading(false);
        console.error("Error inesperado:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.errorDetails || 'Ocurrió un error inesperado';
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonColor: '#d33'
        });
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