import lecturaEspanol from './espanol'
import lecturaMatematicas from './matematicas'

export const LECTURAS = [
  lecturaEspanol,
  lecturaMatematicas
]

export function getLectura(materiaId) {
  return LECTURAS.find(l => l.id === materiaId) || null
}