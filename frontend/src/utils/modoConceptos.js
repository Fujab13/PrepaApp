// Preferencia de "Modo conceptos" por materia (la pesa en MateriaCard.jsx):
// la lección muestra SOLO las tarjetas de concepto (las que no tienen
// opciones), para estudiar la teoría sin preguntas. Local al dispositivo,
// igual que Modo difícil (utils/modoDificil.js), y excluyente con él: activar
// uno apaga el otro.
//
// Su avance también es local y aparte (ver useProgreso con `soloLocal`): las
// unidades de conceptos no corresponden a las de la lección normal, y pasar
// tarjetas no debe sumar al ranking ni a progreso_usuario.

export function leerModoConceptos(materiaId) {
  try {
    return localStorage.getItem(`modo_conceptos_${materiaId}`) === 'true'
  } catch {
    return false
  }
}

export function guardarModoConceptos(materiaId, valor) {
  try {
    localStorage.setItem(`modo_conceptos_${materiaId}`, String(valor))
  } catch {
    // Sin localStorage la preferencia no persiste, pero el toggle funciona en la sesión.
  }
}

// Una tarjeta de concepto: sin opciones y que no sea de la bienvenida (intro).
export function esConcepto(pregunta) {
  return !pregunta.intro && !(Array.isArray(pregunta.opciones) && pregunta.opciones.length > 0)
}
