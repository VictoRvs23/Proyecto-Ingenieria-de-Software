import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle, FaKey, FaPlus, FaEye, FaSpinner } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getBicicleteroById, toggleSpaceStatus } from '../services/bicicletero.service';
import { getBikes } from '../services/bike.service';
import { createReserve, getReserves, updateReserve, getReserveByToken } from '../services/reserve.service';
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
      console.log('Bicicletas obtenidas:', response);
      
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
      console.log('Reservas obtenidas:', response); 
      
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
      const espaciosArray = Array.from({ length: bicicletero.space || 15 }, (_, i) => {
        const numeroEspacio = i + 1;
        const bikeEnEspacio = bicicletero.bikes?.find(bike => bike.space === numeroEspacio);
        const isMarkedOccupied = disabledSpaces.includes(numeroEspacio) || disabledSpaces.includes(String(numeroEspacio));
        
        let estado = 'disponible';
        if (bikeEnEspacio || isMarkedOccupied) {
          estado = 'ocupado';
        }
        
        return {
          numero: numeroEspacio,
          estado,
          bike: bikeEnEspacio,
          markedOccupied: isMarkedOccupied,
          hasReserve: !!bikeEnEspacio
        };
      });
      setEspacios(espaciosArray);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando espacios:', error);
      const espaciosDefault = Array.from({ length: 15 }, (_, i) => ({
        numero: i + 1,
        estado: 'disponible',
        bike: null,
        markedOccupied: false,
        hasReserve: false
      }));
      setEspacios(espaciosDefault);
      setLoading(false);
    }
  };

  const handleSpaceClick = async (espacio) => {
    const isStaff = ["admin","adminBicicletero", "guard"].includes(userRole);
    
    if (isStaff) {
      await handleStaffSpaceAction(espacio);
    } else if (userRole === 'user' && espacio.estado === 'disponible') {
      if (userBikes.length === 0) {
        showErrorAlert('No tienes bicicletas registradas. Regístra una bicicleta en tu perfil primero.');
        return;
      }
      setSelectedSpace(espacio);
      setShowReserveModal(true);
    }
  };

  const handleStaffSpaceAction = async (espacio) => {
    setSelectedSpace(espacio);
    
    if (espacio.estado === 'ocupado') {
      await handleLiberarEspacioStaff(espacio);
    } else if (espacio.estado === 'disponible') {
      await handleOcuparEspacioStaff(espacio);
    }
  };

  const handleOcuparEspacioStaff = async (espacio) => {
    const { value: token } = await Swal.fire({
      title: `Marcar Espacio ${espacio.numero} como Ocupado`,
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
      confirmButtonText: 'Confirmar',
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

        const reserva = await getReserveByToken(token);
        
        await updateReserve(token, {
          estado: 'ingresada',
          nota: `Bicicleta ingresada en espacio ${espacio.numero}`
        });

        await toggleSpaceStatus(id, espacio.numero, true);
        await loadEspacios();
        showSuccessAlert(`Espacio ${espacio.numero} ocupado. Reserva ${token} actualizada a "ingresada"`);

      } catch (error) {
        showErrorAlert(error.message || `No se encontró reserva con token ${token}`);
      }
    }
    setSelectedSpace(null);
  };

  const handleLiberarEspacioStaff = async (espacio) => {
    const { value: token } = await Swal.fire({
      title: `Liberar Espacio ${espacio.numero}`,
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

        const reserva = await getReserveByToken(token);
        
        await updateReserve(token, {
          estado: 'entregada',
          nota: `Bicicleta retirada del espacio ${espacio.numero}`
        });
        
        await toggleSpaceStatus(id, espacio.numero, false);
        await loadEspacios();
        showSuccessAlert(`Espacio ${espacio.numero} liberado. Reserva ${token} actualizada a "entregada"`);

      } catch (error) {
        showErrorAlert(error.message || `No se encontró reserva con token ${token}`);
      }
    }
    setSelectedSpace(null);
  };

  const handleCreateReserve = async () => {
    if (!selectedBike) {
      showErrorAlert('Selecciona una bicicleta para reservar');
      return;
    }

    if (!selectedSpace) {
      showErrorAlert('Selecciona un espacio primero');
      return;
    }

    try {
      const reservaData = {
        bike_id: parseInt(selectedBike),
        bicicletero_number: parseInt(id)
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
            <p style="margin-top: 20px; color: #666;">
              Espacio: <strong>${selectedSpace.numero}</strong>
            </p>
            <p style="color: #666; font-style: italic;">
              Presenta este token al guardia para ingresar/retirar tu bicicleta
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
      showErrorAlert(error.message || 'Error al crear la reserva');
    }
  };

  const handleShowUserTokens = async () => {
    try {
      await loadUserReserves();
      
      if (userReserves.length === 0) {
        showErrorAlert('No tienes reservas activas');
        return;
      }

      const reservesHtml = userReserves.map(reserve => `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; text-align: left;">
          <div style="font-size: 20px; font-weight: bold; color: #2b74ad; margin-bottom: 5px;">
            Token: ${reserve.token}
          </div>
          <div style="margin-bottom: 5px;">
            <strong>Estado:</strong> ${reserve.estado}
          </div>
          <div style="margin-bottom: 5px;">
            <strong>Bicicletero:</strong> ${reserve.bicicletero_number}
          </div>
          <div style="margin-bottom: 5px;">
            <strong>Bicicleta:</strong> ${reserve.bike?.brand || 'N/A'} ${reserve.bike?.model || ''}
          </div>
          <div style="margin-bottom: 5px;">
            <strong>Fecha:</strong> ${new Date(reserve.created_at).toLocaleDateString()}
          </div>
        </div>
      `).join('');

      await Swal.fire({
        title: 'Tus Reservas',
        html: `
          <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
            ${reservesHtml}
          </div>
        `,
        width: 600,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2b74ad'
      });

    } catch (error) {
      showErrorAlert('Error al cargar tus reservas');
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

  const activeReserveInThisBicicletero = userReserves.some(r => 
    r.bicicletero_number === parseInt(id) && 
    (r.estado === 'solicitada' || r.estado === 'ingresada')
  );

  return (
    <div className="espacios-container">
      <button className="back-button" onClick={() => navigate('/home/bicicletero')}>
        <FaArrowLeft />
      </button>
      
      <div className="espacios-header">
        <h1 className="espacios-title">BICICLETERO #{id}</h1>
        
        {/* Botones para usuarios */}
        {userRole === 'user' && (
          <div className="user-actions-header">
            <button 
              className="btn-action btn-show-tokens" 
              onClick={handleShowUserTokens}
            >
              <FaEye /> Ver Mis Tokens
            </button>
            
            {activeReserveInThisBicicletero && (
              <button 
                className="btn-action btn-show-token" 
                onClick={handleShowTokenForSpace}
              >
                <FaKey /> Mostrar Token
              </button>
            )}
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
                  className={`espacio-item ${espacio.estado} ${
                    selectedSpace?.numero === espacio.numero ? 'selected' : ''
                  }`}
                  onClick={() => handleSpaceClick(espacio)}
                  title={
                    userRole === 'user' && espacio.estado === 'disponible' 
                      ? 'Haz clic para reservar este espacio' 
                      : espacio.estado === 'ocupado' 
                      ? 'Ocupado' 
                      : 'Disponible'
                  }
                >
                  <span className="espacio-numero">{espacio.numero}</span>
                  {espacio.estado === 'ocupado' && (
                    <FaBicycle className="espacio-bike-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal para crear reserva (usuarios) */}
          {showReserveModal && userRole === 'user' && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Reservar Espacio {selectedSpace?.numero}</h3>
                
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
                    <FaPlus /> Confirmar Reserva
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

          {/* Instrucciones */}
          <div className="instructions">
            {userRole === 'user' ? (
              <p className="user-instruction">
                <strong>Instrucciones:</strong> Haz clic en un espacio disponible para reservarlo. 
                Luego selecciona tu bicicleta y confirma la reserva. Guarda tu token para retirar la bicicleta.
              </p>
            ) : ['guard', 'admin', 'adminbicicletero'].includes(userRole) ? (
              <p className="staff-instruction">
                <strong>Instrucciones:</strong> Haz clic en un espacio disponible para ingresar una bicicleta 
                (necesitarás el token). Haz clic en un espacio ocupado para liberarlo (necesitarás el token).
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default Espacios;