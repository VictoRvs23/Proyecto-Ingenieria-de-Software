import React, { useState, useEffect } from 'react';
import { getAllBicicleteros } from '../services/bicicletero.service';
import '../styles/informes.css';

const Informes = () => {
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
    console.log(`Generando informe para Bicicletero ${numero}`);
    // Aquí puedes agregar la lógica para generar el informe
    alert(`Generando informe del Bicicletero ${numero}`);
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
