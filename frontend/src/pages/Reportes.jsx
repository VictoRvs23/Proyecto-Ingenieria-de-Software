import React, { useState, useEffect } from 'react';
import { createReport, getMyReports, getAllReports, updateReportStatus, deleteReport } from '../services/reporte.service';
import Swal from 'sweetalert2';
import '../styles/reportes.css';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { IoFilterCircle, IoCloseCircle } from "react-icons/io5";

const SERVER_URL = "http://localhost:3000";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    fetchReportes(role);
  }, []);

  const fetchReportes = async (role) => {
    try {
      setLoading(true);
      let data;
      if (role === 'user') {
        data = await getMyReports();
      } else {
        data = await getAllReports();
      }
      
      const sortedData = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReportes(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'Robo': return '🚨 Robo';
      case 'Daño': return '🚲 Daño';
      case 'Objeto Perdido': return '🔍 Objeto Perdido';
      case 'Reclamo/Sugerencia': return '🗣️ Reclamo/Sugerencia';
      case 'Otro': return '📝 Otro';
      default: return tipo || 'Desconocido';
    }
  };

  const handleFilterClick = async () => {
    const statusOptions = {
        'all': 'Todos los Estados',
        'Pendiente': 'Pendiente',
        'En Revisión': 'En Revisión',
        'Resuelto': 'Resuelto',
        'Rechazado': 'Rechazado'
    };
    
    const typeOptions = {
        'all': 'Todos los Tipos',
        'Robo': '🚨 Robo',
        'Daño': '🚲 Daño',
        'Objeto Perdido': '🔍 Objeto Perdido',
        'Reclamo/Sugerencia': '🗣️ Reclamo/Sugerencia',
        'Otro': '📝 Otro'
    };

    const statusOptionsHtml = Object.keys(statusOptions).map(key => 
        `<option value="${key}" ${filterStatus === key ? 'selected' : ''}>${statusOptions[key]}</option>`
    ).join('');

    const typeOptionsHtml = Object.keys(typeOptions).map(key => 
        `<option value="${key}" ${filterType === key ? 'selected' : ''}>${typeOptions[key]}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Filtrar Reportes',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
            <label style="display: block; color: #545454; font-weight: 600; font-size: 1rem; margin-bottom: 5px;">Por Estado:</label>
            <select id="swal-status-filter" class="swal2-select" style="width: 100%; margin: 0; padding: 10px; border: 1px solid #d9d9d9; border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);">
                ${statusOptionsHtml}
            </select>
        </div>
        <div style="text-align: left;">
            <label style="display: block; color: #545454; font-weight: 600; font-size: 1rem; margin-bottom: 5px;">Por Tipo:</label>
            <select id="swal-type-filter" class="swal2-select" style="width: 100%; margin: 0; padding: 10px; border: 1px solid #d9d9d9; border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);">
                ${typeOptionsHtml}
            </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#2b79c2', 
      cancelButtonColor: '#d33', 
      confirmButtonText: 'Aplicar Filtros',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        return {
            status: document.getElementById('swal-status-filter').value,
            type: document.getElementById('swal-type-filter').value
        };
      }
    });

    if (formValues) {
      setFilterStatus(formValues.status);
      setFilterType(formValues.type);
    }
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
  };

  const filteredReportes = reportes.filter(r => {
    const matchStatus = filterStatus === 'all' || r.estado === filterStatus;
    const matchType = filterType === 'all' || r.tipo === filterType;
    return matchStatus && matchType;
  });

  const handleStatusChange = async (reportId, currentStatus, currentResponse = "") => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Gestionar Reporte</h2>',
      html: `
        <div style="text-align: left; margin-top: 15px;">
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Nuevo Estado</label>
            <select id="swal-status" class="swal2-select" style="margin: 0 0 15px 0; width: 100%; border: 1px solid #d9d9d9; padding: 10px; border-radius: 4px; box-sizing: border-box;">
                <option value="Pendiente" ${currentStatus === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="En Revisión" ${currentStatus === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
                <option value="Resuelto" ${currentStatus === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                <option value="Rechazado" ${currentStatus === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
            </select>

            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Respuesta / Solución</label>
            <textarea id="swal-response" class="swal2-textarea" placeholder="Escribe aquí la respuesta para el usuario..." style="margin: 0 0 15px 0; width: 100%; height: 120px; resize: none; border: 1px solid #d9d9d9; box-sizing: border-box;">${currentResponse || ''}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b79c2',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      preConfirm: () => {
        return {
          status: document.getElementById('swal-status').value,
          respuesta: document.getElementById('swal-response').value
        };
      }
    });

    if (formValues) {
      try {
        await updateReportStatus(reportId, formValues.status, formValues.respuesta);
        
        Swal.fire({ 
            icon: 'success', 
            title: 'Actualizado', 
            text: 'El estado y la respuesta han sido guardados.',
            timer: 2000, 
            showConfirmButton: false 
        });
        fetchReportes(userRole);
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el reporte', 'error');
      }
    }
  };

  // --- FUNCIÓN PARA ELIMINAR REPORTE (USUARIO) ---
  const handleDeleteReport = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto. El reporte será eliminado permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteReport(id);
          Swal.fire(
            'Eliminado!',
            'Tu reporte ha sido eliminado.',
            'success'
          );
          fetchReportes(userRole);
        } catch (error) {
          Swal.fire(
            'Error',
            'No se pudo eliminar el reporte.',
            'error'
          );
        }
      }
    });
  };

  const handleCreateReport = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Nuevo Reporte</h2>',
      html: `
        <div style="text-align: left; margin-top: 10px;">
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Título del Incidente</label>
            <input id="swal-titulo" class="swal2-input" placeholder="Ej: Robo de casco" style="margin: 0 0 15px 0; width: 100%; box-sizing: border-box;">

            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Tipo de problema</label>
            
            <select id="swal-tipo" class="swal2-select" style="width: 100%; margin: 0 0 15px 0; display: block; padding: 10px; border: 1px solid #d9d9d9; border-radius: 4px;">
                <option value="" disabled selected>Selecciona una opción...</option>
                <option value="Robo">🚨 Robo</option>
                <option value="Daño">🚲 Daño</option>
                <option value="Objeto Perdido">🔍 Objeto Perdido</option>
                <option value="Reclamo/Sugerencia">🗣️ Reclamo/Sugerencia</option>
                <option value="Otro">📝 Otro</option>
            </select>

            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Descripción</label>
            <textarea id="swal-desc" class="swal2-textarea" placeholder="Detalla qué sucedió..." style="margin: 0 0 15px 0; width: 100%; height: 80px; resize: none; border: 1px solid #d9d9d9; box-sizing: border-box;"></textarea>
            
            </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Reporte',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b79c2',
      cancelButtonColor: '#d33',
      width: '500px',
      padding: '25px',
      focusConfirm: false,
      preConfirm: () => {
        const titulo = document.getElementById('swal-titulo').value;
        const tipo = document.getElementById('swal-tipo').value; 
        const descripcion = document.getElementById('swal-desc').value;

        if (!titulo || !descripcion || !tipo) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        return { titulo, tipo, descripcion };
      }
    });

    if (formValues) {
      try {
        const formData = new FormData();
        formData.append('titulo', formValues.titulo);
        formData.append('tipo', formValues.tipo);
        formData.append('descripcion', formValues.descripcion);

        await createReport(formData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Enviado',
          text: 'Tu reporte ha sido creado exitosamente',
          confirmButtonColor: '#2b79c2',
          timer: 2000,
          showConfirmButton: false
        });
        fetchReportes(userRole);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'No se pudo crear el reporte';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonColor: '#2b79c2'
        });
      }
    }
  };

  const showEvidence = (imgUrl) => {
    if (!imgUrl) return;

    let cleanPath = imgUrl.replace(/\\/g, "/");
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    const fullUrl = `${SERVER_URL}/${cleanPath}`;

    Swal.fire({ 
        imageUrl: fullUrl, 
        imageAlt: 'Evidencia', 
        showConfirmButton: false, 
        showCloseButton: true, 
        width: 'auto',
        imageWidth: '100%', 
        imageHeight: 'auto', 
        didOpen: () => {
            const img = Swal.getImage();
            if(img) {
                img.onerror = () => {
                    img.style.display = 'none';
                    Swal.getTitle().textContent = 'No se pudo cargar la imagen';
                    Swal.getHtmlContainer().textContent = 'Es posible que el servidor no esté compartiendo la carpeta de imágenes o la ruta sea incorrecta.';
                }
            }
        }
    });
  };

  const handleShowDetails = (rep) => {
    const hasResponse = rep.respuesta && rep.respuesta.trim().length > 0;
    
    const responseHtml = hasResponse
        ? `<div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: left; margin-top: 15px; border-left: 4px solid #1565C0;">
             <strong style="color: #1565C0; font-size: 1rem; display: block; margin-bottom: 5px;">Respuesta del Administrador:</strong>
             <p style="margin: 0; font-size: 0.95rem; color: #333; white-space: pre-wrap;">${rep.respuesta}</p>
           </div>`
        : `<div style="margin-top: 15px; padding: 10px; color: #757575; font-style: italic; text-align: center; border: 1px dashed #ccc; border-radius: 5px; background-color: #fafafa;">
             Aún no hay respuesta del administrador.
           </div>`;
    Swal.fire({
        title: `<h3 style="color: #1565C0; margin: 0; font-size: 1.5rem;">${rep.titulo}</h3>`,
        html: `
            <div style="text-align: left; font-size: 0.95rem; color: #444;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Estado:</strong> <span style="color: ${getStatusColor(rep.estado)}; font-weight: bold;">${rep.estado}</span></span>
                    <span><strong>Fecha:</strong> ${new Date(rep.created_at).toLocaleDateString()}</span>
                </div>
                <p style="margin: 5px 0;"><strong>Tipo:</strong> ${getTipoLabel(rep.tipo)}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="margin-bottom: 5px;"><strong>Descripción del incidente:</strong></p>
                <p style="color: #333; line-height: 1.5; background: #f5f5f5; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${rep.descripcion}</p>
                
                ${responseHtml}
            </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2b79c2',
        width: '600px',
        showCloseButton: true
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Pendiente': return '#95a5a6'; 
        case 'En Revisión': return '#f1c40f'; 
        case 'Resuelto': return '#2ecc71'; 
        case 'Rechazado': return '#d32f2f'; 
        default: return '#95a5a6'; 
    }
  };

  const formatId = (id) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

  const isAdminOrGuard = ['admin', 'guard', 'adminBicicletero'].includes(userRole);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1>REPORTES</h1>
        
        {isAdminOrGuard && (
            <div className="header-filter-actions">
               {(filterStatus !== 'all' || filterType !== 'all') && (
                  <span className="filter-badge">
                     <span>
                       {filterStatus !== 'all' ? filterStatus : ''}
                       {(filterStatus !== 'all' && filterType !== 'all') ? ' + ' : ''}
                       {filterType !== 'all' ? getTipoLabel(filterType) : ''}
                     </span>
                     <IoCloseCircle 
                        size={18} 
                        className="filter-close-icon"
                        onClick={clearFilters}
                        title="Quitar filtros"
                     />
                  </span>
               )}
               <button 
                 className="btn-filter-icon" 
                 onClick={handleFilterClick} 
                 title="Filtrar Reportes"
               >
                 <IoFilterCircle size={45} />
               </button>
            </div>
        )}
      </div>

      <div className="reportes-wrapper">
        <div className="reportes-scroll-area">
            {loading ? (
                <div className="loading-text">Cargando reportes...</div>
            ) : filteredReportes.length === 0 ? (
                <div className="no-data-text">No hay reportes encontrados con los filtros actuales.</div>
            ) : (
                <>
                    {isAdminOrGuard ? (
                        <table className="reportes-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Estado</th>
                                    <th>Tipo</th>
                                    <th>Título</th>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReportes.map((rep) => {
                                    const hasValidImage = rep.imagenUrl && 
                                                          !rep.imagenUrl.includes('undefined') && 
                                                          rep.imagenUrl !== 'null';

                                    return (
                                        <tr key={rep.id}>
                                            <td style={{color: '#1565C0', fontWeight: 'bold'}}>
                                                {formatId(rep.id)}
                                            </td>
                                            <td>
                                                <span className="status-badge" style={{backgroundColor: getStatusColor(rep.estado)}}>
                                                    {rep.estado}
                                                </span>
                                            </td>
                                            <td>{getTipoLabel(rep.tipo)}</td>
                                            <td>{rep.titulo}</td>
                                            <td>
                                                <div style={{display:'flex', flexDirection:'column'}}>
                                                    <strong>{rep.user?.nombre || 'Desc.'}</strong>
                                                    <span style={{fontSize:'0.8rem', color:'#888'}}>{rep.user?.email}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(rep.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {hasValidImage && (
                                                    <button className="btn-icon-small" title="Ver Foto" onClick={() => showEvidence(rep.imagenUrl)}>
                                                        <FaEye />
                                                    </button>
                                                )}
                                                <button className="btn-icon-small" title="Gestionar" onClick={() => handleStatusChange(rep.id, rep.estado, rep.respuesta)}>
                                                    <FaEdit />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="reportes-grid">
                            {filteredReportes.map((rep) => {
                                const hasValidImage = rep.imagenUrl && 
                                                      !rep.imagenUrl.includes('undefined') && 
                                                      rep.imagenUrl !== 'null';

                                return (
                                    <div 
                                        key={rep.id} 
                                        className="reporte-card" 
                                        onClick={() => handleShowDetails(rep)}
                                        style={{cursor: 'pointer'}}
                                        title="Haz clic para ver detalles y respuesta"
                                    >
                                        <div className="card-header-status" style={{ backgroundColor: getStatusColor(rep.estado) }}>
                                            {rep.estado}
                                        </div>
                                        <div className="card-body">
                                            <div className="card-meta">
                                                <span>{getTipoLabel(rep.tipo)}</span>
                                                <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="card-title">
                                                <span style={{color: '#1565C0', fontWeight: 'bold', marginRight: '5px'}}>
                                                    {formatId(rep.id)}
                                                </span>
                                                {rep.titulo}
                                            </div>
                                            <p style={{color:'#666', fontSize:'0.9rem'}}>{rep.descripcion}</p>
                                            
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
                                                {/* Botón Ver Evidencia (si existe) */}
                                                <div>
                                                    {hasValidImage && (
                                                        <button 
                                                            style={{background:'none', border:'none', color:'#1565C0', cursor:'pointer', fontSize:'0.9rem', fontWeight:'bold'}}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                showEvidence(rep.imagenUrl);
                                                            }}
                                                        >
                                                            <FaEye /> Ver Evidencia
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Botón Eliminar Reporte (NUEVO) */}
                                                <button 
                                                    style={{background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '1.2rem'}}
                                                    title="Eliminar Reporte"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteReport(rep.id);
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
      <div className="reportes-actions">
        {userRole === 'user' && (
            <button className="btn-action" onClick={handleCreateReport}>
                <FaPlus /> Crear Nuevo Reporte
            </button>
        )}
      </div>
    </div>
  );
};

export default Reportes;