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
        
        let turnoGuardia = { bicicletero: '', hora_inicio: '', hora_salida: '' };
        try {
          const turnoResponse = await getTurnByUser(userId);
          if (turnoResponse.data) {
            turnoGuardia = {
              bicicletero: turnoResponse.data.bicicletero || '',
              hora_inicio: turnoResponse.data.hora_inicio || '',
              hora_salida: turnoResponse.data.hora_salida || ''
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
          hora_inicio: turnoGuardia.hora_inicio,
          hora_salida: turnoGuardia.hora_salida
        }]);
        setLoading(false);
        return;
      }
      
      const response = await getAllUsers();
      const users = response.data || [];
      
      let turnosMap = {};
      try {
        const turnosResponse = await getAllTurns();
        const turnos = turnosResponse.data || [];
        turnosMap = turnos.reduce((acc, turno) => {
          acc[turno.user_id] = {
            bicicletero: turno.bicicletero || '',
            hora_inicio: turno.hora_inicio || '',
            hora_salida: turno.hora_salida || ''
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
          hora_inicio: turnosMap[user.id]?.hora_inicio || '',
          hora_salida: turnosMap[user.id]?.hora_salida || ''
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

  const handleHoraInicioChange = (guardiaId, hora_inicio) => {
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, hora_inicio } : g
    ));
    setHayCambiosSinGuardar(true);
  };

  const handleHoraSalidaChange = (guardiaId, hora_salida) => {
    setGuardias(guardias.map(g => 
      g.id === guardiaId ? { ...g, hora_salida } : g
    ));
    setHayCambiosSinGuardar(true);
  };

  const handleGuardarCambios = async () => {
    try {
      // Validaciones
      const turnosConHoras = guardias.filter(g => g.hora_inicio || g.hora_salida);
      
      for (const guardia of turnosConHoras) {
        if (!guardia.hora_inicio || !guardia.hora_salida) {
          showErrorAlert(`${guardia.nombre}: Debe ingresar tanto hora de inicio como hora de salida.`);
          return;
        }
        
        if (!guardia.bicicletero) {
          showErrorAlert(`${guardia.nombre}: Debe seleccionar un bicicletero.`);
          return;
        }

        // Validar formato HH:MM
        const regexHora = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!regexHora.test(guardia.hora_inicio)) {
          showErrorAlert(`${guardia.nombre}: Hora de inicio con formato inválido. Use HH:MM (ej: 08:00)`);
          return;
        }
        if (!regexHora.test(guardia.hora_salida)) {
          showErrorAlert(`${guardia.nombre}: Hora de salida con formato inválido. Use HH:MM (ej: 13:00)`);
          return;
        }
      }
      
      // Validar solapamiento local (vista previa)
      const turnosValidos = guardias.filter(g => g.bicicletero && g.hora_inicio && g.hora_salida);
      for (let i = 0; i < turnosValidos.length; i++) {
        for (let j = i + 1; j < turnosValidos.length; j++) {
          const turno1 = turnosValidos[i];
          const turno2 = turnosValidos[j];
          
          if (turno1.bicicletero === turno2.bicicletero) {
            const start1 = parseInt(turno1.hora_inicio.replace(':', ''));
            const end1 = parseInt(turno1.hora_salida.replace(':', ''));
            const start2 = parseInt(turno2.hora_inicio.replace(':', ''));
            const end2 = parseInt(turno2.hora_salida.replace(':', ''));
            
            if (start1 < end2 && start2 < end1) {
              showErrorAlert(`Conflicto: ${turno1.nombre} (${turno1.hora_inicio}-${turno1.hora_salida}) y ${turno2.nombre} (${turno2.hora_inicio}-${turno2.hora_salida}) tienen horarios superpuestos en bicicletero ${turno1.bicicletero}`);
              return;
            }
          }
        }
      }
      
      const turnsToSave = guardias.map(g => ({
        userId: parseInt(g.id),
        bicicletero: g.bicicletero || '',
        hora_inicio: g.hora_inicio || '',
        hora_salida: g.hora_salida || ''
      }));
      
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
                  <h2 className="turno-card-label">Horario de Trabajo</h2>
                  <p className="turno-card-value">
                    {miTurno.hora_inicio && miTurno.hora_salida 
                      ? `${miTurno.hora_inicio} - ${miTurno.hora_salida}`
                      : 'Sin asignar'}
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
                <th>HORA INICIO</th>
                <th>HORA SALIDA</th>
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
                      <input 
                        type="time"
                        value={guardia.hora_inicio}
                        onChange={(e) => handleHoraInicioChange(guardia.id, e.target.value)}
                        className="hora-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="time"
                        value={guardia.hora_salida}
                        onChange={(e) => handleHoraSalidaChange(guardia.id, e.target.value)}
                        className="hora-input"
                      />
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>No hay guardias disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {!loading && guardias.length > 0 && hayCambiosSinGuardar && (
        <div className="guardar-button-container">
          <button className="guardar-button" onClick={handleGuardarCambios}>
            💾 Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
};

export default Turnos;
