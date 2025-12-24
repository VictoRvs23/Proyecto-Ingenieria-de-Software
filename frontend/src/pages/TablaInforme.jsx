import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/tablaInforme.css';

const TablaInforme = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInformes();
  }, [id]);

  const loadInformes = async () => {
    try {
      const informesEjemplo = [
        { id: 1, fecha: '2025-12-20', link: 'https://ejemplo.com/informe1', observacion: 'Todo en orden' },
        { id: 2, fecha: '2025-12-21', link: 'https://ejemplo.com/informe2', observacion: 'Mantenimiento realizado' },
        { id: 3, fecha: '2025-12-22', link: 'https://ejemplo.com/informe3', observacion: 'Sin novedades' },
      ];
      
      setInformes(informesEjemplo);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar informes:', error);
      setLoading(false);
    }
  };

  return (
    <div className="tabla-informe-container">
      <button className="back-button" onClick={() => navigate('/home/informes')}>
        <FaArrowLeft />
      </button>
      
      <h1 className="tabla-informe-title">INFORME (BICICLETERO {id})</h1>

      {loading ? (
        <div className="loading-message">Cargando informes...</div>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla-informe">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>LINK</th>
                <th>OBSERVACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {informes.length > 0 ? (
                informes.map((informe) => (
                  <tr key={informe.id}>
                    <td>{informe.fecha}</td>
                    <td>
                      <a href={informe.link} target="_blank" rel="noopener noreferrer">
                        {informe.link}
                      </a>
                    </td>
                    <td>{informe.observacion}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No hay informes disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaInforme;
