import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBicicleteros } from '../services/bicicletero.service';
import { getBikes } from '../services/bike.service';
import '../styles/bicicletero.css';

const Bicicletero = () => {
  const navigate = useNavigate();
  const [bicicleteros, setBicicleteros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasReservedSpace, setHasReservedSpace] = useState(false);

  useEffect(() => {
    loadBicicleteros();
    checkUserBikes();
    
    const interval = setInterval(() => {
      loadBicicleteros();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkUserBikes = async () => {
    try {
      const response = await getBikes();
      if (response.status === 'success' && response.data && response.data.length > 0) {
        const bikesWithSpace = response.data.filter(bike => bike.space);
        setHasReservedSpace(bikesWithSpace.length > 0);
      } else {
        setHasReservedSpace(false);
      }
    } catch (error) {
      setHasReservedSpace(false);
    }
  };

  const loadBicicleteros = async () => {
    try {
      const data = await getAllBicicleteros();
      data.sort((a, b) => a.numero - b.numero);
      setBicicleteros(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleBicicleteroClick = (numero) => {
    navigate(`/home/bicicletero/${numero}`);
  };

  const handleSolicitarToken = () => {
    alert('Funcionalidad de solicitar token');
  };

  return (
    <div className="bicicleteros-container">
      <h1 className="bicicleteros-title">BICICLETEROS</h1>

      {loading ? (
        <div className="loading-message">Cargando bicicleteros...</div>
      ) : (
        <div className="bicicleteros-grid">
          {bicicleteros.map((bici) => {
            const estaLleno = bici.espaciosOcupados >= bici.espaciosTotales;
          
          return (
            <div 
              key={bici.numero} 
              className="bicicletero-card"
            >
              <button 
                className="bicicletero-header-card"
                onClick={() => handleBicicleteroClick(bici.numero)}
              >
                BICICLETERO {bici.numero}
              </button>
              
              <div className="bicicletero-status">
                {estaLleno ? (
                  <span className="status-badge lleno">Lleno</span>
                ) : (
                  <span className="status-badge disponible">
                    {bici.espaciosOcupados}/{bici.espaciosTotales}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
      
      {hasReservedSpace && (
        <button className="solicitar-token-btn" onClick={handleSolicitarToken}>
          Obtener Token
        </button>
      )}
    </div>
  );
};

export default Bicicletero;