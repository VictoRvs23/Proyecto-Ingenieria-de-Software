import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaBicycle, FaClock, FaCheckCircle, FaArrowLeft, FaExclamationTriangle, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getReserves, deleteReserve } from '../services/reserve.service.js';
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import Swal from 'sweetalert2';
import '../styles/userReserves.css';

const UserReserves = () => {
  const navigate = useNavigate();
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReserves();
  }, []);

  const loadReserves = async () => {
    try {
      const response = await getReserves();
      const reservesData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response) ? response : [];
      setReserves(reservesData);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      showErrorAlert('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReserve = async (token, estado) => {
    if (estado !== 'solicitada') {
      showErrorAlert('Solo puedes cancelar reservas en estado "solicitada"');
      return;
    }

    const { value: confirm } = await Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Esta acción liberará tu espacio y no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener'
    });

    if (confirm) {
      try {
        await deleteReserve(token);
        showSuccessAlert('Reserva cancelada exitosamente');
        await loadReserves();
      } catch (error) {
        showErrorAlert('Error al cancelar la reserva: ' + error.message);
      }
    }
  };

  const handleShowToken = (token) => {
    Swal.fire({
      title: 'Tu Token de Retiro',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="background: #2b74ad; color: white; padding: 30px; border-radius: 10px; font-size: 48px; font-weight: bold; letter-spacing: 10px;">
            ${token}
          </div>
          <p style="margin-top: 20px; color: #666;">
            Presenta este token al guardia para ingresar/retirar tu bicicleta
          </p>
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  };

  const getStatusIcon = (estado) => {
    switch(estado) {
      case 'solicitada': 
        return <FaClock className="status-icon solicitada" title="Reserva solicitada" />;
      case 'ingresada': 
        return <FaBicycle className="status-icon ingresada" title="Bicicleta ingresada" />;
      case 'entregada': 
        return <FaCheckCircle className="status-icon entregada" title="Bicicleta entregada" />;
      case 'cancelada': 
        return <FaTimes className="status-icon cancelada" title="Reserva cancelada" />;
      default: 
        return null;
    }
  };

  const getStatusText = (estado) => {
    switch(estado) {
      case 'solicitada': return 'Solicitada';
      case 'ingresada': return 'Ingresada';
      case 'entregada': return 'Entregada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'solicitada': return '#FFA500';
      case 'ingresada': return '#FF6B6B';
      case 'entregada': return '#28a745';
      case 'cancelada': return '#6c757d';
      default: return '#1565C0';
    }
  };

  return (
    <div className="user-reserves-container">
      <button className="btn-back" onClick={() => navigate('/home')}>
              <FaArrowLeft />
      </button>
      
      <h1 className="reserves-title">MIS RESERVAS</h1>

      {loading ? (
        <div className="loading-message">Cargando reservas...</div>
      ) : reserves.length === 0 ? (
        <div className="no-reserves">
          <p>No tienes reservas activas</p>
          <button className="btn-go-to-bicicletero" onClick={() => navigate('/home/bicicletero')}>
            Ir a Bicicleteros
          </button>
        </div>
      ) : (
        <>
          <div className="reserves-info">
            <FaExclamationTriangle /> 
            <div>
              <strong>Instrucciones:</strong>
              <ul>
                <li>Solo puedes cancelar reservas en estado <strong>"Solicitada"</strong></li>
                <li>Para reservas "Ingresada", contacta al guardia para retirar tu bicicleta</li>
                <li>Guarda tu token para presentarlo al guardia</li>
              </ul>
            </div>
          </div>
          
          <div className="reserves-grid">
            {reserves.map(reserve => (
              <div key={reserve.token} className="reserve-card">
                <div className="reserve-header" style={{ borderLeft: `5px solid ${getStatusColor(reserve.estado)}` }}>
                  <div className="reserve-token">
                    <span className="token-label">TOKEN:</span>
                    <span className="token-value">{reserve.token}</span>
                  </div>
                  <div className="reserve-status">
                    {getStatusIcon(reserve.estado)}
                    <span className="status-text">{getStatusText(reserve.estado)}</span>
                  </div>
                </div>
                
                <div className="reserve-details">
                  <div className="detail-row">
                    <span className="detail-label">Bicicletero:</span>
                    <span className="detail-value">#{reserve.bicicletero_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Espacio:</span>
                    <span className="detail-value">{reserve.space || 'No asignado'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bicicleta:</span>
                    <span className="detail-value">
                      {reserve.bike?.brand || 'N/A'} {reserve.bike?.model || ''}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha creación:</span>
                    <span className="detail-value">
                      {new Date(reserve.created_at).toLocaleDateString()} {new Date(reserve.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {reserve.last_status_change && (
                    <div className="detail-row">
                      <span className="detail-label">Último cambio:</span>
                      <span className="detail-value">
                        {new Date(reserve.last_status_change).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {reserve.nota && (
                    <div className="detail-row">
                      <span className="detail-label">Nota:</span>
                      <span className="detail-value nota">{reserve.nota}</span>
                    </div>
                  )}
                </div>

                <div className="reserve-actions">
                  <button 
                    className="btn-show-token"
                    onClick={() => handleShowToken(reserve.token)}
                  >
                    <FaKey /> Ver Token
                  </button>
                  
                  {reserve.estado === 'solicitada' && (
                    <button 
                      className="btn-cancel-reserve"
                      onClick={() => handleCancelReserve(reserve.token, reserve.estado)}
                    >
                      <FaTimes /> Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserReserves;