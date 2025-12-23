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
      {hasInfo && topIcons && <div className="card-top-icons">{topIcons}</div>}

      <div className="image-circle">
        <img src={image} alt="Avatar" style={{ opacity: hasInfo ? 1 : 0.5 }} />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />
      {hasInfo && (
        <button className="action-btn" onClick={handleButtonClick}>
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
            onClick={onAddClick}
            style={{
              backgroundColor: '#1b7e3c',
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