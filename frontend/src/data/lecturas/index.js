import lecturaEspanol from './espanol'

export const LECTURAS = [
  lecturaEspanol
]

export function getLectura(materiaId) {
  return LECTURAS.find(l => l.id === materiaId) || null
}