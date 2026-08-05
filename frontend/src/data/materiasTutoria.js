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
