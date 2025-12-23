import React, { useRef } from 'react';
import '../styles/profile.css';

const ProfileCard = ({ 
  image, 
  btnText, 
  infoList, 
  topIcons, 
  showDots,
  onImageChange,
  onAddClick // <--- NUEVA PROP: Función para agregar cuando está vacío
}) => {
  const fileInputRef = useRef(null);

  // Validamos si hay información para mostrar
  const hasInfo = infoList && infoList.length > 0;

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onImageChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-card">
      {/* Solo mostramos iconos superiores si hay información (bici existe) */}
      {hasInfo && topIcons && <div className="card-top-icons">{topIcons}</div>}

      <div className="image-circle">
        {/* Si no hay info, usamos una imagen placeholder genérica o la que venga */}
        <img src={image} alt="Avatar" style={{ opacity: hasInfo ? 1 : 0.5 }} />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Solo mostramos el botón de cambiar foto SI hay información */}
      {hasInfo && (
        <button className="action-btn" onClick={handleButtonClick}>
          {btnText}
        </button>
      )}
      
      {/* CUADRO GRIS DE INFORMACIÓN */}
      <div className="info-box" style={{ justifyContent: hasInfo ? 'flex-start' : 'center' }}>
        {hasInfo ? (
          // CASO 1: SI HAY DATOS, mostramos la lista normal
          infoList.map((text, index) => (
            <span key={index} className="info-text">{text}</span>
          ))
        ) : (
          // CASO 2: NO HAY DATOS (Estado vacío), mostramos botón de agregar
          // Usamos un estilo en línea rápido para centrarlo, o puedes crear una clase CSS
          <button 
            onClick={onAddClick}
            style={{
              backgroundColor: '#1b7e3c', // Mismo verde que el login
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Agregar bicicleta
          </button>
        )}
      </div>

      {hasInfo && showDots && (
        <div className="pagination-dots">
          <div className="dot active"></div>
          <div className="dot"></div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;