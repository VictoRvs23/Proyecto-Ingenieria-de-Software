import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
<<<<<<< HEAD
import Swal from 'sweetalert2';
import { getBicicleteroById, toggleSpaceStatus } from '../services/bicicletero.service';
import { getBikes } from '../services/bike.service';
import { createReserve, getReserves } from '../services/reserve.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
=======
import { getBicicleteroById } from '../services/bicicletero.service';
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)
import '../styles/espacios.css';

const Espacios = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [hasActiveReserve, setHasActiveReserve] = useState(false);
=======
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)

  useEffect(() => {
    loadEspacios();
    const interval = setInterval(() => {
      loadEspacios();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadEspacios = async () => {
    try {
      const bicicletero = await getBicicleteroById(id);
      
      const espaciosArray = Array.from({ length: bicicletero.space || 15 }, (_, i) => {
        const numeroEspacio = i + 1;
        const bikeEnEspacio = bicicletero.bikes?.find(bike => bike.space === numeroEspacio);
        
        let estado = 'disponible';
        const hasReserve = bikeEnEspacio ? true : false;
        
        if (bikeEnEspacio || isMarkedOccupied) {
          estado = 'ocupado';
        }
        
        return {
          numero: numeroEspacio,
<<<<<<< HEAD
          estado,
          bike: bikeEnEspacio,
          markedOccupied: isMarkedOccupied,
          hasReserve
=======
          estado: bikeEnEspacio ? 'ocupado' : 'disponible',
          bike: bikeEnEspacio
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)
        };
      });
      
      setEspacios(espaciosArray);
      setLoading(false);
      
      if (userRole === 'user') {
        try {
          const misReservas = await getReserves();
          const tieneReserva = misReservas.data?.some(r => 
            r.bicicletero_number === parseInt(id) && 
            (r.estado === 'solicitada' || r.estado === 'ingresada')
          );
          setHasActiveReserve(tieneReserva || false);
        } catch {
          setHasActiveReserve(false);
        }
      }
    } catch (error) {
      const espaciosDefault = Array.from({ length: 15 }, (_, i) => ({
        numero: i + 1,
        estado: 'disponible',
<<<<<<< HEAD
        bike: null,
        markedOccupied: false,
        hasReserve: false
=======
        bike: null
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)
      }));
      
      setEspacios(espaciosDefault);
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleSpaceClick = async (espacio) => {
    const canModify = ['guard', 'admin', 'adminbicicletero'].includes(userRole);
    
    if (canModify) {
      setSelectedSpace(espacio);
    } else if (userRole === 'user' && espacio.estado === 'disponible') {
      await handleUserReserve(espacio);
    }
  };

  const handleUserReserve = async (espacio) => {
    try {
      const response = await getBikes();
      const misBicis = response.data || [];

      if (misBicis.length === 0) {
        showErrorAlert('No tienes bicicletas registradas. Regístralas en tu perfil primero.');
        return;
      }

      const bikeOptions = misBicis.map(bike => 
        `<option value="${bike.id}">${bike.brand} - ${bike.model} (${bike.color})</option>`
      ).join('');

      const { value: bikeId } = await Swal.fire({
        title: `Reservar Espacio ${espacio.numero}`,
        html: `
          <div style="text-align: left;">
            <label for="bike-select" style="display: block; margin-bottom: 8px; font-weight: bold;">
              Selecciona tu bicicleta:
            </label>
            <select id="bike-select" class="swal2-select" style="width: 100%; padding: 8px;">
              <option value="">Selecciona una bicicleta...</option>
              ${bikeOptions}
            </select>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Reserva',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2b74ad',
        preConfirm: () => {
          const select = document.getElementById('bike-select');
          if (!select.value) {
            Swal.showValidationMessage('Debes seleccionar una bicicleta');
            return false;
          }
          return select.value;
        }
      });

      if (bikeId) {
        const misReservas = await getReserves();
        const reservaExistente = misReservas.data?.find(r => 
          r.bicicletero_number === parseInt(id) && 
          (r.estado === 'solicitada' || r.estado === 'ingresada')
        );

        if (reservaExistente) {
          await Swal.fire({
            title: 'Ya tienes una reserva activa',
            html: `
              <div style="text-align: center; padding: 20px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Tu token es:</p>
                <div style="background: #2b74ad; color: white; padding: 30px; border-radius: 10px; font-size: 48px; font-weight: bold; letter-spacing: 10px;">
                  ${reservaExistente.token}
                </div>
                <p style="margin-top: 20px; color: #666;">
                  Estado: <strong>${reservaExistente.estado}</strong>
                </p>
              </div>
            `,
            icon: 'info',
            confirmButtonColor: '#2b74ad'
          });
          return;
        }

        const reservaData = {
          bike_id: parseInt(bikeId),
          bicicletero_number: parseInt(id)
        };
        
        const result = await createReserve(reservaData);
        
        setTimeout(() => {
          loadEspacios();
        }, 300);
        
        showSuccessAlert(`Reserva creada exitosamente. Tu token es: ${result.data?.token || result.token}`);
      }
    } catch (error) {
      showErrorAlert(error.message || 'Error al crear la reserva');
    }
  };

  const handleToggleSpace = async (markOccupied) => {
    if (!selectedSpace) return;
    
    try {
      await toggleSpaceStatus(id, selectedSpace.numero, markOccupied);
      await loadEspacios();
      setSelectedSpace(null);
      showSuccessAlert(markOccupied ? 'Espacio marcado como ocupado' : 'Espacio liberado');
    } catch (error) {
      showErrorAlert(error.message || 'Error al cambiar estado del espacio');
    }
  };

  const handleLiberarEspacio = async () => {
    if (!selectedSpace) return;
    try {
      if (selectedSpace.hasReserve && selectedSpace.bike && selectedSpace.bike.id) {
        const reservas = await getReserves();
        const reserva = reservas.data?.find(r =>
          r.bicicletero_number === parseInt(id) &&
          r.bike_id === selectedSpace.bike.id &&
          (r.estado === 'solicitada' || r.estado === 'ingresada')
        );
        if (reserva) {
          // Eliminar la reserva
          await fetch(`/api/reserve/${reserva.token}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            }
          });
        }
      }
      await toggleSpaceStatus(id, selectedSpace.numero, false);
      await loadEspacios();
      setSelectedSpace(null);
      showSuccessAlert('Espacio liberado');
    } catch (error) {
      showErrorAlert(error.message || 'Error al liberar el espacio');
    }
  };

  const handleMostrarToken = async () => {
    try {
      const misReservas = await getReserves();
      const reservaActiva = misReservas.data?.find(r => 
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
                Bicicleta: ${reservaActiva.bike?.brand || 'N/A'} ${reservaActiva.bike?.model || ''}
              </p>
              <p style="color: #666;">
                Estado: <strong>${reservaActiva.estado}</strong>
              </p>
            </div>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#2b74ad',
          width: 600
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

=======
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)
  return (
    <div className="espacios-container">
      <button className="back-button" onClick={() => navigate('/home/bicicletero')}>
        <FaArrowLeft />
      </button>
      
      <div className="espacios-header">
        <h1 className="espacios-title">BICICLETERO ({id})</h1>
      </div>

      {loading ? (
        <div className="loading-message">Cargando espacios...</div>
      ) : (
        <div className="espacios-card">
          <div className="espacios-grid">
            {espacios.map((espacio) => (
              <div
                key={espacio.numero}
                className={`espacio-item ${espacio.estado}`}
              >
                <span className="espacio-numero">{espacio.numero}</span>
                {espacio.estado === 'ocupado' && (
                  <FaBicycle className="espacio-bike-icon" />
                )}
              </div>
            ))}
          </div>
<<<<<<< HEAD
                    {['guard', 'admin', 'adminBicicletero'].includes(userRole) && selectedSpace && (
            <div className="space-actions">
              {selectedSpace.estado === 'ocupado' ? (
                <button className="action-button enable-button" onClick={handleLiberarEspacio}>
                  Liberar Espacio {selectedSpace.numero}
                </button>
              ) : selectedSpace.estado === 'disponible' ? (
                <button className="action-button disable-button" onClick={() => handleToggleSpace(true)}>
                  Marcar como Ocupado {selectedSpace.numero}
                </button>
              ) : null}
              <button className="action-button cancel-button" onClick={() => setSelectedSpace(null)}>
                Cancelar
              </button>
            </div>
          )}


          {userRole === 'user' && hasActiveReserve && (
            <div className="usuarios-actions">
              <button className="btn-action btn-retirar" onClick={handleMostrarToken}>
                Obtener Token
              </button>
            </div>
          )}
        </>
=======
        </div>
>>>>>>> parent of a293cad (Agregado de Botones en modulo Bicicletero)
      )}
    </div>
  );
};

export default Espacios;