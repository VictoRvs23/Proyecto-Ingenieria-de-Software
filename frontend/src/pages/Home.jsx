import { useState } from 'react';
import { getProfile, updateProfile, eliminateProfile } from '../services/profile.service';

const Home = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(false); 
  const [deleting, setDeleting] = useState(false); 
  const [formData, setFormData] = useState({ email: '', password: '' }); 
  const [statusMessage, setStatusMessage] = useState(null);

  const handleGetProfile = async () => {
    setLoading(true);
    setStatusMessage(null);
    setEditing(false);
    setDeleting(false);

    const data = await getProfile();
    setLoading(false);

    if (data && typeof data === 'object') {
      if (data.userData) {
        setProfileData({
          message: data.message,
          ...data.userData
        });
        setFormData({ email: data.userData.email, password: '' }); 
      } else {
        setProfileData(data);
      }
    } else {
      setProfileData({ error: 'No se pudo obtener el perfil' });
    }
  };

  const handleEditProfile = async () => {
    setLoading(true);
    setStatusMessage(null);
    const response = await updateProfile(formData);
    setLoading(false);

    if (response) {
      setStatusMessage({ type: 'success', text: response.message || 'Perfil actualizado correctamente' });
      setEditing(false);
      handleGetProfile(); 
    } else {
      setStatusMessage({ type: 'error', text: 'Error al actualizar perfil' });
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    setStatusMessage(null);
    const response = await eliminateProfile();
    setLoading(false);

    if (response) {
      setStatusMessage({ type: 'success', text: response.message || 'Perfil eliminado correctamente' });
      setProfileData(null);
      setDeleting(false);
    } else {
      setStatusMessage({ type: 'error', text: 'Error al eliminar perfil' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-2xl transform transition-all hover:scale-105">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Página de Inicio
        </h1>

        <button
          onClick={handleGetProfile}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Obtener Perfil'}
        </button>

        {profileData && profileData.data && profileData.data.userData && (
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border-2 border-purple-300 flex flex-col items-start gap-4">
                <p className="text-2xl font-bold text-purple-700 mb-2">Datos del usuario</p>
                <div className="w-full flex flex-col gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-lg font-semibold text-gray-800 bg-purple-50 rounded px-2 py-1">{profileData.data.userData.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Password (encriptada)</span>
                    <span className="text-lg font-mono text-gray-700 bg-purple-50 rounded px-2 py-1 break-all">{profileData.data.userData.password}</span>
                  </div>
                </div>
              </div>
              {!editing && !deleting && (
                <div className="flex gap-4 mt-4 w-full max-w-md">
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-xl transition-all duration-300 flex-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleting(true)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition-all duration-300 flex-1"
                  >
                    Eliminar
                  </button>
                </div>
              )}
              {editing && (
                <div className="w-full max-w-md bg-purple-50 p-4 rounded-xl flex flex-col gap-4 mt-4">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nuevo email"
                    className="p-2 rounded border border-gray-300 w-full"
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nueva contraseña"
                    className="p-2 rounded border border-gray-300 w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditProfile}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl flex-1"
                      disabled={loading}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl flex-1"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {deleting && (
                <div className="w-full max-w-md bg-red-100 p-4 rounded-xl flex flex-col gap-4 mt-4">
                  <p className="text-red-700 font-semibold">¿Seguro que desea eliminar su perfil?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteProfile}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl flex-1"
                      disabled={loading}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleting(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl flex-1"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {statusMessage && (
                <div
                  className={`w-full p-3 rounded-xl text-center font-semibold ${
                    statusMessage.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  } mt-4`}
                >
                  {statusMessage.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
