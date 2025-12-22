import React from 'react';
import '../styles/sidebar.css'; 
import { FaHome, FaUser, FaBicycle, FaFileAlt, FaClock, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("Cerrando sesión...");
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logoubb.png" alt="Logo" className="sidebar-logo" />
      </div>

      <nav className="sidebar-menu">
        <a href="#inicio" className="menu-item">
          <FaHome className="icon" /> Inicio
        </a>
        <a href="#perfil" className="menu-item">
          <FaUser className="icon" /> Perfil
        </a>
        <a href="#bicicletero" className="menu-item">
          <FaBicycle className="icon" /> Bicicletero
        </a>
        <a href="#informes" className="menu-item">
          <FaFileAlt className="icon" /> Informes
        </a>
        <a href="#turnos" className="menu-item">
          <FaClock className="icon" /> Turnos
        </a>
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