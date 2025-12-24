import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Bicicletero from './pages/Bicicletero';
import Espacios from './pages/Espacios';
import Profile from './pages/Profile'; 
import AgregarBicicleta from './pages/Bicicleta';
import Informes from './pages/Informes';
import TablaInforme from './pages/TablaInforme';
import Turnos from './pages/Turnos'; 
import Usuarios from './pages/Usuarios'; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home", 
    element: <Root />, 
    children: [
      {
        index: true, 
        element: <Home />,
      },
      {
        path: "bicicletero", 
        element: <Bicicletero />,
      },
      {
        path: "bicicletero/:id",
        element: <Espacios />,
      },
      {
        path: "profile", 
        element: <Profile />,
      },
      {
        path: "agregar-bicicleta",
        element: <AgregarBicicleta />,
      },
      {
        path: "informes",
        element: <Informes />,
      },
      {
        path: "informes/:id",
        element: <TablaInforme />,
      },
      {
        path: "turnos",
        element: <Turnos />,
      },
      {
        path: "usuarios",
        element: <Usuarios />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);