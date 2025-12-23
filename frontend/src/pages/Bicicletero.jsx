import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bicicletero.css';

const Bicicletero = () => {
  const navigate = useNavigate();
  const [bicicleteros, setBicicleteros] = useState([]);

  useEffect(() => {
    const dataBicicleteros = [
      { numero: 1, espaciosOcupados: 5, espaciosTotales: 15 },
      { numero: 2, espaciosOcupados: 9, espaciosTotales: 15 },
      { numero: 3, espaciosOcupados: 1, espaciosTotales: 15 },
      { numero: 4, espaciosOcupados: 15, espaciosTotales: 15 } 
    ];
    setBicicleteros(dataBicicleteros);
  }, []);

  const handleBicicleteroClick = (numero) => {
    console.log(`Navegando a bicicletero ${numero}`);
  };

  return (
    <div className="bicicleteros-container">
      <h1 className="bicicleteros-title">BICICLETEROS</h1>

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
    </div>
  );
};

export default Bicicletero;