// Preferencia de "Modo difícil" por materia (cronómetro de 22s por pregunta,
// sin tarjetas de solo concepto — ver MateriaCard.jsx y Leccion.jsx). Es
// local al dispositivo, igual que la preferencia de lectura automática de
// Leccion.jsx: no pasa por Supabase ni afecta progreso_usuario.
export function claveModoDificil(materiaId) {
  return `modo_dificil_${materiaId}`
}

export function leerModoDificil(materiaId) {
  try {
    return localStorage.getItem(claveModoDificil(materiaId)) === 'true'
  } catch {
    return false
  }
}

export function guardarModoDificil(materiaId, valor) {
  try {
    localStorage.setItem(claveModoDificil(materiaId), String(valor))
  } catch {
    // Sin localStorage disponible, la preferencia no persiste entre
    // sesiones, pero el toggle sigue funcionando dentro de esta.
  }
}
