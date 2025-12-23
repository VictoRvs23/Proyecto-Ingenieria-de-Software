import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBicicleteros } from '../services/bicicletero.service';
import '../styles/informes.css';

const Informes = () => {
  const navigate = useNavigate();
  const [bicicleteros, setBicicleteros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBicicleteros();
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

  const handleGenerarInforme = (numero) => {
    console.log(`Navegando al informe del Bicicletero ${numero}`);
    navigate(`/home/informes/${numero}`);
  };

  return (
    <div className="bicicleteros-container">
      <h1 className="bicicleteros-title">INFORMES</h1>

      {loading ? (
        <div className="loading-message">Cargando bicicleteros...</div>
      ) : (
        <div className="bicicleteros-grid">
          {bicicleteros.map((bici) => {
            return (
              <div 
                key={bici.numero} 
                className="bicicletero-card"
              >
                <button 
                  className="bicicletero-header-card"
                  onClick={() => handleGenerarInforme(bici.numero)}
                >
                  BICICLETERO {bici.numero}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Informes;
