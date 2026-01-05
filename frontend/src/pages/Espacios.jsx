import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle, FaKey, FaPlus, FaSpinner, FaClock, FaBan } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getBicicleteroById, toggleSpaceStatus } from '../services/bicicletero.service';
import { getBikes } from '../services/bike.service';
import { createReserve, getReserves, updateReserve, deleteReserve } from '../services/reserve.service';
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert.js";
import '../styles/espacios.css';

const Espacios = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userBikes, setUserBikes] = useState([]);
  const [userReserves, setUserReserves] = useState([]);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState('');

  useEffect(() => {
    const role = (localStorage.getItem('role') || sessionStorage.getItem('role') || '').toLowerCase();
    setUserRole(role);
    loadEspacios();
    
    if (role === 'user') {
      loadUserBikes();
      loadUserReserves();
    }
    
    const interval = setInterval(() => {
      loadEspacios();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadUserBikes = async () => {
    setLoadingBikes(true);
    try {
      const response = await getBikes();
      
      if (response.data) {
        setUserBikes(response.data);
      } else if (Array.isArray(response)) {
        setUserBikes(response);
      } else {
        setUserBikes([]);
      }
    } catch (error) {
      console.error('Error cargando bicicletas:', error);
      showErrorAlert('Error al cargar tus bicicletas');
      setUserBikes([]);
    } finally {
      setLoadingBikes(false);
    }
  };

  const loadUserReserves = async () => {
    try {
      const response = await getReserves();
      
      if (response.data) {
        setUserReserves(response.data);
      } else if (Array.isArray(response)) {
        setUserReserves(response);
      } else {
        setUserReserves([]);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setUserReserves([]);
    }
  };

  const loadEspacios = async () => {
    try {
      const bicicletero = await getBicicleteroById(id);
      const disabledSpaces = bicicletero.disabledSpaces || [];
      const allActiveReserves = bicicletero.activeReserves || [];

      await loadUserReserves();
      
      const espaciosArray = Array.from({ length: bicicletero.space || 15 }, (_, i) => {
        const numeroEspacio = i + 1;
        const isDisabled = disabledSpaces.includes(numeroEspacio) || disabledSpaces.includes(String(numeroEspacio));
        let reservaActivaUsuario = null;
        if (userReserves.length > 0) {
          reservaActivaUsuario = userReserves.find(r => 
            r.bicicletero_number === parseInt(id) &&
            (r.estado === 'solicitada' || r.estado === 'ingresada')
          );
        }
        const reservaOcupante = allActiveReserves.find(r => 
          r.space === numeroEspacio && 
          r.estado === 'ingresada'  
        );
        
        let estado = 'disponible';
        let estadoReserva = null;
        let reservaActiva = null;
        
        if (isDisabled) {
          estado = 'deshabilitado';
        } else if (reservaOcupante) {
          estado = 'ocupado';
          estadoReserva = 'ingresada';
          reservaActiva = reservaOcupante;
        } else if (reservaActivaUsuario && reservaActivaUsuario.space === numeroEspacio) {
          reservaActiva = reservaActivaUsuario;
          estadoReserva = reservaActivaUsuario.estado;
        }
        
        return {
          numero: numeroEspacio,
          estado,
          estadoReserva,
          isDisabled,
          reservaActiva
        };
      });
      
      setEspacios(espaciosArray);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando espacios:', error);
      const espaciosDefault = Array.from({ length: 15 }, (_, i) => ({
        numero: i + 1,
        estado: 'disponible',
        estadoReserva: null,
        isDisabled: false,
        reservaActiva: null
      }));
      setEspacios(espaciosDefault);
      setLoading(false);
    }
  };

  const handleSpaceClick = async (espacio) => {
    if (userRole === 'user') {
      await handleUserClick(espacio);
    } else if (["admin","adminBicicletero", "guard"].includes(userRole)) {
      await handleStaffClick(espacio);
    }
  };

  const handleUserClick = async (espacio) => {

    if (espacio.isDisabled) {
      showErrorAlert('Este espacio está deshabilitado temporalmente');
      return;
    }
    
    if (espacio.reservaActiva) {
      await handleUserReserveAction(espacio);
      return;
    }

    if (espacio.estado === 'ocupado' && espacio.estadoReserva === 'ingresada') {
      showErrorAlert('Este espacio ya está ocupado por una bicicleta');
      return;
    }

    if (espacio.estado === 'disponible') {
      if (userBikes.length === 0) {
        showErrorAlert('No tienes bicicletas registradas. Regístra una bicicleta en tu perfil primero.');
        return;
      }
      
      setSelectedSpace(espacio);
      setShowReserveModal(true);
    }
  };

  const handleUserReserveAction = async (espacio) => {
  const { reservaActiva } = espacio;
  const espacioEstaOcupado = espacio.estado === 'ocupado' && espacio.estadoReserva === 'ingresada';
  
  if (espacioEstaOcupado) {
    await Swal.fire({
      title: `Espacio ${espacio.numero} Ocupado`,
      text: 'Este espacio está ocupado por una bicicleta ingresada.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
    return; 
  }

  const tieneEspacioAsignado = reservaActiva.space !== null && reservaActiva.space !== undefined;
  
  const result = await Swal.fire({
    title: `Tu Reserva`,
    html: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Estado:</strong> ${reservaActiva.estado}</p>
        ${tieneEspacioAsignado ? 
          `<p><strong>Espacio asignado:</strong> ${reservaActiva.space}</p>` : 
          '<p><strong>Espacio:</strong> Aún no asignado</p>'
        }
        <p><strong>Bicicleta:</strong> ${reservaActiva.bike?.brand || 'N/A'} ${reservaActiva.bike?.model || ''}</p>
        <p><strong>Fecha:</strong> ${new Date(reservaActiva.created_at).toLocaleDateString()}</p>
        ${!tieneEspacioAsignado && reservaActiva.estado === 'solicitada' ? 
          '<p style="color: #666; font-style: italic; margin-top: 10px;">Presenta tu token al guardia para que asigne un espacio a tu bicicleta.</p>' : 
          ''
        }
      </div>
    `,
    showCancelButton: true,
    showDenyButton: reservaActiva.estado === 'solicitada',
    confirmButtonText: 'Mostrar Token',
    denyButtonText: 'Cancelar Reserva',
    cancelButtonText: 'Cerrar',
    denyButtonColor: '#d33',
    confirmButtonColor: '#3085d6'
  });
  
  if (result.isConfirmed) {
    await Swal.fire({
      title: 'Tu Token de Retiro',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="background: #2b74ad; color: white; padding: 30px; border-radius: 10px; font-size: 48px; font-weight: bold; letter-spacing: 10px;">
            ${reservaActiva.token}
          </div>
          <p style="margin-top: 20px; color: #666;">
            ${tieneEspacioAsignado ? 
              `Presenta este token al guardia para ${reservaActiva.estado === 'solicitada' ? 'ingresar' : 'retirar'} tu bicicleta` :
              'Presenta este token al guardia para que asigne un espacio a tu bicicleta'
            }
          </p>
        </div>
      `,
      confirmButtonText: 'Entendido'
    });
  } else if (result.isDenied && reservaActiva.estado === 'solicitada') {
    await handleCancelUserReserve(reservaActiva.token);
  }
};

  const handleCancelUserReserve = async (token) => {
    const { value: confirm } = await Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Esta acción no se puede deshacer',
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
        await loadUserReserves();
        await loadEspacios();
      } catch (error) {
        showErrorAlert('Error al cancelar la reserva: ' + error.message);
      }
    }
  };

  const handleCreateReserve = async () => {
    if (!selectedBike) {
      showErrorAlert('Selecciona una bicicleta para reservar');
      return;
    }

    try {
      const reservaData = {
        bike_id: parseInt(selectedBike),
        bicicletero_number: parseInt(id),
      };

      const result = await createReserve(reservaData);
      
      await Swal.fire({
        title: '¡Reserva Creada!',
        html: `
          <div style="text-align: center; padding: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Tu reserva ha sido creada exitosamente.</p>
            <p style="margin-bottom: 15px;">Tu token de retiro es:</p>
            <div style="background: #2b74ad; color: white; padding: 30px; border-radius: 10px; font-size: 48px; font-weight: bold; letter-spacing: 10px;">
              ${result.data?.token || result.token}
            </div>
            <p style="margin-top: 20px; color: #666; font-style: italic;">
              Presenta este token al guardia para que asigne un espacio a tu bicicleta.
              <br/><strong>El espacio se mantendrá disponible hasta que ingreses tu bicicleta.</strong>
            </p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2b74ad',
        width: 600
      });

      setShowReserveModal(false);
      setSelectedBike('');
      setSelectedSpace(null);
      await loadEspacios();
      await loadUserReserves();

    } catch (error) {
      console.error('Error detallado:', error);
      showErrorAlert(error.message || 'Error al crear la reserva');
    }
  };

  const handleStaffClick = async (espacio) => {
    setSelectedSpace(espacio);
    
    if (espacio.estado === 'ocupado') {
      await handleLiberarEspacioStaff(espacio);
    } else if (espacio.estado === 'disponible') {
      await handleOcuparEspacioStaff(espacio);
    } else if (espacio.estado === 'deshabilitado') {
      await handleToggleDisabledSpace(espacio);
    }
  };

  const handleOcuparEspacioStaff = async (espacio) => {
    const { value: token } = await Swal.fire({
      title: `Ingresar Bicicleta en Espacio ${espacio.numero}`,
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">Ingresa el token de la reserva:</p>
          <input 
            type="number" 
            id="token-input" 
            class="swal2-input" 
            placeholder="Ej: 1234"
            min="1000"
            max="9999"
            style="font-size: 24px; text-align: center; letter-spacing: 5px;"
          >
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ingresar Bicicleta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b74ad',
      preConfirm: () => {
        const tokenInput = document.getElementById('token-input');
        const token = tokenInput.value.trim();
        
        if (!token || token.length !== 4 || isNaN(token)) {
          Swal.showValidationMessage('Ingresa un token válido de 4 dígitos');
          return false;
        }
        return token;
      }
    });

    if (token) {
      try {
        await updateReserve(token, {
          estado: 'ingresada',
          space: espacio.numero, 
          nota: `Bicicleta ingresada en espacio ${espacio.numero} por guardia`
        });

        await loadEspacios();
        showSuccessAlert(`Bicicleta ingresada en espacio ${espacio.numero}. Reserva actualizada a "ingresada"`);

      } catch (error) {
        showErrorAlert(error.message || `No se encontró reserva con token ${token}`);
      }
    }
    setSelectedSpace(null);
  };

  const handleLiberarEspacioStaff = async (espacio) => {
    const { value: token } = await Swal.fire({
      title: `Retirar Bicicleta del Espacio ${espacio.numero}`,
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">Ingresa el token de la reserva a retirar:</p>
          <input 
            type="number" 
            id="token-input" 
            class="swal2-input" 
            placeholder="Ej: 1234"
            min="1000"
            max="9999"
            style="font-size: 24px; text-align: center; letter-spacing: 5px;"
          >
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Retiro',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b74ad',
      preConfirm: () => {
        const tokenInput = document.getElementById('token-input');
        const token = tokenInput.value.trim();
        
        if (!token || token.length !== 4 || isNaN(token)) {
          Swal.showValidationMessage('Ingresa un token válido de 4 dígitos');
          return false;
        }
        return token;
      }
    });

    if (token) {
      try {
        await updateReserve(token, {
          estado: 'entregada',
          nota: `Bicicleta retirada del espacio ${espacio.numero} por guardia`
        });
        
        await loadEspacios();
        showSuccessAlert(`Bicicleta retirada. Reserva ${token} actualizada a "entregada"`);

      } catch (error) {
        showErrorAlert(error.message || `No se encontró reserva con token ${token}`);
      }
    }
    setSelectedSpace(null);
  };

  const handleToggleDisabledSpace = async (espacio) => {
    const { value: enable } = await Swal.fire({
      title: `Espacio ${espacio.numero} Deshabilitado`,
      text: '¿Deseas habilitar este espacio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, habilitar',
      cancelButtonText: 'No, mantener deshabilitado'
    });

    if (enable !== undefined) {
      try {
        await toggleSpaceStatus(id, espacio.numero, !enable);
        showSuccessAlert(`Espacio ${espacio.numero} ${enable ? 'habilitado' : 'deshabilitado'}`);
        await loadEspacios();
      } catch (error) {
        showErrorAlert('Error al cambiar estado del espacio');
      }
    }
  };

  const handleShowTokenForSpace = async () => {
    try {
      await loadUserReserves();
      
      const reservaActiva = userReserves.find(r => 
        r.bicicletero_number === parseInt(id) && 
        (r.estado === 'solicitada' || r.estado === 'ingresada')
      );
      
      if (reservaActiva) {
        const tieneEspacioAsignado = reservaActiva.space !== null && reservaActiva.space !== undefined;
        
        await Swal.fire({
          title: 'Tu Token de Retiro',
          html: `
            <div style="text-align: center; padding: 20px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Presenta este token al guardia:</p>
              <div style="background: #2b74ad; color: white; padding: 30px; border-radius: 10px; font-size: 48px; font-weight: bold; letter-spacing: 10px;">
                ${reservaActiva.token}
              </div>
              <p style="margin-top: 20px; color: #666;">
                <strong>Estado:</strong> ${reservaActiva.estado}
              </p>
              ${tieneEspacioAsignado ? 
                `<p style="color: #666;"><strong>Espacio asignado:</strong> ${reservaActiva.space}</p>` :
                '<p style="color: #666;"><strong>Espacio:</strong> Aún no asignado</p>'
              }
              <p style="color: #666;">
                <strong>Bicicleta:</strong> ${reservaActiva.bike?.brand || 'N/A'} ${reservaActiva.bike?.model || ''}
              </p>
            </div>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#2b74ad',
          width: 600
        });
      } else {
        showErrorAlert('No tienes una reserva activa en este bicicletero');
      }
    } catch (error) {
      showErrorAlert('Error al obtener el token');
    }
  };

  const getSpaceIcon = (espacio) => {
    if (espacio.isDisabled) {
      return <FaBan className="espacio-disabled-icon" title="Espacio deshabilitado" />;
    }
    
    if (espacio.estado === 'ocupado') {
      if (espacio.estadoReserva === 'ingresada') {
        return <FaBicycle className="espacio-bike-icon" title="Bicicleta ingresada" />;
      }
      return <FaBicycle className="espacio-bike-icon" title="Ocupado" />;
    }
    
    return null;
  };

  const activeReserveInThisBicicletero = userReserves.some(r => 
    r.bicicletero_number === parseInt(id) && 
    (r.estado === 'solicitada' || r.estado === 'ingresada')
  );

  return (
    <div className="espacios-container">
      <button className="btn-back" onClick={() => navigate('/home/bicicletero')}>
                      <FaArrowLeft />
      </button>
      
      <div className="espacios-header">
        <h1 className="espacios-title">BICICLETERO #{id}</h1>
        {userRole === 'user' && activeReserveInThisBicicletero && (
          <div className="user-actions-header">
            <button 
              className="btn-action btn-show-token" 
              onClick={handleShowTokenForSpace}
            >
              <FaKey /> Mostrar Token
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading-message">
          <FaSpinner className="spinner" /> Cargando espacios...
        </div>
      ) : (
        <>
          <div className="espacios-card">
            <div className="espacios-grid">
              {espacios.map((espacio) => (
                <div
                  key={espacio.numero}
                  className={`espacio-item ${espacio.estado} ${espacio.estadoReserva ? `reserva-${espacio.estadoReserva}` : ''}`}
                  onClick={() => handleSpaceClick(espacio)}
                  title={
                    userRole === 'user' && espacio.estado === 'disponible' 
                      ? 'Haz clic para crear una reserva' 
                      : espacio.estado === 'ocupado' 
                      ? 'Bicicleta ingresada - Espacio ocupado' 
                      : espacio.estado === 'deshabilitado'
                      ? 'Espacio deshabilitado'
                      : 'Disponible'
                  }
                >
                  <span className="espacio-numero">{espacio.numero}</span>
                  {getSpaceIcon(espacio)}
                </div>
              ))}
            </div>
          </div>
          {showReserveModal && userRole === 'user' && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Crear Reserva en Bicicletero #{id}</h3>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                  Recibirás un token para presentar al guardia.<br/>
                  <strong>El espacio físico se asignará cuando ingreses tu bicicleta.</strong>
                </p>
                
                <div className="form-group">
                  <label>Selecciona tu bicicleta:</label>
                  {loadingBikes ? (
                    <div className="loading-bikes">
                      <FaSpinner className="spinner" /> Cargando bicicletas...
                    </div>
                  ) : userBikes.length === 0 ? (
                    <div className="no-bikes">
                      <p>No tienes bicicletas registradas.</p>
                      <button 
                        className="btn-register-bike"
                        onClick={() => navigate('/home/profile')}
                      >
                        Registrar Bicicleta
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={selectedBike}
                      onChange={(e) => setSelectedBike(e.target.value)}
                      className="bike-select"
                    >
                      <option value="">-- Selecciona una bicicleta --</option>
                      {userBikes.map(bike => (
                        <option key={bike.id} value={bike.id}>
                          {bike.brand} {bike.model} ({bike.color})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-confirm" 
                    onClick={handleCreateReserve}
                    disabled={!selectedBike || userBikes.length === 0}
                  >
                    <FaPlus /> Crear Reserva
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={() => {
                      setShowReserveModal(false);
                      setSelectedBike('');
                      setSelectedSpace(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="instructions">
            {userRole === 'user' ? (
              <p className="user-instruction">
                <strong>Instrucciones:</strong> Haz clic en un espacio disponible para crear una reserva. 
                Recibirás un token que debes presentar al guardia. 
                <strong> Los espacios se mantienen disponibles</strong> hasta que el guardia ingrese físicamente tu bicicleta.
              </p>
            ) : ['guard', 'admin', 'adminbicicletero'].includes(userRole) ? (
              <p className="staff-instruction">
                <strong>Instrucciones:</strong> 
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li>Haz clic en un espacio <strong>disponible</strong> para ingresar una bicicleta (necesitarás el token)</li>
                  <li>Haz clic en un espacio <strong>ocupado</strong> para retirar una bicicleta (necesitarás el token)</li>
                  <li>Las reservas "solicitadas" <strong>no ocupan</strong> espacios físicos</li>
                </ul>
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default Espacios;