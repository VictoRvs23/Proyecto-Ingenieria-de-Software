import React from 'react';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">INICIO</h1>
      
      <div className="home-banner-card">
        <img 
          src="/inicioB.png" 
          alt="Bienvenida al Bicicletero" 
          className="home-image"
          onError={(e) => {
            console.error('Error cargando imagen de inicio');
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default Home;