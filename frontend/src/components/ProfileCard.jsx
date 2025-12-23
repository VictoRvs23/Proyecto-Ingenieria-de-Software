import React, { useRef } from 'react';
import '../styles/profile.css';

const ProfileCard = ({ 
  image, 
  btnText, 
  infoList, 
  topIcons, 
  showDots,
  totalItems, 
  currentIndex,
  onDotClick,   
  onImageChange,
  onAddClick 
}) => {
  const fileInputRef = useRef(null);
  const hasInfo = infoList && infoList.length > 0 && infoList[0] !== "No tienes bicicletas registradas";

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && onImageChange) {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result, file);
      event.target.value = ""; 
    };
    reader.readAsDataURL(file);
  }
};

  return (
    <div className="profile-card">
      {topIcons && <div className="card-top-icons">{topIcons}</div>}

      <div className="image-circle">
        <img 
          src={image || '/default-user.png'} 
          alt="Avatar" 
          style={{ opacity: 1, objectFit: 'cover' }}
          onError={(e) => {
            console.error('Error cargando imagen:', image);
            e.target.src = '/default-user.png';
          }}
        />
      </div>
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />
      {btnText && (
        <button className="action-btn" onClick={handleButtonClick} style={{ zIndex: 5 }}>
          {btnText}
        </button>
      )}
      <div className="info-box" style={{ justifyContent: hasInfo ? 'flex-start' : 'center' }}>
        {hasInfo ? (
          infoList.map((text, index) => (
            <span key={index} className="info-text">{text}</span>
          ))
        ) : (
          <button 
            className="save-changes-btn"
            onClick={onAddClick}
            style={{ backgroundColor: '#1b7e3c', color: 'white', borderRadius: '10px', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Agregar bicicleta
          </button>
        )}
      </div>
      {hasInfo && showDots && totalItems > 1 && (
        <div className="pagination-dots">
          {Array.from({ length: totalItems }).map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onDotClick(index)} 
              style={{ cursor: 'pointer' }} 
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;