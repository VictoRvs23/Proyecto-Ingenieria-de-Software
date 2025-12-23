import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/bicicletero.css';

const Bicicletero = () => {
  const navigate = useNavigate();
  const [espacios, setEspacios] = useState([]);

  useEffect(() => {
    const dataSimulada = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      numero: i + 1,
      estado: i % 3 === 0 ? 'ocupado' : 'disponible'
    }));
    setEspacios(dataSimulada);
  }, []);

  return (
    <div className="bicicletero-container">
      <div className="bicicletero-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft />
        </button>
        <h1 className="bicicletero-title">BICICLETERO 1</h1>
      </div>
      <div className="espacios-grid">
        {espacios.map((espacio) => (
          <div key={espacio.id} className="espacio-card">
            <div className="espacio-numero-badge">
              ESPACIO # {espacio.numero}
            </div>
            
            <div className="espacio-icon-container">
              <FaBicycle className={`bike-icon ${espacio.estado}`} />
            </div>

            <div className="espacio-footer">
              <span className={`status-label disponible ${espacio.estado === 'disponible' ? 'active' : ''}`}>
                Disponible
              </span>
              <span className={`status-label ocupado ${espacio.estado === 'ocupado' ? 'active' : ''}`}>
                Ocupado
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bicicletero;