// materiasTutoria.js
// Lista fija de materias reservables en Tutorías.jsx. Calcada de SECCIONES en
// data/examen.js (mismos ids/colores) porque el reporte que se le manda al
// maestro viene de ahí, y de la lista de materias válidas en la migración
// de tutorías (`profesores.materias` / `solicitudes_tutoria.materia_id`).
//
// Deliberadamente NO se reusa MATERIAS de leccionesGratis.js: esa lista
// depende de qué archivos .json existan en data/lecciones/ (hoy solo
// español y matemáticas), mientras el examen —y por lo tanto el reporte del
// alumno— cubre 4 materias. Si cambia una lista, debe cambiar la otra y el
// CHECK de la migración `tutorias_esquema.sql`.
export const MATERIAS_TUTORIA = [
  { id: "espanol", nombre: "Español", color: "#4f8ef7" },
  { id: "matematicas", nombre: "Matemáticas", color: "#cf3b3b" },
  { id: "ingles", nombre: "Inglés", color: "#22c55e" },
  { id: "historia", nombre: "Historia", color: "#d8c468" },
];

// "Otros" es EXCLUSIVO de `ofertas_maestro` (ver migración
// 20260829120000_ofertas_maestro_materia_otro.sql) — esa tabla tiene su
// propia columna `materia_otro` para el nombre libre. Deliberadamente no
// se agrega a MATERIAS_TUTORIA: esa lista también alimenta el CHECK de
// `solicitudes_tutoria`/`ofertas_tutoria` (tutorias_esquema.sql), que no
// soporta materias libres.
export const MATERIA_OTROS = { id: "otros", nombre: "Otros", color: "#7c5cbf" };

// Nombre a mostrar de una oferta de `ofertas_maestro`, incluyendo el caso
// materia_id === 'otros' (usa el texto libre que escribió el maestro).
export function nombreMateriaOferta(materiaId, materiaOtro) {
  if (materiaId === MATERIA_OTROS.id) return materiaOtro || MATERIA_OTROS.nombre;
  return MATERIAS_TUTORIA.find((m) => m.id === materiaId)?.nombre ?? materiaId;
}
