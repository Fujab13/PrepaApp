//   1. Crea archivo ej: biologia.js
//   2. Impórtalo aquí
//   3. Agrégalo al array MATERIAS

import espanol      from './cuestionarios/espanol'
import matematicas  from './cuestionarios/matematicas'
import ingenierias  from './cuestionarios/ingenierias'
import medicina    from './cuestionarios/medicina'

export const MATERIAS = [
  espanol,
  matematicas,
  medicina,
  ingenierias
]
export function getMateria(id) {
  return MATERIAS.find(m => m.id === id) || null
}