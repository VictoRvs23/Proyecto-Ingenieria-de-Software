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
    const response = await fetchProfile();
    setLoading(false);
    setProfileData(response?.data || null);
  };

  useEffect(() => {
    getProfileData();
  }, []);

  return (
    <div className="main-content">
      <h1 className="view-title">PERFIL DE USUARIO</h1>
      
      {loading && <p className="loading-text">Cargando datos...</p>}

      <div className="profile-cards-container">
        {/* TARJETA 1: INFORMACIÓN PERSONAL */}
        <div className="glass-card">
          <div className="profile-avatar-container">
            <img 
              src="/path-to-grumpy-cat.png" 
              alt="Avatar" 
              className="avatar-img" 
            />
          </div>
          
          <button className="action-button-blue">Cambiar Foto de Perfil</button>

          <div className="data-display-area">
            <div className="data-row">
              <span className="data-label">Rol</span>
              <span className="data-value">{profileData?.rol || "Usuario"}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Nombre</span>
              <span className="data-value">{profileData?.nombre || "N/A"}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Email</span>
              <span className="data-value">{profileData?.email || "Cargando..."}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Número Telefónico</span>
              <span className="data-value">{profileData?.telefono || "No registrado"}</span>
            </div>
          </div>
        </div>

        {/* TARJETA 2: INFORMACIÓN DE BICICLETA */}
        <div className="glass-card">
          <div className="bike-icons-top">
            <span className="icon-plus">+</span>
            <span className="icon-refresh">🔄</span>
          </div>

          <div className="profile-avatar-container">
            <img 
              src="/path-to-bike-image.png" 
              alt="Bicicleta" 
              className="avatar-img" 
            />
          </div>

          <button className="action-button-blue">Cambiar Foto de Bicicleta</button>

          <div className="data-display-area">
            <div className="data-row">
              <span className="data-label">Marca</span>
              <span className="data-value">{profileData?.bicicleta?.marca || "Sin asignar"}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Modelo</span>
              <span className="data-value">{profileData?.bicicleta?.modelo || "Sin asignar"}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Color</span>
              <span className="data-value">{profileData?.bicicleta?.color || "Sin asignar"}</span>
            </div>
          </div>

          <div className="pagination-indicator">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN (FOOTER O LATERAL) */}
      <div className="danger-zone">
        <button className="btn-edit" onClick={() => {/* Lógica edit */}}>Editar Perfil</button>
        <button className="btn-delete" onClick={() => {/* Lógica delete */}}>Eliminar Cuenta</button>
      </div>
    </div>
  );
};

export default Profile;