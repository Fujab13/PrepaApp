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
import Inventario from './pages/Inventario';
import FormularioArea from './pages/FormularioArea';
import InformeResultados from './pages/InformeResultados';
import AlumnosOfertas from './pages/AlumnosOfertas';
import AdminPagos from './pages/AdminPagos';
import AdminMaestros from './pages/AdminMaestros';
import MisGanancias from './pages/MisGanancias';
import Tutorias from './pages/Tutorias';
import TutoriasAlumno from './pages/TutoriasAlumno';
import TutoriasMaestro from './pages/TutoriasMaestro';
import TutoriaConfirmada from './pages/TutoriaConfirmada';
import Ofertas from './pages/Ofertas';
import PublicarOferta from './pages/PublicarOferta';
import OfertaConfirmada from './pages/OfertaConfirmada';

import 'katex/dist/katex.min.css';
import { triggerVibration } from './utils/haptics';

export default function App() {

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const botonClickeado = e.target.closest('button');

      if (botonClickeado && !botonClickeado.disabled) {
        // 'bajo': acciones menores que no quieren ni el tap por defecto.
        // 'manual': el propio componente ya llama a triggerVibration con un
        // patrón específico (ej. acierto/fallo), evita duplicar el tap.
        const nivel = botonClickeado.dataset.gamificacion;
        if (nivel === 'bajo' || nivel === 'manual') return;
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
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/formulario-area" element={<FormularioArea />} />
        <Route path="/informe-resultados" element={<InformeResultados />} />
        <Route path="/tutorias/maestro/alumnos" element={<AlumnosOfertas />} />
        <Route path="/tutorias/maestro/ganancias" element={<MisGanancias />} />
        <Route path="/admin/pagos" element={<AdminPagos />} />
        <Route path="/admin/maestros" element={<AdminMaestros />} />
        <Route path="/tutorias" element={<Tutorias />} />
        <Route path="/tutorias/alumno" element={<TutoriasAlumno />} />
        <Route path="/tutorias/maestro" element={<TutoriasMaestro />} />
        <Route path="/tutoria-confirmada" element={<TutoriaConfirmada />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/ofertas/publicar" element={<PublicarOferta />} />
        <Route path="/oferta-confirmada" element={<OfertaConfirmada />} />
      </Routes>
      </MusicProvider>
      </StoreProvider>
    </AuthProvider>
  );
}