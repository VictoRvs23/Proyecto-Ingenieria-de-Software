import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaFileAlt, FaClock, FaSignOutAlt } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { GrBike } from "react-icons/gr"; 

const Sidebar = ({ userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-300 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-lg font-bold text-blue-800">Menú</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          {isCollapsed ? (
            <FaHome size={20} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      
      <nav className="px-4 py-2">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                }`
              }
            >
              <FaHome className="icon mr-3" size={20} />
              {!isCollapsed && 'Inicio'}
            </NavLink>
          </li>

          {userRole === 'administrador' && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                  }`
                }
              >
                <FaUsers className="icon mr-3" size={20} />
                {!isCollapsed && 'Usuarios'}
              </NavLink>
            </li>
          )}

          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                }`
              }
            >
              <CgProfile className="icon mr-3" size={20} />
              {!isCollapsed && 'Perfil'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/bicycles"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                }`
              }
            >
              <GrBike className="icon mr-3" size={20} />
              {!isCollapsed && 'Bicicletas'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                }`
              }
            >
              <FaFileAlt className="icon mr-3" size={20} />
              {!isCollapsed && 'Reportes'}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-800'
                }`
              }
            >
              <FaClock className="icon mr-3" size={20} />
              {!isCollapsed && 'Historial'}
            </NavLink>
          </li>
        </ul>
      </nav>

      
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
        >
          <FaSignOutAlt className="mr-2" size={20} />
          {!isCollapsed && 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
