export const PREGUNTAS_POR_UNIDAD = 12

// Cuántas unidades tiene el curso completo de una materia, según su propia
// cantidad de preguntas (antes era un tope fijo igual para todas: con bancos
// grandes como el de Español, eso dejaba una buena parte del contenido
// inalcanzable — ver useProgreso). Mismo criterio de "intro" que
// getPreguntasDeUnidad: si hay preguntas intro, ocupan su propia unidad 1.
export function getTotalUnidades(todasLasPreguntas) {
  const intro = todasLasPreguntas.filter(p => p.intro)
  const resto = intro.length > 0 ? todasLasPreguntas.filter(p => !p.intro) : todasLasPreguntas
  const unidadesDeContenido = Math.max(1, Math.ceil(resto.length / PREGUNTAS_POR_UNIDAD))
  return intro.length > 0 ? unidadesDeContenido + 1 : unidadesDeContenido
}

export function getPreguntasDeUnidad(todasLasPreguntas, unidadActual) {
  const intro = todasLasPreguntas.filter(p => p.intro)

  // Si la materia trae preguntas marcadas como "intro" (bienvenida/tutorial),
  // se muestran una sola vez en la unidad 1 y nunca vuelven a aparecer: el
  // resto de unidades pagina exclusivamente sobre el contenido real,
  // contando desde la unidad 2 en adelante. Materias sin preguntas "intro"
  // se comportan exactamente igual que antes.
  if (intro.length === 0) {
    const inicio = ((unidadActual - 1) * PREGUNTAS_POR_UNIDAD) % todasLasPreguntas.length
    const slice = todasLasPreguntas.slice(inicio, inicio + PREGUNTAS_POR_UNIDAD)
    if (slice.length < PREGUNTAS_POR_UNIDAD) {
      return [...slice, ...todasLasPreguntas.slice(0, PREGUNTAS_POR_UNIDAD - slice.length)]
    }
    return slice
  }

  if (unidadActual === 1) return intro

  const resto = todasLasPreguntas.filter(p => !p.intro)
  const unidadEfectiva = unidadActual - 1
  const inicio = ((unidadEfectiva - 1) * PREGUNTAS_POR_UNIDAD) % resto.length
  const slice = resto.slice(inicio, inicio + PREGUNTAS_POR_UNIDAD)
  if (slice.length < PREGUNTAS_POR_UNIDAD) {
    return [...slice, ...resto.slice(0, PREGUNTAS_POR_UNIDAD - slice.length)]
  }
  return slice
}
