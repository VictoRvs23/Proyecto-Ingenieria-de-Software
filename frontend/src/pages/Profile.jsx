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
    role: "", name: "", email: "", phone: "", image: defaultUserImg 
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
      const userRes = await getPrivateProfile(); 
      const u = userRes.data || userRes; 

      if (u) {
        const data = u.userData || u.data || u; 
        setUserData({
            name: data.nombre || "Usuario",
            email: data.email || "",
            role: data.role || "user",
            phone: data.numeroTelefonico || "Sin teléfono", 
            image: data.userImage ? `${SERVER_URL}${data.userImage}` : defaultUserImg
        });
      }

      const bikesRes = await getBikes();
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

  const handleAddBike = () => navigate('/home/agregar-bicicleta');

  const bikeInfoList = hasBikes ? [
    `Marca: ${bikesList[currentBikeIndex].marca || "N/A"}`, 
    `Modelo: ${bikesList[currentBikeIndex].modelo || "N/A"}`,
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
          infoList={[`Rol: ${userData.role}`, `Nombre: ${userData.name}`, `Email: ${userData.email}`, `Tel: ${userData.phone}`]}
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
                <button className="float-icon left" onClick={handleAddBike}><FaPlus /></button>
                <button className="float-icon right" onClick={() => {}}><FaMinus /></button>
              </>
            ) : null}
            showDots={bikesList.length > 1}
            totalItems={bikesList.length}
            currentIndex={currentBikeIndex}
            onDotClick={setCurrentBikeIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;