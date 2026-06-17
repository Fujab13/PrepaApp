import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Leccion from './pages/Leccion';
import Lectura from './pages/Lectura';
import Login from './pages/Login';

import 'katex/dist/katex.min.css';
import { triggerVibration } from './components/haptics';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leccion/:materiaId" element={<Leccion />} />
        <Route path="/lectura/:materiaId" element={<Lectura />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}