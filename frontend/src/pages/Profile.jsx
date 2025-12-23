import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import { FaPlus, FaMinus } from 'react-icons/fa'; 
import '../styles/profile.css';

const Profile = () => {
  const defaultUserImg = "/default-user.png"; 
  const defaultBikeImg = "/default-bike.png"; 
  const currentUserEmail = localStorage.getItem("email") || "";
  const currentUserName = localStorage.getItem("name") || "Sin Nombre";
  const currentUserRole = localStorage.getItem("role") || "Usuario";
  const [userImage, setUserImage] = useState(() => {
    const savedImg = localStorage.getItem(`userImage_${currentUserEmail}`);
    return savedImg || defaultUserImg;
  });

  const [bikesList, setBikesList] = useState(() => {
    const savedBikes = localStorage.getItem(`bikesList_${currentUserEmail}`);
    if (savedBikes) {
      return JSON.parse(savedBikes);
    }
    const oldSingleBike = localStorage.getItem('bikeData');
    if (oldSingleBike) {
      const parsedBike = JSON.parse(oldSingleBike);
      const oldBikeImg = localStorage.getItem('bikeImage') || defaultBikeImg;
      return [{ ...parsedBike, image: oldBikeImg }];
    }
    return [];
  });

  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`bikesList_${currentUserEmail}`, JSON.stringify(bikesList));
    }
  }, [bikesList, currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail && userImage !== defaultUserImg) {
      localStorage.setItem(`userImage_${currentUserEmail}`, userImage);
    }
  }, [userImage, currentUserEmail]);

  const userInfoList = [
    `Rol: ${currentUserRole.toUpperCase()}`,
    `Nombre: ${currentUserName}`,
    `Email: ${currentUserEmail}`,
    "Tel: +56 9 1234 5678"
  ];

  const currentBike = bikesList[currentBikeIndex];
  const bikeInfoList = currentBike ? [
    `Marca: ${currentBike.marca}`,
    `Modelo: ${currentBike.modelo}`,
    `Color: ${currentBike.color}`
  ] : [];

  const handleAddBike = () => {
    const newBike = { 
      marca: "Marca Nueva", 
      modelo: "Modelo Nuevo", 
      color: "Color", 
      image: defaultBikeImg
    };
    
    const updatedList = [...bikesList, newBike];
    setBikesList(updatedList);
    setCurrentBikeIndex(updatedList.length - 1);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBike = () => {
    if (bikesList.length === 0) return;

    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta bicicleta?");
    if (confirmDelete) {
      const updatedList = bikesList.filter((_, index) => index !== currentBikeIndex);
      setBikesList(updatedList);
      if (currentBikeIndex >= updatedList.length) {
        setCurrentBikeIndex(Math.max(0, updatedList.length - 1));
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleImageUpdate = (type, newImageUrl) => {
    if (type === 'user') {
      setUserImage(newImageUrl);
    } else if (type === 'bike') {
      if (bikesList.length > 0) {
        const updatedList = [...bikesList];
        updatedList[currentBikeIndex].image = newImageUrl;
        setBikesList(updatedList);
      }
    }
    setHasUnsavedChanges(true); 
  };

  const handleSaveChanges = () => {
    alert("¡Cambios guardados exitosamente!");
    setHasUnsavedChanges(false);
  };

  const bikeIcons = (
    <>
      <button className="float-icon left" onClick={handleAddBike} title="Agregar otra bicicleta">
        <FaPlus />
      </button>
      <button className="float-icon right" onClick={handleDeleteBike} title="Eliminar esta bicicleta">
        <FaMinus />
      </button>
    </>
  );

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
          image={currentBike ? currentBike.image : defaultBikeImg}
          btnText="Cambiar Foto de Bicicleta"
          infoList={bikeInfoList} 
          topIcons={bikeIcons}
          showDots={bikesList.length > 1}
          totalItems={bikesList.length}
          currentIndex={currentBikeIndex}
          onDotClick={(index) => setCurrentBikeIndex(index)}
          
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