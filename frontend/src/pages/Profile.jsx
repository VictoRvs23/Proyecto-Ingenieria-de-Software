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
  
  const [imageKey, setImageKey] = useState(Date.now()); // Key para forzar re-render
  
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
      const timestamp = Date.now(); // Usar Date.now() para un timestamp más único

      const userRes = await getPrivateProfile(); 
      const u = userRes.data || userRes; 

      if (u) {
        const data = u.userData || u.data || u; 
        console.log('📸 Datos del usuario recibidos:', data);
        console.log('📸 userImage del servidor:', data.userImage);
        
        // Verificar si la imagen es válida y no es null/undefined/vacía
        const hasValidUserImage = data.userImage && data.userImage.trim() !== '' && data.userImage !== 'null';
        const imageUrl = hasValidUserImage
          ? `${SERVER_URL}${data.userImage}?v=${timestamp}&r=${Math.random()}` 
          : defaultUserImg;
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
          const formattedBikes = bikesData.map(b => {
              // Verificar si la imagen de bicicleta es válida
              const hasValidBikeImage = b.bikeImage && 
                                        b.bikeImage.trim() !== '' && 
                                        b.bikeImage !== 'null' && 
                                        !b.bikeImage.includes('default-bike.png');
              return {
                  ...b,
                  image: hasValidBikeImage 
                    ? `${SERVER_URL}${b.bikeImage}?v=${timestamp}&r=${Math.random()}` 
                    : defaultBikeImg
              };
          });
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
    if (!file) {
      console.log('❌ No se seleccionó archivo');
      return;
    }

    console.log('🔧 Iniciando actualización de imagen:', { 
      type, 
      fileName: file.name,
      fileSize: file.size, 
      fileType: file.type 
    });

    const formData = new FormData();
    formData.append('image', file);

    console.log('📦 FormData creado correctamente');
    
    try {
        if (type === 'user') {
            console.log('👤 Actualizando imagen de usuario...');
            
            console.log('📤 Enviando al servidor...');
            const response = await updatePrivateProfile(formData); 
            console.log('✅ Respuesta del servidor:', response);
            
            // Forzar cambio de key ANTES de mostrar el success
            setImageKey(Date.now());
            
            await Swal.fire({ 
                title: '¡Éxito!', 
                text: 'Foto de perfil actualizada', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });

            // Esperar a que el servidor guarde el archivo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Forzar recarga completa
            await fetchData();
        } else if (type === 'bike') {
            console.log('🚴 Actualizando imagen de bicicleta...');
            const bikeToUpdate = bikesList[currentBikeIndex];
            if (!bikeToUpdate) {
              console.log('❌ No se encontró la bicicleta');
              return;
            }
            
            console.log('🚴 Bicicleta a actualizar:', bikeToUpdate.id);
            const currentBikeId = bikeToUpdate.id;
            // Guardar el orden actual de IDs
            const currentOrder = bikesList.map(b => b.id);
            
            // Actualizar preview inmediatamente
            setBikesList(prev => prev.map((bike) => 
                bike.id === currentBikeId
                    ? { ...bike, image: previewUrl }
                    : bike
            ));
            
            console.log('📤 Enviando al servidor...');
            const response = await updateBikeImage(currentBikeId, formData); 
            console.log('✅ Respuesta del servidor:', response);
            
            await Swal.fire({ 
                title: '¡Éxito!', 
                text: 'Foto de bicicleta actualizada', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });

            // Recargar datos pero mantener la posición
            await new Promise(resolve => setTimeout(resolve, 500));
            const timestamp = Date.now();
            const bikesRes = await getBikes();
            const bikesData = Array.isArray(bikesRes) ? bikesRes : (bikesRes.data || []);
            
            if (bikesData) {
                const formattedBikes = bikesData.map(b => {
                    const hasValidBikeImage = b.bikeImage && 
                                            b.bikeImage.trim() !== '' && 
                                            b.bikeImage !== 'null' && 
                                            !b.bikeImage.includes('default-bike.png');
                    return {
                        ...b,
                        image: hasValidBikeImage 
                          ? `${SERVER_URL}${b.bikeImage}?v=${timestamp}&r=${Math.random()}` 
                          : defaultBikeImg
                    };
                });
                
                // Restaurar el orden original usando currentOrder
                const orderedBikes = currentOrder
                    .map(id => formattedBikes.find(b => b.id === id))
                    .filter(Boolean); // Filtrar nulls por si se eliminó alguna
                
                // Agregar bicicletas nuevas al final si las hay
                const newBikes = formattedBikes.filter(b => !currentOrder.includes(b.id));
                const finalBikes = [...orderedBikes, ...newBikes];
                
                setBikesList(finalBikes);
                
                // El índice se mantiene igual porque el orden no cambió
            }
        }
    } catch (error) {
        console.error("❌ Error completo:", error);
        console.error("❌ Respuesta del servidor:", error.response);
        console.error("❌ Datos del error:", error.response?.data);
        console.error("❌ Status:", error.response?.status);
        
        const serverMessage = error.response?.data?.message || error.response?.data?.error;
        const fallbackMessage = 'Error al actualizar la imagen. Verifica el formato del archivo.';

        await Swal.fire({ 
            title: 'Error de actualización', 
            text: serverMessage || fallbackMessage, 
            icon: 'error' 
        });
        
        // Revertir preview en caso de error
        await fetchData();
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
          key={`user-profile-${imageKey}`}
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