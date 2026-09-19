import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext'
import { MusicProvider } from './context/MusicContext'

// Home se queda con import estático (es la pantalla de entrada, se necesita
// de inmediato); el resto de las rutas se cargan bajo demanda para no meter
// páginas pesadas (ej. Leccion/Examen, que arrastran KaTeX) en el bundle
// inicial — mejora el primer render en móvil/conexiones lentas.
import Home from './pages/Home';
const Leccion = lazy(() => import('./pages/Leccion'));
const Lectura = lazy(() => import('./pages/Lectura'));
const Login = lazy(() => import('./pages/Login'));
const ActualizarPassword = lazy(() => import('./pages/ActualizarPassword'));
const Store = lazy(() => import('./pages/Store'));
const Examen = lazy(() => import('./pages/Examen'));
const Inventario = lazy(() => import('./pages/Inventario'));
const Mascota = lazy(() => import('./pages/Mascota'));
const FormularioArea = lazy(() => import('./pages/FormularioArea'));
const InformeResultados = lazy(() => import('./pages/InformeResultados'));
const AlumnosOfertas = lazy(() => import('./pages/AlumnosOfertas'));
const AdminPagos = lazy(() => import('./pages/AdminPagos'));
const AdminMaestros = lazy(() => import('./pages/AdminMaestros'));
const AdminReportes = lazy(() => import('./pages/AdminReportes'));
const AdminOfertas = lazy(() => import('./pages/AdminOfertas'));
const MisGanancias = lazy(() => import('./pages/MisGanancias'));
const Tutorias = lazy(() => import('./pages/Tutorias'));
const TutoriasAlumno = lazy(() => import('./pages/TutoriasAlumno'));
const TutoriasMaestro = lazy(() => import('./pages/TutoriasMaestro'));
const PerfilProfesor = lazy(() => import('./pages/PerfilProfesor'));
const Ofertas = lazy(() => import('./pages/Ofertas'));
const PublicarOferta = lazy(() => import('./pages/PublicarOferta'));
const OfertaConfirmada = lazy(() => import('./pages/OfertaConfirmada'));

import { triggerVibration } from './utils/haptics';

function CargandoRuta() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando…</p>
    </div>
  );
}

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
      <Suspense fallback={<CargandoRuta />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leccion/:materiaId" element={<Leccion />} />
        <Route path="/lectura/:materiaId" element={<Lectura />} />
        <Route path="/login" element={<Login />} />
        <Route path="/actualizar-password" element={<ActualizarPassword />} />
        <Route path="/tienda" element={<Store />} />
        <Route path="/examen" element={<Examen />} />
        <Route path="/examen/:examenId" element={<Examen />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/mi-mascota" element={<Mascota />} />
        <Route path="/formulario-area" element={<FormularioArea />} />
        <Route path="/informe-resultados" element={<InformeResultados />} />
        <Route path="/tutorias/maestro/alumnos" element={<AlumnosOfertas />} />
        <Route path="/tutorias/maestro/ganancias" element={<MisGanancias />} />
        <Route path="/admin/pagos" element={<AdminPagos />} />
        <Route path="/admin/maestros" element={<AdminMaestros />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/ofertas" element={<AdminOfertas />} />
        <Route path="/tutorias" element={<Tutorias />} />
        <Route path="/tutorias/alumno" element={<TutoriasAlumno />} />
        <Route path="/tutorias/maestro" element={<TutoriasMaestro />} />
        <Route path="/perfil-profesor/:profesorId" element={<PerfilProfesor />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/ofertas/publicar" element={<PublicarOferta />} />
        <Route path="/oferta-confirmada" element={<OfertaConfirmada />} />
      </Routes>
      </Suspense>
      </MusicProvider>
      </StoreProvider>
    </AuthProvider>
  );
}