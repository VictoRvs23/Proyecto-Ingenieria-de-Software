import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/user.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/turnos.css';

const Turnos = () => {
  const [guardias, setGuardias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);

  useEffect(() => {
    loadGuardias();
  }, []);

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === 'Sin teléfono') return 'Sin teléfono';
    const phoneStr = String(phone);
    
    if (phoneStr.startsWith('9') && phoneStr.length === 9) {
      return `9 ${phoneStr.slice(1)}`;
    } else if (phoneStr.length === 8) {
      return `9 ${phoneStr}`;
    }
    return phoneStr;
  };

  const loadGuardias = async () => {
    try {
      const response = await getAllUsers();
      const users = response.data || [];
      
      const savedData = localStorage.getItem('turnosGuardias');
      let savedGuardias = {};
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          savedGuardias = parsedData.reduce((acc, item) => {
            acc[item.id] = { bicicletero: item.bicicletero, jornada: item.jornada };
            return acc;
          }, {});
        } catch (error) {
          console.error('Error al parsear datos guardados:', error);
        }
      }
      
      const guardiasConRol = users
        .filter(user => user.role === 'guard')
        .map(user => ({
          id: user.id,
          nombre: user.nombre || 'Sin nombre',
          email: user.email,
          telefono: user.numeroTelefonico || 'Sin teléfono',
          bicicletero: savedGuardias[user.id]?.bicicletero || '',
          jornada: savedGuardias[user.id]?.jornada || ''
        }));
      
      setGuardias(guardiasConRol);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar guardias:', error);
      setLoading(false);
    }
  };

  const handleBicicleteroChange = (guardiaId, bicicletero) => {
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, bicicletero } : g
    ));
    setHayCambiosSinGuardar(true);
    console.log(`Guardia ${guardiaId} asignado a bicicletero ${bicicletero}`);
  };

  const handleJornadaChange = (guardiaId, jornada) => {
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, jornada } : g
    ));
    setHayCambiosSinGuardar(true);
    console.log(`Guardia ${guardiaId} asignado a jornada ${jornada}`);
  };

  const handleGuardarCambios = () => {
    try {
      const dataToSave = guardias.map(g => ({
        id: g.id,
        bicicletero: g.bicicletero,
        jornada: g.jornada
      }));
      localStorage.setItem('turnosGuardias', JSON.stringify(dataToSave));
      setHayCambiosSinGuardar(false);
      showSuccessAlert('Cambios guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      showErrorAlert('Error al guardar los cambios');
    }
  };

  return (
    <div className="turnos-container">
      <h1 className="turnos-title">TURNOS</h1>

      {loading ? (
        <div className="loading-message">Cargando turnos...</div>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla-turnos">
            <thead>
              <tr>
                <th>GUARDIAS</th>
                <th>DATOS</th>
                <th>JORNADA</th>
                <th>BICICLETERO</th>
              </tr>
            </thead>
            <tbody>
              {guardias.length > 0 ? (
                guardias.map((guardia) => (
                  <tr key={guardia.id}>
                    <td>{guardia.nombre}</td>
                    <td>
                      <div className="datos-cell">
                        <div>{guardia.email}</div>
                        <div>{formatPhoneNumber(guardia.telefono)}</div>
                      </div>
                    </td>
                    <td>
                      <select 
                        value={guardia.jornada}
                        onChange={(e) => handleJornadaChange(guardia.id, e.target.value)}
                        className="jornada-select"
                      >
                        <option value="">PREDETERMINADA</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        value={guardia.bicicletero}
                        onChange={(e) => handleBicicleteroChange(guardia.id, e.target.value)}
                        className="bicicletero-select"
                      >
                        <option value="">PREDETERMINADO</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No hay guardias disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {!loading && guardias.length > 0 && hayCambiosSinGuardar && (
        <div className="guardar-button-container">
          <button className="guardar-button" onClick={handleGuardarCambios}>
            GUARDAR CAMBIOS
          </button>
        </div>
      )}
    </div>
  );
};

export default Turnos;
