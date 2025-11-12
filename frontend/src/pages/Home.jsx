import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaFileAlt, FaClock, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { GrBike } from "react-icons/gr"; 
import '../styles/sidebar.css';

const Sidebar = ({ userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="sidebar-title">Menú</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle"
        >
          {isCollapsed ? (
            <FaHome size={20} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <FaHome className="sidebar-icon" />
              {!isCollapsed && 'Inicio'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/turnos"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <FaCalendarAlt className="sidebar-icon" />
              {!isCollapsed && 'Turnos'}
            </NavLink>
          </li>

          {userRole === 'administrador' && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <FaUsers className="sidebar-icon" />
                {!isCollapsed && 'Usuarios'}
              </NavLink>
            </li>
          )}

          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <CgProfile className="sidebar-icon" />
              {!isCollapsed && 'Perfil'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/bicycles"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <GrBike className="sidebar-icon" />
              {!isCollapsed && 'Bicicletas'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <FaFileAlt className="sidebar-icon" />
              {!isCollapsed && 'Reportes'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/history"
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <FaClock className="sidebar-icon" />
              {!isCollapsed && 'Historial'}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-logout"
        >
          <FaSignOutAlt className="sidebar-logout-icon" />
          {!isCollapsed && 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;