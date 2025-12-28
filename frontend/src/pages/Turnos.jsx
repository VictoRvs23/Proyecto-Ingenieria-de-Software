import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/user.service';
import { getAllTurns, updateMultipleTurns, getTurnByUser } from '../services/turn.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/turnos.css';

const Turnos = () => {
  const [guardias, setGuardias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    setUserRole(role);
    setCurrentUser(userId);
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
      const role = localStorage.getItem('role') || sessionStorage.getItem('role');
      
      if (role === 'guard') {
        const userId = parseInt(localStorage.getItem('userId') || sessionStorage.getItem('userId'));
        const userName = localStorage.getItem('nombre') || sessionStorage.getItem('nombre') || 'Guardia';
        const userEmail = localStorage.getItem('email') || sessionStorage.getItem('email') || '';
        
        // Obtener el turno del backend
        let turnoGuardia = { bicicletero: '', jornada: '' };
        try {
          const turnoResponse = await getTurnByUser(userId);
          if (turnoResponse.data) {
            turnoGuardia = {
              bicicletero: turnoResponse.data.bicicletero || '',
              jornada: turnoResponse.data.jornada || ''
            };
          }
        } catch (error) {
          console.error('Error al obtener turno del guardia:', error);
        }
        
        setGuardias([{
          id: userId,
          nombre: userName,
          email: userEmail,
          telefono: '',
          bicicletero: turnoGuardia.bicicletero,
          jornada: turnoGuardia.jornada
        }]);
        setLoading(false);
        return;
      }
      
      // Para admin y adminBicicletero
      const response = await getAllUsers();
      const users = response.data || [];
      
      // Obtener todos los turnos del backend
      let turnosMap = {};
      try {
        const turnosResponse = await getAllTurns();
        const turnos = turnosResponse.data || [];
        turnosMap = turnos.reduce((acc, turno) => {
          acc[turno.user_id] = {
            bicicletero: turno.bicicletero || '',
            jornada: turno.jornada || ''
          };
          return acc;
        }, {});
      } catch (error) {
        console.error('Error al obtener turnos:', error);
      }
      
      const guardiasConRol = users
        .filter(user => user.role === 'guard')
        .map(user => ({
          id: user.id,
          nombre: user.nombre || 'Sin nombre',
          email: user.email,
          telefono: user.numeroTelefonico || 'Sin teléfono',
          bicicletero: turnosMap[user.id]?.bicicletero || '',
          jornada: turnosMap[user.id]?.jornada || ''
        }));
      
      setGuardias(guardiasConRol);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar guardias:', error);
      showErrorAlert('Error al cargar los datos de guardias');
      setLoading(false);
    }
  };

  const handleBicicleteroChange = (guardiaId, bicicletero) => {
    const guardia = guardias.find(g => g.id === guardiaId);
    
    // Validar si ya existe un guardia con esa combinación de bicicletero + jornada
    if (bicicletero && guardia.jornada) {
      const conflicto = guardias.find(g => 
        g.id !== guardiaId && 
        g.bicicletero === bicicletero && 
        g.jornada === guardia.jornada
      );
      
      if (conflicto) {
        showErrorAlert(`El guardia ${conflicto.nombre} ya tiene asignada la jornada "${guardia.jornada}" en el bicicletero ${bicicletero}. Solo un guardia puede tener ese turno.`);
        return;
      }
    }
    
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, bicicletero } : g
    ));
    setHayCambiosSinGuardar(true);
  };

  const handleJornadaChange = (guardiaId, jornada) => {
    const guardia = guardias.find(g => g.id === guardiaId);
    
    // Validar si ya existe un guardia con esa combinación de bicicletero + jornada
    if (jornada && guardia.bicicletero) {
      const conflicto = guardias.find(g => 
        g.id !== guardiaId && 
        g.bicicletero === guardia.bicicletero && 
        g.jornada === jornada
      );
      
      if (conflicto) {
        showErrorAlert(`El guardia ${conflicto.nombre} ya tiene asignada la jornada "${jornada}" en el bicicletero ${guardia.bicicletero}. Solo un guardia puede tener ese turno.`);
        return;
      }
    }
    
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, jornada } : g
    ));
    setHayCambiosSinGuardar(true);
  };

  const handleGuardarCambios = async () => {
    try {
      // Validar conflictos antes de guardar
      const conflictos = [];
      guardias.forEach((guardia, index) => {
        if (guardia.bicicletero && guardia.jornada) {
          const otroGuardia = guardias.find((g, i) => 
            i !== index && 
            g.bicicletero === guardia.bicicletero && 
            g.jornada === guardia.jornada
          );
          
          if (otroGuardia) {
            conflictos.push({
              guardia1: guardia.nombre,
              guardia2: otroGuardia.nombre,
              bicicletero: guardia.bicicletero,
              jornada: guardia.jornada
            });
          }
        }
      });
      
      if (conflictos.length > 0) {
        const mensajeConflictos = conflictos.map(c => 
          `• ${c.guardia1} y ${c.guardia2} tienen el mismo turno: ${c.jornada} en bicicletero ${c.bicicletero}`
        ).join('\n');
        showErrorAlert(`No se pueden guardar los cambios. Hay turnos duplicados:\n\n${mensajeConflictos}`);
        return;
      }
      
      // Preparar datos para enviar al backend
      const turnsToSave = guardias.map(g => ({
        userId: parseInt(g.id),
        bicicletero: g.bicicletero || '',
        jornada: g.jornada || ''
      }));
      
      // Guardar en el backend
      await updateMultipleTurns(turnsToSave);
      
      setHayCambiosSinGuardar(false);
      showSuccessAlert('Cambios guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al guardar los cambios';
      showErrorAlert(errorMsg);
    }
  };

  return (
    <div className="turnos-container">
      <h1 className="turnos-title">TURNOS</h1>

      {loading ? (
        <div className="loading-message">Cargando turnos...</div>
      ) : userRole === 'guard' ? (
        (() => {
          const miTurno = guardias.find(g => String(g.id) === String(currentUser));
          
          if (!miTurno) {
            return (
              <div className="turno-card-container">
                <div className="turno-card">
                  <div className="no-turno-message-card">
                    No se encontró información de turno
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="turno-card-container">
              <div className="turno-card">
                <div className="turno-card-section">
                  <h2 className="turno-card-label">Guardia</h2>
                  <p className="turno-card-value">{miTurno.nombre}</p>
                </div>

                <div className="turno-card-section">
                  <h2 className="turno-card-label">Jornada Asignada</h2>
                  <p className="turno-card-value">
                    {miTurno.jornada || 'Sin asignar'}
                  </p>
                </div>

                <div className="turno-card-section">
                  <h2 className="turno-card-label">Bicicletero</h2>
                  <p className="turno-card-value">
                    {miTurno.bicicletero ? `Número ${miTurno.bicicletero}` : 'Sin asignar'}
                  </p>
                </div>
              </div>
            </div>
          );
        })()
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
