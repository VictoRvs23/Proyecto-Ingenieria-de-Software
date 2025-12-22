import React from 'react';
import "@styles/home.css"; // Importamos los estilos específicos

const Home = () => {
  return (
    <div className="home-container">
      {/* Título INICIO con la tipografía correcta */}
      <h1 className="home-title">INICIO</h1>

      {/* Contenedor tipo "Card" para la imagen */}
      <div className="home-banner-card">
        <img 
          src="/inicio-banner.png" 
          alt="Bienvenida al Bicicletero" 
          className="home-image" 
        />
      </div>
    </div>
  );
};

export default Home;