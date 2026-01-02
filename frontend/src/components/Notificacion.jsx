import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaClipboardList, FaCalendarAlt, FaCommentDots } from 'react-icons/fa';
import axios from '../services/root.service'; 
import '../styles/Notificacion.css'; 

const Notificacion = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotificaciones = async () => {
    try {
      const response = await axios.get('/notificaciones');
      const data = response.data || [];
      setNotificaciones(data);
      setUnreadCount(data.filter(n => !n.leido).length);
    } catch (error) {
      console.error("Error cargando notificaciones");
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleNotificationClick = async (notif) => {

    if (!notif.leido) {
      try {
          await axios.patch(`/notificaciones/${notif.id}/leida`);
          setNotificaciones(prev => 
              prev.map(n => n.id === notif.id ? {...n, leido: true} : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
          console.error(error);
      }
    }

    setIsOpen(false);

    switch(notif.tipo) {
      case 'REPORTE':
        navigate('/home/reportes');
        break;
      case 'TURNO':
        navigate('/home/turnos');
        break;
      case 'CONSULTA':
        navigate('/home/consultas');
        break;
      default:
        break;
    }
  };

  const getIcono = (tipo) => {
    switch(tipo) {
      case 'REPORTE': return <FaClipboardList size={18} color="#d32f2f" />;
      case 'TURNO': return <FaCalendarAlt size={18} color="#1976d2" />;
      case 'CONSULTA': return <FaCommentDots size={18} color="#f57c00" />;
      default: return <FaBell size={18} color="#555" />;
    }
  };

  return (
    <div className="notification-container">
      <div className="bell-circle" onClick={handleToggle}>
        <FaBell size={20} color="#fff" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">Notificaciones</div>
          <div className="dropdown-body">
            {notificaciones.length === 0 ? (
              <div className="no-notif">No tienes notificaciones nuevas</div>
            ) : (
              notificaciones.map(notif => (
                <div 
                    key={notif.id} 
                    className={`notif-item ${!notif.leido ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon">
                    {getIcono(notif.tipo)}
                  </div>
                  <div className="notif-content">
                    <p>{notif.mensaje}</p>
                    <span className="notif-date">
                        {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.leido && <div className="dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificacion;