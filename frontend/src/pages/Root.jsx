import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/styles.css'; 
import Notificacion from '../components/Notificacion';

const Root = () => {
  return (
    <div className="app-layout">
      
      <Sidebar />

      <Notificacion />

      <main className="content-area">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Root;