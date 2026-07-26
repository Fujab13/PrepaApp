import espanol from './lecciones/espanol.jsx'
import matematicas from './lecciones/matematicas.jsx'
import ingenierias from './lecciones/ingenierias.jsx'
import medicina from './lecciones/medicina.jsx'

export const MATERIAS = [
  espanol,
  matematicas,
  ingenierias,
  medicina,
]

export function getMateria(id) {
  return MATERIAS.find(m => m.id === id) || null
}