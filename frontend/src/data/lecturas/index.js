import lecturaEspanol from './espanol'
import lecturaMatematicas from './matematicas'
import lecturaMedicina from './medicina'
import lecturaIngenierias from './ingenierias'
export const LECTURAS = [lecturaMedicina, lecturaIngenierias, lecturaEspanol, lecturaMatematicas ]

export function getLectura(materiaId) {
  return LECTURAS.find(l => l.id === materiaId) || null
}