import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
// CAMBIO: Importamos FaMinus en lugar de FaSyncAlt
import { FaPlus, FaMinus } from 'react-icons/fa'; 
import '../styles/profile.css';

const Profile = () => {
  const defaultUserImg = "/default-user.png"; 
  const defaultBikeImg = "/default-bike.png"; 

  const [userImage, setUserImage] = useState(() => {
    return localStorage.getItem('userImage') || defaultUserImg;
  });

  const [bikeImage, setBikeImage] = useState(() => {
    return localStorage.getItem('bikeImage') || defaultBikeImg;
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // === DATOS ===
  const [userData, setUserData] = useState({ role: "", name: "", email: "" });

  const [bikeData, setBikeData] = useState(() => {
    const savedData = localStorage.getItem('bikeData');
    return savedData ? JSON.parse(savedData) : null;
  });

  useEffect(() => {
    const role = localStorage.getItem("role") || "Usuario";
    const name = localStorage.getItem("name") || "Sin Nombre";
    const email = localStorage.getItem("email") || "Sin Email";
    setUserData({ role, name, email });
  }, []);

  const userInfoList = [
    `Rol: ${userData.role.toUpperCase()}`,
    `Nombre: ${userData.name}`,
    `Email: ${userData.email}`,
    "Tel: +56 9 1234 5678"
  ];

  const bikeInfoList = bikeData ? [
    `Marca: ${bikeData.marca}`,
    `Modelo: ${bikeData.modelo}`,
    `Color: ${bikeData.color}`
  ] : [];

  const handleAddBike = () => {
    const newBike = { marca: "Trek", modelo: "Marlin 5", color: "Negro" };
    setBikeData(newBike);
    localStorage.setItem('bikeData', JSON.stringify(newBike));
    setBikeImage(defaultBikeImg);
    localStorage.setItem('bikeImage', defaultBikeImg);
  };
  const handleDeleteBike = () => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar tu bicicleta?");
    if (confirmDelete) {
      setBikeData(null); 
      localStorage.removeItem('bikeData');
      
      setBikeImage(defaultBikeImg); 
      localStorage.removeItem('bikeImage');
      
      alert("Bicicleta eliminada.");
    }
  };

  const bikeIcons = (
    <>
      <button className="float-icon left"><FaPlus /></button>
      <button className="float-icon right" onClick={handleDeleteBike} title="Eliminar bicicleta">
        <FaMinus />
      </button>
    </>
  );
  const handleImageUpdate = (type, newImageUrl) => {
    if (type === 'user') {
      setUserImage(newImageUrl);
      localStorage.setItem('userImage', newImageUrl);
    } else if (type === 'bike') {
      if (bikeData) {
         setBikeImage(newImageUrl);
         localStorage.setItem('bikeImage', newImageUrl);
      }
    }
    setHasUnsavedChanges(true); 
  };

  const handleSaveChanges = () => {
    alert("¡Cambios guardados exitosamente!");
    setHasUnsavedChanges(false);
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">PERFIL DE USUARIO</h1>

      <div className="profile-cards-grid">
        <ProfileCard 
          image={userImage}
          btnText="Cambiar Foto de Perfil"
          infoList={userInfoList}
          onImageChange={(newUrl) => handleImageUpdate('user', newUrl)}
        />

        <ProfileCard 
          image={bikeImage}
          btnText="Cambiar Foto de Bicicleta"
          infoList={bikeInfoList} 
          topIcons={bikeIcons}
          showDots={true}
          onImageChange={(newUrl) => handleImageUpdate('bike', newUrl)}
          onAddClick={handleAddBike} 
        />
      </div>

      {hasUnsavedChanges && (
        <div className="save-changes-container">
          <button className="save-changes-btn" onClick={handleSaveChanges}>
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;