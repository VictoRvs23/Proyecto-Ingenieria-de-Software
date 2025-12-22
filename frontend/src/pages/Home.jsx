import React from 'react';
import "@styles/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">INICIO</h1>
      
      <div className="home-banner-card">
        <img 
          src="/inicioB.png" 
          alt="Bienvenida al Bicicletero" 
          className="home-image" 
        />
      </div>
    </div>
  );
};

export default Home;