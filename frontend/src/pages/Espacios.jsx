import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { getBicicleteroById, toggleSpaceStatus } from '../services/bicicletero.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/espacios.css';

const Espacios = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = (localStorage.getItem('role') || sessionStorage.getItem('role') || '').toLowerCase();
    setUserRole(role);
    loadEspacios();
    const interval = setInterval(() => {
      loadEspacios();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadEspacios = async () => {
    try {
      const bicicletero = await getBicicleteroById(id);
      const disabledSpaces = bicicletero.disabledSpaces || [];
      
      const espaciosArray = Array.from({ length: bicicletero.space || 15 }, (_, i) => {
        const numeroEspacio = i + 1;
        const bikeEnEspacio = bicicletero.bikes?.find(bike => bike.space === numeroEspacio);
        const isMarkedOccupied = disabledSpaces.includes(numeroEspacio) || disabledSpaces.includes(String(numeroEspacio));
        
        return {
          numero: numeroEspacio,
          estado: (bikeEnEspacio || isMarkedOccupied) ? 'ocupado' : 'disponible',
          bike: bikeEnEspacio,
          markedOccupied: isMarkedOccupied
        };
      });
      
      setEspacios(espaciosArray);
      setLoading(false);
    } catch (error) {
      const espaciosDefault = Array.from({ length: 15 }, (_, i) => ({
        numero: i + 1,
        estado: 'disponible',
        bike: null,
        markedOccupied: false
      }));
      
      setEspacios(espaciosDefault);
      setLoading(false);
    }
  };

  const handleSpaceClick = (espacio) => {
    const canModify = ['guard', 'admin', 'adminBicicletero'].includes(userRole);
    if (canModify) {
      setSelectedSpace(espacio);
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
        <>
          <div className="espacios-card">
            <div className="espacios-grid">
              {espacios.map((espacio) => (
                <div
                  key={espacio.numero}
                  className={`espacio-item ${espacio.estado} ${selectedSpace?.numero === espacio.numero ? 'selected' : ''}`}
                  onClick={() => handleSpaceClick(espacio)}
                >
                  <span className="espacio-numero">{espacio.numero}</span>
                  {espacio.estado === 'ocupado' && (
                    <FaBicycle className="espacio-bike-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {['guard', 'admin', 'adminBicicletero'].includes(userRole) && selectedSpace && (
            <div className="space-actions">
              {selectedSpace.estado === 'ocupado' && selectedSpace.markedOccupied ? (
                <button className="action-button enable-button" onClick={() => handleToggleSpace(false)}>
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
        </>
      )}
    </div>
  );
};

export default Espacios;