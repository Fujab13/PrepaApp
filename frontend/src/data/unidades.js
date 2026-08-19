export const PREGUNTAS_POR_UNIDAD = 12

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
