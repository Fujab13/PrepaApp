//   1. Crea archivo ej: biologia.js
//   2. Impórtalo aquí
//   3. Agrégalo al array MATERIAS

import espanol      from './espanol'
import matematicas  from './matematicas'
import ingenierias  from './ingenierias'
import medicina    from './medicina'

export const MATERIAS = [
  espanol,
  matematicas,
  medicina,
  ingenierias
]
export function getMateria(id) {
  return MATERIAS.find(m => m.id === id) || null
}