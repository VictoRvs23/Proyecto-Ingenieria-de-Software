import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFilePdf, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { InformService } from '../services/inform.service';
import '../styles/tablaInforme.css';

const TablaInforme = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInformes();
  }, []);

  const loadInformes = async () => {
    setLoading(true);
    try {
      const data = await InformService.getHistory();
      setInformes(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar informes:', err);
      setError('No se pudo cargar el historial de informes.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToday = async () => {
    const confirmacion = window.confirm(
      "ADVERTENCIA IMPORTANTE:\n\n" +
      "Al generar el informe de hoy, se cerrará el registro de movimientos.\n" +
      "Las reservas de la fecha actual dejarán de ser editables.\n\n" +
      "¿Estás seguro de que deseas generar el informe ahora?"
    );

    if (!confirmacion) return;

    setGenerating(true);
    try {
      const response = await InformService.generateToday();
      alert(response.message || "Informe generado con éxito");
      loadInformes(); 
    } catch (err) {
      console.error('Error generando informe:', err);
      alert('Error al generar el informe: ' + (err.message || 'Error desconocido'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="tabla-informe-container">
      <div className="header-actions">
        <button className="btn-back" onClick={() => navigate('/home')}>
          <FaArrowLeft />
        </button>
      </div>
        <div>
          <h1 className="tabla-informe-title">HISTORIAL DE INFORMES</h1>
        </div>
      <div className="actions-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          className="generate-btn" 
          onClick={handleGenerateToday}
          disabled={generating}
          style={{
            backgroundColor: '#d9534f', 
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
        >
          {generating ? 'Generando...' : (
            <>
              <FaFilePdf /> Generar Informe de Hoy
            </>
          )}
        </button>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
        </p>
      </div>

      {error && <div className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</div>}

      {loading ? (
        <div className="loading-message">Cargando informes...</div>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla-informe">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>ENLACE DE DESCARGA</th>
              </tr>
            </thead>
            <tbody>
              {informes.length > 0 ? (
                informes.map((informe, index) => (
                  <tr key={index}>
                    <td>{informe.fecha}</td>
                    <td>
                      <a 
                        href={informe.url_descarga} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="download-link"
                      >
                        <FaFilePdf /> Descargar {informe.archivo}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>No hay informes generados aún.</td>
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