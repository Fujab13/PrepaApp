export const PREGUNTAS_POR_UNIDAD = 12

export function getPreguntasDeUnidad(todasLasPreguntas, unidadActual) {
  const inicio = ((unidadActual - 1) * PREGUNTAS_POR_UNIDAD) % todasLasPreguntas.length
  const slice = todasLasPreguntas.slice(inicio, inicio + PREGUNTAS_POR_UNIDAD)
  if (slice.length < PREGUNTAS_POR_UNIDAD) {
    return [...slice, ...todasLasPreguntas.slice(0, PREGUNTAS_POR_UNIDAD - slice.length)]
  }
  return slice
}