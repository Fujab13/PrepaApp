//   1. Crea archivo ej: biologia.js
//   2. Impórtalo aquí
//   3. Agrégalo al array MATERIAS

import espanol      from './lecciones/espanol'
import matematicas  from './lecciones/matematicas'
import ingenierias  from './lecciones/ingenierias'
import medicina    from './lecciones/medicina'

export const MATERIAS = [
  espanol,
  matematicas,
  medicina,
  ingenierias
]
export function getMateria(id) {
  return MATERIAS.find(m => m.id === id) || null
}