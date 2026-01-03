import React, { useState, useEffect } from 'react';
import { createConsulta, getMyConsultas, getAllConsultas, deleteConsulta, responderConsulta } from '../services/consulta.service';
import Swal from 'sweetalert2';
import '../styles/consultas.css';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { IoFilterCircle, IoCloseCircle } from "react-icons/io5";

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [filterStatus, setFilterStatus] = useState('all');

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
      
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setConsultas(sortedData);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      Swal.fire('Error', 'No se pudieron cargar las consultas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = async () => {
    const { value: status } = await Swal.fire({
      title: 'Filtrar Consultas',
      input: 'select',
      inputOptions: {
        'all': 'Todas',
        'Pendiente': 'Pendientes',
        'Respondida': 'Respondidas',
        'En proceso': 'En proceso'
      },
      inputValue: filterStatus,
      showCancelButton: true,
      confirmButtonColor: '#1565C0',
      confirmButtonText: 'Filtrar',
      cancelButtonText: 'Cancelar'
    });

    if (status) {
      setFilterStatus(status);
    }
  };

  const clearFilters = () => {
    setFilterStatus('all');
  };

  const handleCreateConsulta = async () => {
    const { value: pregunta } = await Swal.fire({
      title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Nueva Consulta</h2>',
      html: `
        <div style="text-align: left; margin-top: 10px;">
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Tu Pregunta</label>
            <textarea id="swal-pregunta" class="swal2-textarea" placeholder="Escribe tu consulta aquí (mínimo 10 caracteres)..." style="margin: 0 0 15px 0; width: 100%; height: 100px; resize: none; border: 1px solid #d9d9d9; box-sizing: border-box;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Consulta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b79c2',
      cancelButtonColor: '#d33',
      width: '500px',
      padding: '25px',
      focusConfirm: false,
      preConfirm: () => {
        const text = document.getElementById('swal-pregunta').value;
        if (!text || text.trim().length < 10) {
          Swal.showValidationMessage('La pregunta debe tener al menos 10 caracteres');
          return false;
        }
        return text;
      }
    });

    if (pregunta) {
      try {
        await createConsulta(pregunta);
        Swal.fire({
          icon: 'success',
          title: 'Enviada',
          text: 'Tu consulta ha sido enviada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        loadConsultas(userRole);
      } catch (error) {
        Swal.fire('Error', 'No se pudo enviar la consulta', 'error');
      }
    }
  };

  const handleManageConsulta = async (consulta) => {
    const isAdmin = ['guard', 'admin', 'adminBicicletero'].includes(userRole);
    
    const respuestaHtml = consulta.respuesta 
        ? `<div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; text-align: left; margin-top: 15px; border-left: 4px solid #2e7d32;">
             <strong style="color: #2e7d32; font-size: 1rem; display: block; margin-bottom: 5px;">Respuesta:</strong>
             <p style="margin: 0; font-size: 0.95rem; color: #333; white-space: pre-wrap;">${consulta.respuesta}</p>
           </div>`
        : `<div style="margin-top: 15px; padding: 10px; color: #757575; font-style: italic; text-align: center; border: 1px dashed #ccc; border-radius: 5px; background-color: #fafafa;">
             Aún no hay respuesta.
           </div>`;
    if (isAdmin) {
        const { value: formValues } = await Swal.fire({
            title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Gestionar Consulta</h2>',
            html: `
                <div style="text-align: left; margin-top: 10px; font-size: 0.95rem;">
                    <p><strong>Usuario:</strong> ${consulta.user?.nombre || 'Anónimo'}</p>
                    <p><strong>Pregunta:</strong></p>
                    <p style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${consulta.pregunta}</p>
                    
                    <hr style="margin: 15px 0; border-top: 1px solid #eee;">
                    
                    <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Estado</label>
                    <select id="swal-status" class="swal2-select" style="margin: 0 0 15px 0; width: 100%; border: 1px solid #d9d9d9; padding: 10px; border-radius: 4px;">
                        <option value="Pendiente" ${consulta.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En proceso" ${consulta.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Respondida" ${consulta.estado === 'Respondida' ? 'selected' : ''}>Respondida</option>
                    </select>

                    <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Respuesta</label>
                    <textarea id="swal-respuesta" class="swal2-textarea" placeholder="Escribe la respuesta..." style="margin: 0; width: 100%; height: 100px; resize: none; border: 1px solid #d9d9d9;">${consulta.respuesta || ''}</textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2b79c2',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    estado: document.getElementById('swal-status').value,
                    respuesta: document.getElementById('swal-respuesta').value
                };
            }
        });

        if (formValues) {
            try {
                await responderConsulta(consulta.id, formValues.estado, formValues.respuesta);
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Consulta actualizada correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadConsultas(userRole);
            } catch (error) {
                Swal.fire('Error', 'No se pudo actualizar la consulta', 'error');
            }
        }
    } else {
        Swal.fire({
            title: `<h3 style="color: #1565C0; margin: 0; font-size: 1.5rem;">Detalle de Consulta</h3>`,
            html: `
                <div style="text-align: left; font-size: 0.95rem; color: #444;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>Estado:</strong> <span style="color: ${getStatusColor(consulta.estado)}; font-weight: bold;">${consulta.estado}</span></span>
                        <span><strong>Fecha:</strong> ${new Date(consulta.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style="margin-bottom: 5px;"><strong>Tu Pregunta:</strong></p>
                    <p style="color: #333; background: #f5f5f5; padding: 10px; border-radius: 5px;">${consulta.pregunta}</p>
                    
                    ${respuestaHtml}
                </div>
            `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#2b79c2',
            showCloseButton: true
        });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteConsulta(id);
                Swal.fire('Eliminado', 'La consulta ha sido eliminada.', 'success');
                loadConsultas(userRole);
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar', 'error');
            }
        }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Pendiente': return '#95a5a6';
        case 'En proceso': return '#f1c40f'; 
        case 'Respondida': return '#2ecc71'; 
        default: return '#95a5a6'; 
    }
  };

  const formatId = (id) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

  const filteredConsultas = consultas.filter(c => 
    filterStatus === 'all' || c.estado === filterStatus
  );

  const isAdminOrGuard = ['admin', 'guard', 'adminBicicletero'].includes(userRole);

  return (
    <div className="consultas-container">
      <div className="consultas-header">
        <h1>CONSULTAS</h1>
        
        <div className="header-filter-actions">
            {filterStatus !== 'all' && (
                <span className="filter-badge">
                    {filterStatus}
                    <IoCloseCircle 
                    size={18} 
                    className="filter-close-icon"
                    onClick={clearFilters}
                    title="Quitar filtro"
                    />
                </span>
            )}
            <button 
                className="btn-filter-icon" 
                onClick={handleFilterClick} 
                title="Filtrar Consultas"
            >
                <IoFilterCircle size={45} />
            </button>
        </div>
      </div>

      <div className="consultas-wrapper">
        <div className="consultas-scroll-area">
            {loading ? (
                <div className="loading-text">Cargando consultas...</div>
            ) : filteredConsultas.length === 0 ? (
                <div className="no-data-text">No hay consultas encontradas.</div>
            ) : (
                <>
                    {isAdminOrGuard ? (
                        <table className="consultas-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Estado</th>
                                    <th>Pregunta</th>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConsultas.map((cons) => (
                                    <tr key={cons.id}>
                                        <td style={{color: '#1565C0', fontWeight: 'bold'}}>
                                            {formatId(cons.id)}
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{backgroundColor: getStatusColor(cons.estado)}}>
                                                {cons.estado}
                                            </span>
                                        </td>
                                        <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {cons.pregunta}
                                        </td>
                                        <td>
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <strong>{cons.user?.nombre || 'Anónimo'}</strong>
                                                <span style={{fontSize:'0.8rem', color:'#888'}}>{cons.user?.email}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(cons.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-icon-small" title="Responder/Gestionar" onClick={() => handleManageConsulta(cons)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon-small" title="Eliminar" style={{color: '#d32f2f'}} onClick={() => handleDelete(cons.id)}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="consultas-grid">
                            {filteredConsultas.map((cons) => (
                                <div 
                                    key={cons.id} 
                                    className="consulta-card" 
                                    onClick={() => handleManageConsulta(cons)}
                                    title="Haz clic para ver detalles"
                                >
                                    <div className="card-header-status" style={{ backgroundColor: getStatusColor(cons.estado) }}>
                                        {cons.estado}
                                    </div>
                                    <div className="card-body">
                                        <div className="card-meta">
                                            <span>Consulta</span>
                                            <span>{new Date(cons.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="card-title">
                                            <span style={{color: '#1565C0', fontWeight: 'bold', marginRight: '5px'}}>
                                                {formatId(cons.id)}
                                            </span>
                                            {cons.pregunta}
                                        </div>
                                        {cons.respuesta ? (
                                            <p style={{color:'#2e7d32', fontSize:'0.85rem', marginTop: '10px', fontStyle:'italic'}}>
                                                ✓ Respondida
                                            </p>
                                        ) : (
                                            <p style={{color:'#999', fontSize:'0.85rem', marginTop: '10px', fontStyle:'italic'}}>
                                                Esperando respuesta...
                                            </p>
                                        )}
                                        
                                        <div style={{marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end'}}>
                                            <button 
                                                className="btn-icon-small" 
                                                style={{color: '#d32f2f'}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(cons.id);
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>

      <div className="consultas-actions">
        {userRole === 'user' && (
            <button className="btn-action" onClick={handleCreateConsulta}>
                <FaPlus /> Crear Nueva Consulta
            </button>
        )}
      </div>
    </div>
  );
};

export default Consultas;