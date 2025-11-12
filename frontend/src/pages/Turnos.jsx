import React, { useState, useEffect } from 'react';
import { turnosService } from '../services/turnos.service';
import '../styles/turnos.css';

const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      const response = await turnosService.getTurnos();
      setTurnos(response.data);
    } catch (error) {
      console.error('Error cargando turnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await turnosService.createTurno(formData);
      setShowForm(false);
      setFormData({ date: '', startTime: '', endTime: '' });
      cargarTurnos();
      alert('Turno creado exitosamente!');
    } catch (error) {
      console.error('Error creando turno:', error);
      alert('Error al crear turno');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este turno?')) {
      try {
        await turnosService.deleteTurno(id);
        cargarTurnos();
        alert('Turno eliminado exitosamente!');
      } catch (error) {
        console.error('Error eliminando turno:', error);
        alert('Error al eliminar turno');
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-message">Cargando turnos...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">Gestión de Turnos</div>

      <div className="profile-actions">
        <button 
          className="edit"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Turno'}
        </button>
      </div>

      {showForm && (
        <div className="profile-card">
          <h2 className="profile-header">Crear Nuevo Turno</h2>
          <form onSubmit={handleSubmit} className="profile-info">
            <div>
              <span className="label">Fecha</span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="value"
                required
              />
            </div>
            
            <div>
              <span className="label">Hora Inicio</span>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="value"
                required
              />
            </div>
            
            <div>
              <span className="label">Hora Fin</span>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="value"
                required
              />
            </div>
            
            <div className="profile-actions">
              <button type="submit" className="edit">
                Crear Turno
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="profile-card">
        <h2 className="profile-header">Lista de Turnos</h2>
        {turnos.length === 0 ? (
          <div className="profile-message">No hay turnos registrados</div>
        ) : (
          <div className="turnos-list">
            {turnos.map((turno) => (
              <div key={turno.id} className="turno-item">
                <div className="profile-info">
                  <div>
                    <span className="label">Fecha:</span>
                    <span className="value">{turno.date}</span>
                  </div>
                  <div>
                    <span className="label">Hora Inicio:</span>
                    <span className="value">{turno.startTime}</span>
                  </div>
                  <div>
                    <span className="label">Hora Fin:</span>
                    <span className="value">{turno.endTime}</span>
                  </div>
                </div>
                <div className="profile-actions">
                  <button 
                    onClick={() => handleDelete(turno.id)}
                    className="delete"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Turnos;