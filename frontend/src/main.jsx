import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Error404 from './pages/Error404'; 


import './styles/styles.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <Error404 />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register", //
    element: <Register />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
