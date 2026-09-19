// Preferencia de "Modo difícil" por materia (cronómetro por pregunta, sin
// tarjetas de solo concepto — ver MateriaCard.jsx y Leccion.jsx). Es local
// al dispositivo, igual que la preferencia de lectura automática de
// Leccion.jsx: no pasa por Supabase ni afecta progreso_usuario.
import { convertirTextoParaVoz } from './latexAHabla'

export function claveModoDificil(materiaId) {
  return `modo_dificil_${materiaId}`
}

export function leerModoDificil(materiaId) {
  try {
    return localStorage.getItem(claveModoDificil(materiaId)) === 'true'
  } catch {
    return false
  }
}

export function guardarModoDificil(materiaId, valor) {
  try {
    localStorage.setItem(claveModoDificil(materiaId), String(valor))
  } catch {
    // Sin localStorage disponible, la preferencia no persiste entre
    // sesiones, pero el toggle sigue funcionando dentro de esta.
  }
}

// ── Cronómetro dinámico por longitud de pregunta ──────────────────────────
// Antes el cronómetro de Modo difícil era un fijo de 22.0s por pregunta sin
// importar qué tan larga fuera — una pregunta de una línea y un problema con
// tres oraciones de contexto daban exactamente el mismo tiempo. Esto lo
// reemplaza por una relación segundos/palabra, calibrada para que una
// pregunta de largo PROMEDIO siga dando los mismos 22.0s de antes (mismo
// nivel de dificultad percibido), y cada pregunta calcula su propio límite
// a partir de su propio largo.
//
// Referencia: ~20 palabras es un largo típico del enunciado de una pregunta
// de opción múltiple de examen universitario (algo como "Si una función
// f(x) tiene un máximo relativo en x=3, ¿cuál de las siguientes afirmaciones
// es verdadera?"). 22s / 20 palabras ≈ 1.1s por palabra: ajusta el ritmo,
// no lo cambies sin ajustar también PALABRAS_REFERENCIA para no romper la
// calibración.
const PALABRAS_REFERENCIA = 20
const SEGUNDOS_REFERENCIA = 22
const SEGUNDOS_POR_PALABRA = SEGUNDOS_REFERENCIA / PALABRAS_REFERENCIA

// Piso y techo (en segundos): sin ellos, una pregunta de una sola palabra
// dejaría un tiempo casi imposible de reaccionar, y una muy larga volvería
// el modo "fácil" por acumular demasiado tiempo — ambos casos le quitarían
// sentido al nombre "Modo difícil".
const SEGUNDOS_MINIMO = 10
const SEGUNDOS_MAXIMO = 45

// Cuenta palabras sobre el mismo texto "hablado" que ya usa el lector de voz
// (convertirTextoParaVoz, ver utils/tts.js): así una fórmula LaTeX como
// "$\frac{1}{2}$" se cuenta como las varias palabras que en realidad se leen
// ("uno entre dos"), no como un solo token ilegible de símbolos.
export function calcularTiempoLimiteDecimas(pregunta) {
  const texto = convertirTextoParaVoz(typeof pregunta?.pregunta === 'string' ? pregunta.pregunta : '')
  const palabras = texto && texto.trim() ? texto.trim().split(/\s+/).length : PALABRAS_REFERENCIA

  const segundos = palabras * SEGUNDOS_POR_PALABRA
  const segundosAcotados = Math.min(SEGUNDOS_MAXIMO, Math.max(SEGUNDOS_MINIMO, segundos))

  return Math.round(segundosAcotados * 10) // décimas de segundo, mismo formato que tiempoRestante en Leccion.jsx
}
