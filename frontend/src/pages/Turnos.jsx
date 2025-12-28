import React, { useState, useEffect } from 'react';
import '../styles/turnos.css';

const Turnos = () => {
  const [guardias, setGuardias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuardias();
  }, []);

  const loadGuardias = async () => {
    try {
      // Aquí puedes cargar los guardias desde el backend
      // Por ahora usamos datos de ejemplo
      const guardiasEjemplo = [
        { 
          id: 1, 
          nombre: 'Raimundo Koch', 
          rut: '12.345.678-9',
          email: 'raimundo@gmail.com', 
          telefono: '+56912345678',
          bicicletero: '' 
        },
        { 
          id: 2, 
          nombre: 'Cristobal Novoa', 
          rut: '98.765.432-1',
          email: 'cristobal@gmail.com', 
          telefono: '+56987654321',
          bicicletero: '' 
        },
      ];
      
      setGuardias(guardiasEjemplo);
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
    // Aquí puedes guardar el cambio en el backend
    console.log(`Guardia ${guardiaId} asignado a bicicletero ${bicicletero}`);
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
                        <div>Rut</div>
                        <div>Email</div>
                        <div>Numero Telefónico</div>
                      </div>
                    </td>
                    <td>
                      <select 
                        value={guardia.bicicletero}
                        onChange={(e) => handleBicicleteroChange(guardia.id, e.target.value)}
                        className="bicicletero-select"
                      >
                        <option value="">PREDETERMINADA</option>
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
                  <td colSpan="3" style={{ textAlign: 'center' }}>No hay guardias disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Turnos;
