import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, createUser, updateUser, deleteUser } from '../services/user.service';
import Swal from 'sweetalert2';
import { deleteDataAlert } from '../helpers/sweetAlert';
import '../styles/usuarios.css';
import { FaUser, FaPencilAlt } from 'react-icons/fa'; 
import { MdDelete } from 'react-icons/md';
import { IoFilterCircle, IoCloseCircle } from "react-icons/io5";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  const roles = ['user', 'guard', 'adminBicicletero', 'admin'];

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    setUserRole(role);
    
    if (role !== 'admin' && role !== 'adminBicicletero') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para acceder a esta página',
      });
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = async () => {
    const options = {
        'all': 'Todos',
        'user': 'Usuarios',
        'guard': 'Guardias',
        'adminBicicletero': 'Admin Bicicletero',
        'admin': 'Administradores'
    };
    
    const optionsHtml = Object.keys(options).map(key => 
        `<option value="${key}" ${filterRole === key ? 'selected' : ''}>${options[key]}</option>`
    ).join('');

    const { value: selectedRole } = await Swal.fire({
      title: 'Filtrar por Rol',
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #545454; font-weight: 600; font-size: 1.1em;">
            Selecciona el rol:
        </div>
        <select id="swal-role-select" class="swal2-select" style="width: 100%; margin: 0; padding: 10px; border: 1px solid #d9d9d9; border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);">
            ${optionsHtml}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#1565C0', 
      cancelButtonColor: '#d33', 
      confirmButtonText: 'Filtrar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        return document.getElementById('swal-role-select').value;
      }
    });

    if (selectedRole) {
      setFilterRole(selectedRole);
      setSelectedUserId(null); 
    }
  };

  const clearFilter = () => {
    setFilterRole('all');
    setSelectedUserId(null);
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => user.role === filterRole);

  const handleRoleChange = async (userId, currentRole, newRole) => {
    if (currentRole === newRole) return;

    const result = await Swal.fire({
      title: '¿Confirmar cambio de rol?',
      text: `¿Deseas cambiar el rol de este usuario a ${getRoleLabel(newRole)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33', 
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await updateUserRole(userId, newRole);
        
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Rol actualizado',
          text: 'El rol del usuario se ha actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el rol del usuario',
        });
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'user': 'Usuario',
      'guard': 'Guardia',
      'adminBicicletero': 'Admin Bicicletero',
      'admin': 'Administrador'
    };
    return labels[role] || role;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = String(phone);
    if (phoneStr.startsWith('9') && phoneStr.length === 9) {
      return `9 ${phoneStr.slice(1)}`;
    } else if (phoneStr.length === 8) {
      return `9 ${phoneStr}`;
    }
    return phoneStr;
  };

  // --- FUNCIÓN CORREGIDA: CREAR USUARIO ---
  const handleCreateUser = async (initialValues = {}) => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Crear Nuevo Usuario</h2>',
      html: `
        <div style="text-align: left; margin-top: 10px;">
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Nombre Completo</label>
            <input id="swal-nombre" class="swal2-input" placeholder="Ej: Juan Pérez" value="${initialValues.nombre || ''}" style="margin: 0 0 15px 0; width: 100%;">
            
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Email</label>
            <input id="swal-email" class="swal2-input" placeholder="ejemplo@ubiobio.cl" type="email" value="${initialValues.email || ''}" style="margin: 0 0 15px 0; width: 100%;">
            
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Teléfono</label>
            <input id="swal-phone" class="swal2-input" placeholder="9 1234 5678" value="${initialValues.numeroTelefonico || ''}" style="margin: 0 0 15px 0; width: 100%;">
            
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Contraseña</label>
            <input id="swal-password" class="swal2-input" placeholder="Mínimo 8 caracteres" type="password" value="${initialValues.password || ''}" style="margin: 0 0 15px 0; width: 100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1565C0',
      cancelButtonColor: '#d33', 
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value;
        const email = document.getElementById('swal-email').value;
        const phone = document.getElementById('swal-phone').value;
        const password = document.getElementById('swal-password').value;

        if (!nombre || !email || !phone || !password) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        const allowedDomains = ['@gmail.com', '@ubiobio.cl', '@gmail.cl', '@alumnos.ubiobio.cl'];
        const emailLower = email.toLowerCase();
        const isValidDomain = allowedDomains.some(domain => emailLower.endsWith(domain));

        if (!isValidDomain) {
          Swal.showValidationMessage('El correo debe ser: @ubiobio.cl, @alumnos.ubiobio.cl, @gmail.com o @gmail.cl');
          return false;
        }

        return { nombre, email, numeroTelefonico: phone, password };
      }
    });

    if (formValues) {
      try {
        let phoneClean = formValues.numeroTelefonico ? formValues.numeroTelefonico.replace(/\D/g, '') : "";
        if (phoneClean.length === 8) phoneClean = '9' + phoneClean;
        
        await createUser({
          nombre: formValues.nombre,
          email: formValues.email,
          password: formValues.password,
          numeroTelefonico: phoneClean
        });
        await fetchUsers();
        
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se ha creado correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#1565C0'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo crear el usuario',
          confirmButtonColor: '#1565C0'
        });
      }
    }
  };

  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: '<h2 style="color: #545454; font-size: 1.8em; font-weight: 600;">Editar Usuario</h2>',
      html: `
        <div style="text-align: left; margin-top: 10px;">
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Nombre Completo</label>
            <input id="swal-nombre" class="swal2-input" value="${user.nombre || ''}" style="margin: 0 0 15px 0; width: 100%;">
            
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Email</label>
            <input id="swal-email" class="swal2-input" type="email" value="${user.email}" style="margin: 0 0 15px 0; width: 100%;">
            
            <label style="display: block; color: #545454; font-weight: 600; margin-bottom: 5px;">Teléfono</label>
            <input id="swal-phone" class="swal2-input" value="${user.numeroTelefonico || ''}" style="margin: 0 0 15px 0; width: 100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1565C0',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value;
        const email = document.getElementById('swal-email').value;
        const phone = document.getElementById('swal-phone').value;

        if (!nombre || !email || !phone) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        const allowedDomains = ['@gmail.com', '@ubiobio.cl', '@gmail.cl', '@alumnos.ubiobio.cl'];
        const emailLower = email.toLowerCase();
        const isValidDomain = allowedDomains.some(domain => emailLower.endsWith(domain));

        if (!isValidDomain) {
          Swal.showValidationMessage('El correo debe ser: @ubiobio.cl, @alumnos.ubiobio.cl, @gmail.com o @gmail.cl');
          return false;
        }

        return { nombre, email, numeroTelefonico: phone };
      }
    });

    if (formValues) {
      try {
        await updateUser(user.id, formValues);
        await fetchUsers();
        
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'Los datos del usuario se han actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#1565C0'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron actualizar los datos del usuario',
          confirmButtonColor: '#1565C0'
        });
      }
    }
  };

  const handleDeleteUser = (userId) => {
    deleteDataAlert(async () => {
      try {
        await deleteUser(userId);
        await fetchUsers();
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'El usuario se ha eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#1565C0'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario',
          confirmButtonColor: '#1565C0'
        });
      }
    });
  };

  if (userRole !== 'admin' && userRole !== 'adminBicicletero') return null;

  if (loading) {
    return <div className="usuarios-container"><div className="loading">Cargando usuarios...</div></div>;
  }

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>USUARIOS</h1>
        <div className="header-filter-actions">
           {filterRole !== 'all' && (
              <span className="filter-badge">
                 {getRoleLabel(filterRole)}
                 <IoCloseCircle 
                    size={18} 
                    className="filter-close-icon"
                    onClick={clearFilter}
                    title="Quitar filtro"
                 />
              </span>
           )}
           <button 
             className="btn-filter-icon" 
             onClick={handleFilterClick} 
             title="Filtrar Usuarios"
           >
             <IoFilterCircle size={45} />
           </button>
        </div>
      </div>

      <div className="usuarios-wrapper-table">
        <div className="table-scroll-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Numero Telefonico</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No hay usuarios encontrados</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className={selectedUserId === user.id ? 'selected-row' : ''}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td>{user.nombre || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>{formatPhoneNumber(user.numeroTelefonico)}</td>
                    <td>
                      <select
                        className="role-select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                        onClick={(e) => e.stopPropagation()} 
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {getRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="usuarios-actions">
        <button className="btn-action btn-crear" onClick={() => handleCreateUser()}>
          <FaUser size={16} />
          <span>Crear Usuario</span>
        </button>

        <button className={`btn-action btn-editar ${selectedUserId ? 'btn-editar-active' : ''}`} onClick={() => {
          if (filteredUsers.length === 0) {
            Swal.fire({ icon: 'info', title: 'Sin usuarios', text: 'No hay usuarios para editar' });
          } else if (!selectedUserId) {
            Swal.fire({ icon: 'info', title: 'Selecciona un usuario', text: 'Selecciona un usuario de la tabla' });
          } else {
            const user = users.find(u => u.id === selectedUserId);
            handleEditUser(user);
          }
        }}>
          <FaPencilAlt size={16} />
          <span>Editar Datos</span>
        </button>

        <button className={`btn-action btn-eliminar ${selectedUserId ? 'btn-eliminar-active' : ''}`} onClick={() => {
          if (filteredUsers.length === 0) {
            Swal.fire({ icon: 'info', title: 'Sin usuarios', text: 'No hay usuarios para eliminar' });
          } else if (!selectedUserId) {
            Swal.fire({ icon: 'info', title: 'Selecciona un usuario', text: 'Selecciona un usuario de la tabla' });
          } else {
            handleDeleteUser(selectedUserId);
          }
        }}>
          <MdDelete size={18} />
          <span>Eliminar Usuario</span>
        </button>
      </div>
    </div>
  );
};

export default Usuarios;