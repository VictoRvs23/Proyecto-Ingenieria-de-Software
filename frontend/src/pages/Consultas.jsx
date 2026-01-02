import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash, FaSpinner, FaReply } from 'react-icons/fa';
import { createConsulta, getMyConsultas, getAllConsultas, deleteConsulta, responderConsulta } from '../services/consulta.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [pregunta, setPregunta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [respondingId, setRespondingId] = useState(null);
  const [respondingText, setRespondingText] = useState('');
  const [respondingStatus, setRespondingStatus] = useState('Respondida');

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    setUserRole(role || 'user');
    loadConsultas(role || 'user');
  }, []);

  const loadConsultas = async (role) => {
    try {
      setLoading(true);
      let data;
      if (role === 'user') {
        data = await getMyConsultas();
      } else if (['guard', 'admin', 'adminBicicletero'].includes(role)) {
        data = await getAllConsultas();
      }
      setConsultas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      showErrorAlert('Error al cargar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConsulta = async (e) => {
    e.preventDefault();

    if (!pregunta.trim()) {
      showErrorAlert('Por favor escribe una pregunta');
      return;
    }

    if (pregunta.trim().length < 10) {
      showErrorAlert('La pregunta debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createConsulta(pregunta);
      
      if (response.data) {
        setConsultas([response.data, ...consultas]);
        setPregunta('');
        showSuccessAlert('Consulta enviada exitosamente');
      }
    } catch (error) {
      console.error('Error al crear consulta:', error);
      showErrorAlert('Error al enviar tu consulta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConsulta = async (id) => {
    try {
      await deleteConsulta(id);
      setConsultas(consultas.filter(c => c.id !== id));
      showSuccessAlert('Consulta eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar consulta:', error);
      showErrorAlert('Error al eliminar la consulta');
    }
  };

  const handleResponderConsulta = async (id) => {
    if (!respondingText.trim()) {
      showErrorAlert('Por favor escribe una respuesta');
      return;
    }

    try {
      setSubmitting(true);
      const response = await responderConsulta(id, respondingStatus, respondingText);
      
      if (response.data) {
        setConsultas(consultas.map(c => 
          c.id === id ? response.data : c
        ));
        setRespondingId(null);
        setRespondingText('');
        setRespondingStatus('Respondida');
        showSuccessAlert('Respuesta enviada exitosamente');
      }
    } catch (error) {
      console.error('Error al responder consulta:', error);
      showErrorAlert('Error al enviar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Respondida':
        return 'estado-respondida';
      case 'Pendiente':
        return 'estado-pendiente';
      case 'En proceso':
        return 'estado-proceso';
      default:
        return 'estado-pendiente';
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdmin = ['guard', 'admin', 'adminBicicletero'].includes(userRole);

  return (
    <div className="consultas-container">
      <div className="consultas-header">
        <h1 className="consultas-title">MIS CONSULTAS</h1>
        <p className="consultas-subtitle">
          {isAdmin 
            ? 'Gestiona las consultas de los usuarios y responde sus preguntas'
            : 'Aqui tus respuestas seran respondidas por los trabajadores'
          }
        </p>
      </div>

      <div className="consultas-content">
        {/* Formulario para crear consulta (solo usuarios) */}
        {!isAdmin && (
          <div className="consulta-form-section">
            <h2 className="form-title">Haz tu pregunta</h2>
            <form onSubmit={handleSubmitConsulta} className="consulta-form">
              <div className="form-group">
                <textarea
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  placeholder="Escribe tu pregunta aquí (mínimo 10 caracteres)..."
                  className="consulta-textarea"
                  rows="4"
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Enviando...
                  </>
                ) : (
                  '✉️ Enviar Consulta'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Lista de consultas */}
        <div className="consultas-list-section">
          <h2 className="consultas-list-title">
            {isAdmin ? 'Todas las Consultas' : 'Mis Consultas'}
          </h2>
          
          {loading ? (
            <div className="loading-message">Cargando consultas...</div>
          ) : consultas.length === 0 ? (
            <div className="no-consultas-message">
              <p>{isAdmin ? 'No hay consultas disponibles' : 'Aún no has enviado ninguna consulta'}</p>
              <p>{isAdmin ? 'Los usuarios aún no han realizado consultas' : 'Usa el formulario anterior para hacer tu primera pregunta'}</p>
            </div>
          ) : (
            <div className="consultas-list">
              {consultas.map((consulta) => (
                <div key={consulta.id} className="consulta-item">
                  <div className="consulta-header-bar">
                    <div className="consulta-header-info">
                      <h3 className="consulta-pregunta">{consulta.pregunta}</h3>
                      <p className="consulta-usuario">
                        <strong>Por:</strong> {consulta.user?.nombre || 'Usuario anónimo'}
                      </p>
                      <div className="consulta-meta">
                        <span className={`consulta-estado ${getEstadoColor(consulta.estado)}`}>
                          {consulta.estado}
                        </span>
                        <span className="consulta-fecha">{formatFecha(consulta.created_at)}</span>
                      </div>
                    </div>
                    <div className="consulta-actions">
                      <button
                        className={`consulta-toggle-btn ${expandedItems[consulta.id] ? 'active' : ''}`}
                        onClick={() => toggleExpand(consulta.id)}
                      >
                        {expandedItems[consulta.id] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      {!isAdmin && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteConsulta(consulta.id)}
                          title="Eliminar consulta"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedItems[consulta.id] && (
                    <div className="consulta-content">
                      {consulta.respuesta ? (
                        <div className="consulta-respuesta">
                          <h4 className="respuesta-title">Respuesta del equipo:</h4>
                          <p className="respuesta-text">{consulta.respuesta}</p>
                        </div>
                      ) : (
                        <div className="sin-respuesta-message">
                          <p>{isAdmin ? 'Esta consulta aún no tiene respuesta' : 'Aún no hay respuesta para tu consulta'}</p>
                          <p>{isAdmin ? 'Proporciona una respuesta abajo' : 'Nuestro equipo está trabajando en ello'}</p>
                        </div>
                      )}

                      {isAdmin && respondingId !== consulta.id && (
                        <button
                          className="responder-button"
                          onClick={() => {
                            setRespondingId(consulta.id);
                            setRespondingText(consulta.respuesta || '');
                            setRespondingStatus(consulta.estado);
                          }}
                        >
                          <FaReply /> {consulta.respuesta ? 'Editar Respuesta' : 'Responder'}
                        </button>
                      )}

                      {isAdmin && respondingId === consulta.id && (
                        <div className="responder-form">
                          <div className="form-group">
                            <label className="form-label">Estado:</label>
                            <select
                              value={respondingStatus}
                              onChange={(e) => setRespondingStatus(e.target.value)}
                              className="estado-select"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En proceso">En proceso</option>
                              <option value="Respondida">Respondida</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Tu respuesta:</label>
                            <textarea
                              value={respondingText}
                              onChange={(e) => setRespondingText(e.target.value)}
                              placeholder="Escribe la respuesta..."
                              className="respuesta-textarea"
                              rows="4"
                              disabled={submitting}
                            />
                          </div>
                          <div className="responder-buttons">
                            <button
                              type="button"
                              className="submit-respuesta-button"
                              onClick={() => handleResponderConsulta(consulta.id)}
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <FaSpinner className="spinner-icon" /> Enviando...
                                </>
                              ) : (
                                '✓ Enviar Respuesta'
                              )}
                            </button>
                            <button
                              type="button"
                              className="cancel-respuesta-button"
                              onClick={() => setRespondingId(null)}
                              disabled={submitting}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consultas;
