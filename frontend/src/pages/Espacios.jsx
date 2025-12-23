import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBicycle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { getBicicleteroById } from '../services/bicicletero.service';
import '../styles/espacios.css';

const Espacios = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.log('📍 Bicicletero cargado:', bicicletero);
      
      const espaciosArray = Array.from({ length: bicicletero.space || 15 }, (_, i) => {
        const numeroEspacio = i + 1;
        const bikeEnEspacio = bicicletero.bikes?.find(bike => bike.space === numeroEspacio);
        
        return {
          numero: numeroEspacio,
          estado: bikeEnEspacio ? 'ocupado' : 'disponible',
          bike: bikeEnEspacio
        };
      });
      
      console.log('📍 Espacios generados:', espaciosArray);
      setEspacios(espaciosArray);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error al cargar espacios:', error);
      const espaciosDefault = Array.from({ length: 15 }, (_, i) => ({
        numero: i + 1,
        estado: 'disponible',
        bike: null
      }));
      
      setEspacios(espaciosDefault);
      setLoading(false);
    }
  };

  return (
    <div className="espacios-container">
      <div className="espacios-header">
        <button className="back-button" onClick={() => navigate('/home/bicicletero')}>
          <FaArrowLeft />
        </button>
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
        </div>
      )}
    </div>
  );
};

export default Espacios;