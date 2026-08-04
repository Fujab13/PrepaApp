import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext'
import { MusicProvider } from './context/MusicContext'

import Home from './pages/Home';
import Leccion from './pages/Leccion';
import Lectura from './pages/Lectura';
import Login from './pages/Login';
import ActualizarPassword from './pages/ActualizarPassword';
import Store from './pages/Store'
import Examen from './pages/Examen';
import Resultados from './pages/Resultados';
import Inventario from './pages/Inventario';

import 'katex/dist/katex.min.css';
import { triggerVibration } from './utils/haptics';

export default function App() {

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const botonClickeado = e.target.closest('button');

      if (botonClickeado && !botonClickeado.disabled) {
        triggerVibration();
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <AuthProvider>
      <StoreProvider>
      <MusicProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leccion/:materiaId" element={<Leccion />} />
        <Route path="/lectura/:materiaId" element={<Lectura />} />
        <Route path="/login" element={<Login />} />
        <Route path="/actualizar-password" element={<ActualizarPassword />} />
        <Route path="/tienda" element={<Store />} />
        <Route path="/examen" element={<Examen />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
      </MusicProvider>
      </StoreProvider>
    </AuthProvider>
  );
}