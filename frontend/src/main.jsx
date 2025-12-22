import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import Bicicletero from './pages/Bicicletero';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <div>Error 404</div>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "bicicletero",
        element: <Bicicletero />,
      },
    ],
  },
  {
      path: "/login",
      element: <div>Aquí va tu Login</div>
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);