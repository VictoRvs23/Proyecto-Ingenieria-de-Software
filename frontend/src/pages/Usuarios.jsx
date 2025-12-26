import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, createUser, updateUser, deleteUser } from '../services/user.service';
import Swal from 'sweetalert2';
import { deleteDataAlert } from '../helpers/sweetAlert';
import '../styles/usuarios.css';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
      });
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

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
        console.error('Error al actualizar rol:', error);
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

  const handleCreateUser = async (initialValues = {}) => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Nuevo Usuario',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${initialValues.nombre || ''}">
        <input id="swal-email" class="swal2-input" placeholder="Email (debe terminar en @gmail.com)" type="email" value="${initialValues.email || ''}">
        <input id="swal-phone" class="swal2-input" placeholder="Número Telefónico (máx. 10 dígitos)" value="${initialValues.numeroTelefonico || ''}">
        <input id="swal-password" class="swal2-input" placeholder="Contraseña (mín. 8 caracteres)" type="password" value="${initialValues.password || ''}">
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

        return { nombre, email, numeroTelefonico: phone, password };
      }
    });

    if (formValues) {
      try {
        // Limpiar el número telefónico igual que en el registro
        let phoneClean = formValues.numeroTelefonico ? formValues.numeroTelefonico.replace('+', '').replace(/\s/g, '') : "";
        
        if (phoneClean.startsWith('56') && phoneClean.length > 10) {
          phoneClean = phoneClean.slice(2);
        }
        
        const dataForBackend = {
          nombre: formValues.nombre,
          email: formValues.email,
          password: formValues.password,
          numeroTelefonico: phoneClean
        };
        
        await createUser(dataForBackend);
        await fetchUsers();
        
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario se ha creado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.errorDetails || 'No se pudo crear el usuario';
        
        const result = await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: errorMessage,
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#1565C0',
          cancelButtonColor: '#d33',
        });
        
        if (result.isConfirmed) {
          handleCreateUser(formValues);
        }
      }
    }
  };

  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${user.nombre || ''}">
        <input id="swal-email" class="swal2-input" placeholder="Email" type="email" value="${user.email}">
        <input id="swal-phone" class="swal2-input" placeholder="Número Telefónico" value="${user.numeroTelefonico || ''}">
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
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron actualizar los datos del usuario',
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
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario',
        });
      }
    });
  };

  if (userRole !== 'admin' && userRole !== 'adminBicicletero') {
    return null;
  }

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>USUARIOS</h1>
      </div>

      <div className="usuarios-table-wrapper">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Numero Telefonico</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No hay usuarios registrados</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id}
                  className={selectedUserId === user.id ? 'selected-row' : ''}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <td>{user.id}</td>
                  <td>{user.nombre || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.numeroTelefonico || 'N/A'}</td>
                  <td>
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
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

      <div className="usuarios-actions">
        <button className="btn-action btn-crear" onClick={handleCreateUser}>
          Crear Usuario
        </button>
        <button className={`btn-action btn-editar ${selectedUserId ? 'btn-editar-active' : ''}`} onClick={() => {
          if (users.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin usuarios',
              text: 'No hay usuarios para editar',
            });
          } else if (!selectedUserId) {
            Swal.fire({
              icon: 'info',
              title: 'Selecciona un usuario',
              text: 'Por favor, selecciona un usuario de la tabla para editarlo',
            });
          } else {
            const user = users.find(u => u.id === selectedUserId);
            handleEditUser(user);
          }
        }}>
          Editar Datos
        </button>
        <button className={`btn-action btn-eliminar ${selectedUserId ? 'btn-eliminar-active' : ''}`} onClick={() => {
          if (users.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin usuarios',
              text: 'No hay usuarios para eliminar',
            });
          } else if (!selectedUserId) {
            Swal.fire({
              icon: 'info',
              title: 'Selecciona un usuario',
              text: 'Por favor, selecciona un usuario de la tabla para eliminarlo',
            });
          } else {
            handleDeleteUser(selectedUserId);
          }
        }}>
          Eliminar Usuario
        </button>
      </div>
    </div>
  );
};

export default Usuarios;
