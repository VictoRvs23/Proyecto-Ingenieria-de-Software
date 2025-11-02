import { useEffect, useState } from "react";
import { useGetProfile } from "@hooks/profile/useGetProfile.jsx";
import { updateProfile, eliminateProfile } from "../services/profile.service";
import "@styles/profile.css";

const Profile = () => {
  const { fetchProfile } = useGetProfile();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);


  const getProfileData = async () => {
    setLoading(true);
    const profileData = await fetchProfile();
    setLoading(false);
    setProfileData(profileData?.data || null);
  };

  
  useEffect(() => {
    getProfileData();
  }, []);


  const handleEditProfile = async () => {
    if (!profileData) return;

    const newEmail = prompt("Ingrese el nuevo email:", profileData.email) || profileData.email;
    const newPassword = prompt("Ingrese la nueva contraseña (se encriptará):", "") || undefined;

    const updatedData = { email: newEmail };
    if (newPassword) updatedData.password = newPassword;

    setLoading(true);
    const response = await updateProfile(updatedData);
    setLoading(false);

    if (response) {
      alert(response.message || "Perfil actualizado correctamente");
      getProfileData();
    }
  };


  const handleDeleteProfile = async () => {
    if (!profileData) return;

    const confirmDelete = window.confirm(
      "¿Está seguro de eliminar su perfil? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    setLoading(true);
    const response = await eliminateProfile();
    setLoading(false);

    if (response) {
      alert(response.message || "Perfil eliminado correctamente");
      setProfileData(null); 
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-header">Perfil del Usuario</h2>

      {loading && <p className="profile-message">Cargando...</p>}

      {profileData ? (
        <div className="profile-card">
          <div className="profile-info">
            <span className="label">Email</span>
            <span className="value">{profileData.email}</span>

            <span className="label">Password (encriptada)</span>
            <span className="value">{profileData.password}</span>
          </div>

          <div className="profile-actions">
            <button className="edit" onClick={handleEditProfile} disabled={loading}>
              Editar
            </button>
            <button className="delete" onClick={handleDeleteProfile} disabled={loading}>
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        !loading && <p className="profile-message">No hay perfil cargado.</p>
      )}
    </div>
  );
};

export default Profile;
