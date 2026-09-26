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
const SeleccionExamen = lazy(() => import('./pages/SeleccionExamen'));
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
const Ajustes = lazy(() => import('./pages/Ajustes'));
const AvisoPrivacidad = lazy(() => import('./pages/AvisoPrivacidad'));

import PaginaSkeleton from './components/skeletons/PaginaSkeleton';
import { PedirUsuarioPendiente } from './components/ElegirUsuarioDialog';
import LeccionSkeleton from './components/skeletons/LeccionSkeleton';
import LecturaSkeleton from './components/skeletons/LecturaSkeleton';
import RankingSkeleton from './components/skeletons/RankingSkeleton';
import ExamenSkeleton from './components/skeletons/ExamenSkeleton';
import AjustesSkeleton from './components/skeletons/AjustesSkeleton';
import LoginSkeleton from './components/skeletons/LoginSkeleton';
import TiendaSkeleton from './components/skeletons/TiendaSkeleton';
import SeleccionExamenSkeleton from './components/skeletons/SeleccionExamenSkeleton';
import InventarioSkeleton from './components/skeletons/InventarioSkeleton';
import MascotasSkeleton from './components/skeletons/MascotasSkeleton';
import FormularioAreaSkeleton from './components/skeletons/FormularioAreaSkeleton';
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
      <Suspense fallback={<PaginaSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Suspense propio: mientras baja el código de la lección se ve ya
            su skeleton, no el genérico (PaginaSkeleton). */}
        <Route path="/leccion/:materiaId" element={<Suspense fallback={<LeccionSkeleton />}><Leccion /></Suspense>} />
        <Route path="/lectura/:materiaId" element={<Suspense fallback={<LecturaSkeleton />}><Lectura /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<LoginSkeleton />}><Login /></Suspense>} />
        <Route path="/actualizar-password" element={<ActualizarPassword />} />
        <Route path="/tienda" element={<Suspense fallback={<TiendaSkeleton />}><Store /></Suspense>} />
        <Route path="/examen" element={<Suspense fallback={<SeleccionExamenSkeleton />}><SeleccionExamen /></Suspense>} />
        <Route path="/examen/:examenId" element={<Suspense fallback={<ExamenSkeleton />}><Examen /></Suspense>} />
        <Route path="/privacidad" element={<AvisoPrivacidad />} />
        <Route path="/ajustes" element={<Suspense fallback={<AjustesSkeleton />}><Ajustes /></Suspense>} />
        <Route path="/inventario" element={<Suspense fallback={<InventarioSkeleton />}><Inventario /></Suspense>} />
        <Route path="/mi-mascota" element={<Suspense fallback={<MascotasSkeleton />}><Mascota /></Suspense>} />
        <Route path="/formulario-area" element={<Suspense fallback={<FormularioAreaSkeleton />}><FormularioArea /></Suspense>} />
        <Route path="/informe-resultados" element={<InformeResultados />} />
        <Route path="/tutorias/maestro/alumnos" element={<AlumnosOfertas />} />
        <Route path="/tutorias/maestro/ganancias" element={<MisGanancias />} />
        <Route path="/admin/pagos" element={<AdminPagos />} />
        <Route path="/admin/maestros" element={<AdminMaestros />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/ofertas" element={<AdminOfertas />} />
        <Route path="/tutorias" element={<Suspense fallback={<RankingSkeleton />}><Tutorias /></Suspense>} />
        <Route path="/tutorias/alumno" element={<TutoriasAlumno />} />
        <Route path="/tutorias/maestro" element={<TutoriasMaestro />} />
        <Route path="/perfil-profesor/:profesorId" element={<PerfilProfesor />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/ofertas/publicar" element={<PublicarOferta />} />
        <Route path="/oferta-confirmada" element={<OfertaConfirmada />} />
      </Routes>
      </Suspense>
      {/* Pide elegir usuario a cuentas con uno genérico sin confirmar. */}
      <PedirUsuarioPendiente />
      </MusicProvider>
      </StoreProvider>
    </AuthProvider>
  );
}