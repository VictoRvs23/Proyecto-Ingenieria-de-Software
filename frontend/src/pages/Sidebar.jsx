import React, { useEffect, useState } from 'react';
import '../styles/sidebar.css'; 
import { FaHome, FaUser, FaBicycle, FaFileAlt, FaClock, FaSignOutAlt, FaUsers, FaClipboardList, FaQuestionCircle, FaKey } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userImage");
    localStorage.removeItem("bikeImage");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate('/login');
  };

  const showAdminModules = ['admin', 'adminBicicletero', 'guard'].includes(userRole);
  const showUsuariosModule = ['admin', 'adminBicicletero'].includes(userRole);
  const isUser = userRole.toLowerCase() === 'user';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logoubb.png" alt="Logo" className="sidebar-logo" />
      </div>

      <nav className="sidebar-menu">   
        <Link to="/home" className="menu-item">
          <FaHome className="icon" /> Inicio
        </Link>
        
        <Link to="/home/profile" className="menu-item">
          <FaUser className="icon" /> Perfil
        </Link>
        
        <Link to="/home/bicicletero" className="menu-item">
          <FaBicycle className="icon" /> Bicicletero
        </Link>

        {isUser && (
          <Link to="/home/reservas" className="menu-item">
            <FaKey className="icon" /> Mis Reservas
          </Link>
        )}

        <Link to="/home/reportes" className="menu-item">
          <FaClipboardList className="icon" /> Reportes
        </Link>

        <Link to="/home/consultas" className="menu-item">
          <FaQuestionCircle className="icon" /> Consultas
        </Link>
        {showAdminModules && (
          <>
            <div style={{ margin: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.3)' }}></div>
            
            <Link to="/home/turnos" className="menu-item">
              <FaClock className="icon" /> Turnos
            </Link>
          </>
        )}

        {showUsuariosModule && (
          <>
            <div style={{ margin: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.3)' }}></div>
            
            <Link to="/home/usuarios" className="menu-item">
              <FaUsers className="icon" /> Usuarios
            </Link>

            <Link to="/home/historial-informes" className="menu-item">
              <FaFileAlt className="icon" /> Historial Informes
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="icon" /> Cerrar Sesion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;