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
  
  const [imageKey, setImageKey] = useState(Date.now());
  
  const [bikesList, setBikesList] = useState([]);
  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const hasBikes = bikesList.length > 0;

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Sin teléfono';
    const phoneStr = String(phone);
    
    if (phoneStr.startsWith('9') && phoneStr.length === 9) {
      return `9 ${phoneStr.slice(1)}`;
    } else if (phoneStr.length === 8) {
      return `9 ${phoneStr}`;
    }
    return phoneStr;
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();

      const userRes = await getPrivateProfile(); 
      const u = userRes.data || userRes; 

      if (u) {
        const data = u.userData || u.data || u; 
        console.log('📸 Datos del usuario recibidos:', data);
        console.log('📸 userImage del servidor:', data.userImage);
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

  const handleEditUserInfo = async () => {
    let phoneForEditing = userData.phone ? String(userData.phone).replace(/\D/g, '') : '';
    
    if (phoneForEditing.startsWith('9') && phoneForEditing.length === 9) {
      phoneForEditing = phoneForEditing.substring(1);
    }
    
    const { value: formValues } = await Swal.fire({
      title: 'Editar Información',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${userData.name || ''}">
        <input id="swal-phone" class="swal2-input" placeholder="Número Telefónico (8 dígitos)" value="${phoneForEditing}" maxlength="8">
        <small style="color: #666; font-size: 0.9em; display: block; margin-top: 5px;">
          Ingresa 8 dígitos (el 9 inicial se agregará automáticamente)
        </small>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1565C0',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value;
        const phone = document.getElementById('swal-phone').value;

        if (!nombre || !phone) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }
        
        if (phone.length !== 8 || !/^[0-9]{8}$/.test(phone)) {
          Swal.showValidationMessage('El número telefónico debe tener exactamente 8 dígitos');
          return false;
        }

        return { nombre, numeroTelefonico: phone };
      }
    });

    if (formValues) {
      try {
        let phoneClean = formValues.numeroTelefonico ? formValues.numeroTelefonico.replace(/\D/g, '') : "";
        
        if (phoneClean.length === 8) {
          phoneClean = '9' + phoneClean;
        }
        
        const dataForBackend = {
          nombre: formValues.nombre,
          numeroTelefonico: phoneClean
        };
        
        await updatePrivateProfile(dataForBackend);
        
        await Swal.fire({
          icon: 'success',
          title: 'Información actualizada',
          text: 'Tus datos se han actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        await fetchData();
      } catch (error) {
        console.error("Error al actualizar información:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.errorDetails || 'No se pudieron actualizar los datos';
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
      }
    }
  };

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
            
            setImageKey(Date.now());
            
            await Swal.fire({ 
                title: '¡Éxito!', 
                text: 'Foto de perfil actualizada', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
            const currentOrder = bikesList.map(b => b.id);
            
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
                
                const orderedBikes = currentOrder
                    .map(id => formattedBikes.find(b => b.id === id))
                    .filter(Boolean);
                
                const newBikes = formattedBikes.filter(b => !currentOrder.includes(b.id));
                const finalBikes = [...orderedBikes, ...newBikes];
                
                setBikesList(finalBikes);
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
            `Tel: ${formatPhoneNumber(userData.phone)}`
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

      <div className="profile-actions">
        <button className="btn-edit-profile" onClick={handleEditUserInfo}>
          Editar Información
        </button>
      </div>
    </div>
  );
};

export default Profile;