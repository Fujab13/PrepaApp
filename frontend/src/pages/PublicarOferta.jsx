// PublicarOferta.jsx
// Ruta "/ofertas/publicar": versión vieja del portal de maestros, de cuando
// "cualquier usuario logueado puede publicar" (sin el gate de maestro
// verificado que sí exige hoy la policy `insert_propia` de `ofertas_maestro`
// vía `soy_maestro_actual()`, ver migración 20260812140000_registro_maestros.sql).
// La policy ya bloquea a quien no sea maestro activo, pero esta pantalla
// seguía mostrando el formulario completo (materia, precio, CLABE...) a
// CUALQUIER alumno logueado antes de que el guardado fallara al final — un
// callejón sin salida confuso, además de huérfana (nada en la app enlaza
// aquí). El flujo real, con el registro/verificación de profesor, vive en
// /tutorias/maestro (TutoriasMaestro.jsx). Se deja como redirect en vez de
// borrar la ruta, por si alguien la tiene guardada como marcador.

import { Navigate } from "react-router-dom";

export default function PublicarOferta() {
  return <Navigate to="/tutorias/maestro" replace />;
}
