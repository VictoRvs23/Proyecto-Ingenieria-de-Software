import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBicicleteros } from '../services/bicicletero.service';
import '../styles/bicicletero.css';

const Bicicletero = () => {
  const navigate = useNavigate();
  const [bicicleteros, setBicicleteros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBicicleteros();
    
    const interval = setInterval(() => {
      loadBicicleteros();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadBicicleteros = async () => {
    try {
      const data = await getAllBicicleteros();
      setBicicleteros(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar bicicleteros:', error);
      setLoading(false);
    }
  };

  const handleBicicleteroClick = (numero) => {
    navigate(`/home/bicicletero/${numero}`);
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
    </div>
  );
};

export default Bicicletero;