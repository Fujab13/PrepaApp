import { useEffect, useState } from 'react'
import { obtenerFormulariosPorEmail } from '../services/informes'

// Nombre "de alumno" del usuario logueado: su envío más reciente del
// Formulario de Área. Deliberadamente NO se usa `perfiles.nombre` como
// fuente aquí — esa tabla es una sola fila por cuenta compartida entre rol
// de alumno y de profesor (sin columna de rol ni UI propia de edición), así
// que leerla en una pantalla de alumno arriesga mostrar un nombre que la
// misma persona haya guardado en un contexto de profesor. `formularios_area`
// sí es dato exclusivamente de alumno.
export function useNombreAlumno(email) {
  const [nombre, setNombre] = useState(null)

  useEffect(() => {
    if (!email) return
    let cancelado = false
    obtenerFormulariosPorEmail(email).then((formularios) => {
      if (!cancelado) setNombre(formularios[0]?.nombre ?? null)
    })
    return () => { cancelado = true }
  }, [email])

  return nombre
}
