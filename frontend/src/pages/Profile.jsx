import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import { FaPlus, FaMinus } from 'react-icons/fa'; 
import '../styles/profile.css';
import { getBikes, deleteBike, updateBikeImage } from '../services/bike.service';
import { getPrivateProfile, updatePrivateProfile } from '../services/profile.service'; 
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 

const SERVER_URL = "http://localhost:3000"; 

const Profile = () => {
  const navigate = useNavigate(); 
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

  const hasBikes = bikesList.length > 0;

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();

      const userRes = await getPrivateProfile(); 
      const u = userRes.data || userRes; 

      if (u) {
        const data = u.userData || u.data || u; 
        console.log('📸 Datos del usuario recibidos:', data);
        console.log('📸 userImage del servidor:', data.userImage);
        const imageUrl = data.userImage ? `${SERVER_URL}${data.userImage}?t=${timestamp}` : defaultUserImg;
        console.log('📸 URL construida:', imageUrl);
        
        setUserData({
            name: data.nombre || "Usuario",
            email: data.email || "",
            role: data.role || "user",
            phone: data.numeroTelefonico || "Sin teléfono", 
            image: imageUrl
        });
      }

      const bikesRes = await getBikes();
      const bikesData = Array.isArray(bikesRes) ? bikesRes : (bikesRes.data || []);
      
      if (bikesData) {
          const formattedBikes = bikesData.map(b => ({
              ...b,
              image: b.bikeImage ? `${SERVER_URL}${b.bikeImage}?t=${timestamp}` : defaultBikeImg
          }));
          setBikesList(formattedBikes);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBike = () => navigate('/home/agregar-bicicleta');

  const handleDeleteBike = async () => {
    const bikeToDelete = bikesList[currentBikeIndex];
    if (!bikeToDelete) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la bicicleta ${bikeToDelete.brand} ${bikeToDelete.model}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteBike(bikeToDelete.id);
        
        if (response) {
          await Swal.fire({
            title: '¡Eliminada!',
            text: 'La bicicleta ha sido eliminada.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          // Ajustar el índice si es necesario
          if (currentBikeIndex >= bikesList.length - 1) {
            setCurrentBikeIndex(Math.max(0, bikesList.length - 2));
          }

          await fetchData();
        }
      } catch (error) {
        console.error("Error al eliminar bicicleta:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la bicicleta.',
          icon: 'error'
        });
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
            
            if (response) {
                setUserData(prev => ({
                    ...prev,
                    image: previewUrl
                }));
                
                await Swal.fire({ 
                    title: '¡Éxito!', 
                    text: 'Foto de perfil actualizada', 
                    icon: 'success', 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                await fetchData(); 
            }
        } else if (type === 'bike') {
            const bikeToUpdate = bikesList[currentBikeIndex];
            if (!bikeToUpdate) return;
            
            const response = await updateBikeImage(bikeToUpdate.id, formData); 
            
            if (response) {
                setBikesList(prev => prev.map((bike, idx) => 
                    idx === currentBikeIndex 
                        ? { ...bike, image: previewUrl }
                        : bike
                ));
                
                await Swal.fire({ 
                    title: '¡Éxito!', 
                    text: 'Foto de bicicleta actualizada', 
                    icon: 'success', 
                    timer: 1500, 
                    showConfirmButton: false 
                });

                await fetchData(); 
            }
        }
    } catch (error) {
        console.error("Detalles del error del servidor:", error.response?.data);
        
        const serverMessage = error.response?.data?.message;
        const fallbackMessage = 'El servidor no reconoció los datos. Verifica el formato del archivo.';

        Swal.fire({ 
            title: 'Error de actualización', 
            text: serverMessage || fallbackMessage, 
            icon: 'error' 
        });
    }
  };

  const bikeInfoList = hasBikes ? [
    `Marca: ${bikesList[currentBikeIndex].brand || "N/A"}`, 
    `Modelo: ${bikesList[currentBikeIndex].model || "N/A"}`,
    `Color: ${bikesList[currentBikeIndex].color || "N/A"}`
  ] : ["No tienes bicicletas registradas"];

  if (loading) return <div className="profile-container"><h2>Cargando...</h2></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">PERFIL DE USUARIO</h1>

      <div className="profile-cards-grid">
        <ProfileCard 
          image={userData.image}
          btnText="Cambiar Foto de Perfil"
          infoList={[
            `Rol: ${userData.role.toUpperCase()}`, 
            `Nombre: ${userData.name}`, 
            `Email: ${userData.email}`, 
            `Tel: ${userData.phone}`
          ]}
          onImageChange={(preview, file) => handleImageUpdate('user', preview, file)}
        />

        <div className="bike-card-wrapper">
          {!hasBikes && (
            <div className="bike-overlay">
              <button className="save-changes-btn" onClick={handleAddBike}>
                Agregar bicicleta
              </button>
            </div>
          )}

          <ProfileCard 
            image={hasBikes ? bikesList[currentBikeIndex].image : defaultBikeImg}
            btnText={hasBikes ? "Cambiar Foto de Bicicleta" : ""} 
            infoList={bikeInfoList} 
            topIcons={hasBikes ? (
              <>
                <button className="float-icon left" onClick={handleAddBike} title="Agregar otra">
                    <FaPlus />
                </button>
                <button className="float-icon right" onClick={handleDeleteBike} title="Eliminar actual">
                    <FaMinus />
                </button>
              </>
            ) : null}
            showDots={bikesList.length > 1}
            totalItems={bikesList.length}
            currentIndex={currentBikeIndex}
            onDotClick={setCurrentBikeIndex}
            onImageChange={(preview, file) => handleImageUpdate('bike', preview, file)}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;