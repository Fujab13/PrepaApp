// Ofertas.jsx
// Ruta "/ofertas": versión vieja del portal de alumnos, hoy huérfana (nada
// en la app enlaza aquí — ni Sidenav ni ningún otro componente, ver búsqueda
// de referencias). El flujo real vive en /tutorias/alumno (TutoriasAlumno.jsx),
// que muestra lo mismo (PublicacionOfertas de solo lectura) más el estado
// del examen/formulario de área. Se deja como un redirect en vez de borrar
// la ruta, por si alguien la tiene guardada como marcador.

import { Navigate } from "react-router-dom";

export default function Ofertas() {
  return <Navigate to="/tutorias/alumno" replace />;
}
