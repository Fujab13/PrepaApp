// examenStats.js
// Cálculo de aciertos por sección del examen, extraído de Resultados.jsx para
// que Examen.jsx pueda usar exactamente el mismo cómputo al persistir el
// resultado en Supabase (tabla resultados_examen) que Resultados.jsx usa al
// mostrarlo en pantalla — un solo lugar de verdad, nada de calcularlo dos
// veces y arriesgar que se desincronicen.

export function calcularStatsPorSeccion({ preguntas, secciones, respuestas }) {
  return secciones.map((sec) => {
    const pregsSec = preguntas.filter((p) => p.id >= sec.id_inicio && p.id <= sec.id_fin);
    const correctas = pregsSec.filter((p) => respuestas[p.id] === p.inciso_correcto).length;
    return { ...sec, total: pregsSec.length, correctas };
  });
}
