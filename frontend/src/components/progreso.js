const HOY = () => new Date().toISOString().split('T')[0]

export function leerProgresoDiario(materiaId) {
  const raw = localStorage.getItem(`progreso_diario_${materiaId}`)
  if (!raw) return 0
  try {
    const datos = JSON.parse(raw)
    return datos.fecha === HOY() ? datos.valor : 0
  } catch {
    return 0
  }
}

export function guardarProgresoDiario(materiaId, valor) {
  localStorage.setItem(
    `progreso_diario_${materiaId}`,
    JSON.stringify({ fecha: HOY(), valor })
  )
}

export function incrementarProgresoDiario(materiaId) {
  const actual = leerProgresoDiario(materiaId)
  const nuevo = Math.min(actual + 1, 6)
  guardarProgresoDiario(materiaId, nuevo)
  return nuevo
}

export function reiniciarProgreso(materiaId) {
  localStorage.removeItem(`progreso_diario_${materiaId}`)
}