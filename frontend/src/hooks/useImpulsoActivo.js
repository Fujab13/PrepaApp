import { useEffect, useState } from 'react'
import { impulsoActivo } from '../utils/mascotasEstado'

// `impulsoActivo` lee un timestamp de localStorage, no es React state — no
// hay forma de que un componente "reaccione" solo a que venza. Se sondea
// cada pocos segundos (igual que el reloj de felicidad en Mascota.jsx) para
// que el hint de examen/lección (ver MascotaCompanera.jsx) se apague solo a
// los 3 minutos sin que el usuario tenga que refrescar nada.
const INTERVALO_MS = 4000

export function useImpulsoActivo(mascotaId) {
  const [activo, setActivo] = useState(() => impulsoActivo(mascotaId))

  useEffect(() => {
    setActivo(impulsoActivo(mascotaId))
    if (!mascotaId) return
    const id = setInterval(() => setActivo(impulsoActivo(mascotaId)), INTERVALO_MS)
    return () => clearInterval(id)
  }, [mascotaId])

  return activo
}
