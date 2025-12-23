import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import { FaPlus, FaMinus } from 'react-icons/fa'; 
import '../styles/profile.css';
import { getBikes, createBike, deleteBike, updateBikeImage } from '../services/bike.service';
import { getPrivateProfile, updatePrivateProfile } from '../services/profile.service'; 

const SERVER_URL = "http://localhost:3000"; 

const Profile = () => {
  const defaultUserImg = "/default-user.png"; 
  const defaultBikeImg = "/default-bike.png"; 
  const [userData, setUserData] = useState({ 
    role: "", 
    name: "", 
    email: "", 
    phone: "",
    image: defaultUserImg 
  });
  
  const [bikesList, setBikesList] = useState([]);
  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const userRes = await getPrivateProfile(); 
      
      console.log("1. RESPUESTA DEL SERVIDOR (RAW):", userRes);
      
      const u = userRes.data || userRes; 
      console.log("2. DATOS EXTRAÍDOS (u):", u);

      if (u) {
        const data = u.userData || u.data || u; 

        console.log("3. DATOS FINALES PARA MOSTRAR:", data);

        setUserData({
            name: data.nombre || "Usuario",
            email: data.email || "",
            role: data.role || "user",
            phone: data.numeroTelefonico || "Sin teléfono", 
            
            image: data.userImage ? `${SERVER_URL}${data.userImage}` : defaultUserImg
        });
      }

      const bikesRes = await getBikes();
      console.log("4. RESPUESTA BICICLETAS:", bikesRes);

      const bikesData = Array.isArray(bikesRes) ? bikesRes : (bikesRes.data || []);
      
      if (bikesData) {
          const formattedBikes = bikesData.map(b => ({
              ...b,
              image: b.bikeImage ? `${SERVER_URL}${b.bikeImage}` : defaultBikeImg
          }));
          setBikesList(formattedBikes);
      }

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBike = async () => {
    const newBikeData = { marca: "Marca Nueva", modelo: "Modelo Nuevo", color: "Color" };
    try {
        const response = await createBike(newBikeData);
        const createdBike = response.data || response; 
        if (createdBike) {
            createdBike.image = defaultBikeImg;
            const updatedList = [...bikesList, createdBike];
            setBikesList(updatedList);
            setCurrentBikeIndex(updatedList.length - 1);
            alert("¡Bicicleta agregada!");
        }
    } catch (error) {
        alert("Error al crear bicicleta: " + error.message);
    }
  };

  const handleDeleteBike = async () => {
    if (bikesList.length === 0) return;
    const bikeToDelete = bikesList[currentBikeIndex];

    if (window.confirm("¿Estás seguro de eliminar esta bicicleta?")) {
        try {
            await deleteBike(bikeToDelete.id);
            const updatedList = bikesList.filter((_, index) => index !== currentBikeIndex);
            setBikesList(updatedList);
            if (currentBikeIndex >= updatedList.length) {
                setCurrentBikeIndex(Math.max(0, updatedList.length - 1));
            }
            alert("Bicicleta eliminada.");
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    }
  };

  const handleImageUpdate = async (type, previewUrl, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
        if (type === 'user') {
            const response = await updatePrivateProfile(formData); 
            const data = response.data || response;
            if(data) {
                 const serverImg = data.userData?.userImage || data.userImage;
                 setUserData(prev => ({ 
                     ...prev, 
                     image: serverImg ? `${SERVER_URL}${serverImg}` : previewUrl 
                 }));
                 alert("Foto de perfil actualizada.");
            }
        } else if (type === 'bike') {
            const bikeToUpdate = bikesList[currentBikeIndex];
            if (!bikeToUpdate) return;
            const response = await updateBikeImage(bikeToUpdate.id, formData);
            const data = response.data || response;
            if (data) {
                const updatedList = [...bikesList];
                const serverImg = data.bikeImage;
                updatedList[currentBikeIndex].image = serverImg ? `${SERVER_URL}${serverImg}` : previewUrl;
                setBikesList(updatedList);
                alert("Foto de bicicleta actualizada.");
            }
        }
    } catch (error) {
        console.error("Error subiendo imagen", error);
        alert("Ocurrió un error al subir la imagen.");
    }
  };

  const userInfoList = [
    `Rol: ${userData.role ? userData.role.toUpperCase() : "USUARIO"}`,
    `Nombre: ${userData.name}`,
    `Email: ${userData.email}`,
    `Tel: ${userData.phone}` 
  ];

  const currentBike = bikesList[currentBikeIndex];
  const bikeInfoList = currentBike ? [
    `Marca: ${currentBike.marca || currentBike.brand}`, 
    `Modelo: ${currentBike.modelo || currentBike.model}`,
    `Color: ${currentBike.color}`
  ] : [];

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

  if (loading) return <div className="profile-container"><h2 style={{textAlign:'center', marginTop:'50px'}}>Cargando...</h2></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">PERFIL DE USUARIO</h1>

      <div className="profile-cards-grid">
        <ProfileCard 
          image={userData.image}
          btnText="Cambiar Foto de Perfil"
          infoList={userInfoList}
          onImageChange={(preview, file) => handleImageUpdate('user', preview, file)}
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
          onImageChange={(preview, file) => handleImageUpdate('bike', preview, file)}
          onAddClick={handleAddBike}
        />
      </div>
    </div>
  );
};

export default Profile;