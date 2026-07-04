//   1. Crea archivo ej: biologia.js
//   2. Impórtalo aquí
//   3. Agrégalo al array MATERIAS

import espanol      from './lecciones/espanol.jsx'

export const MATERIAS = [
  espanol
]
export function getMateria(id) {
  return MATERIAS.find(m => m.id === id) || null
}