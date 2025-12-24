import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../services/user.service';
import Swal from 'sweetalert2';
import '../styles/usuarios.css';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

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
                <tr key={user.id}>
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
    </div>
  );
};

export default Usuarios;
