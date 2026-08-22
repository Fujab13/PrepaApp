// Lectura de preguntas en voz alta (Web Speech API), usada por Leccion.jsx.
//
// La Web Speech API no tiene una voz "estándar": cada dispositivo expone
// solo las que su sistema operativo trae instaladas (Android, iOS, Windows,
// macOS...), sin garantía de que exista ninguna voz en particular. Antes
// este módulo buscaba UNA sola voz por su identificador exacto
// ('es-es-x-eff-local', específico de ChromeOS) que casi nunca existe fuera
// de ese entorno, así que en la práctica casi siempre terminaba usando lo
// que el navegador trajera por defecto, sin ningún criterio real.
//
// En su lugar, aquí se puntúa cada voz en español que el dispositivo tenga
// instalada, por: variante regional (prioriza es-MX, el público de la app),
// señales de mejor calidad en el nombre (Natural/Online/Neural/Enhanced/
// Premium/WaveNet) y si su nombre corresponde a una de las voces
// masculinas más comunes en los motores de voz de Android/iOS/Windows/
// macOS (la API no expone género como campo, así que se infiere por
// nombre). Así, sin depender de ningún proveedor externo ni pedir permisos
// nuevos, cada dispositivo usa la MEJOR voz masculina en español que ya
// tiene disponible, en vez de una elegida al azar.

import { convertirTextoParaVoz } from './latexAHabla'

const NOMBRES_MASCULINOS = [
  'jorge', 'diego', 'juan', 'pablo', 'raul', 'raúl', 'carlos', 'alvaro', 'álvaro',
  'andres', 'andrés', 'enrique', 'fernando', 'miguel', 'alonso', 'gonzalo',
  'eduardo', 'francisco', 'javier', 'ricardo', 'roberto', 'sergio', 'tomas', 'tomás',
  'hector', 'héctor', 'ernesto', 'felipe', 'guillermo', 'oscar', 'óscar', 'rodrigo',
]

const NOMBRES_FEMENINOS = [
  'monica', 'mónica', 'paulina', 'angelica', 'angélica', 'sabina', 'helena', 'dalia',
  'lucia', 'lucía', 'elvira', 'conchita', 'camila', 'esperanza', 'soledad', 'marisol',
  'laura', 'catalina', 'ines', 'inés', 'valentina', 'yolanda', 'penelope', 'penélope',
]

const SENALES_CALIDAD_ALTA = ['natural', 'online', 'neural', 'enhanced', 'premium', 'wavenet']
const SENALES_CALIDAD_BAJA = ['compact']

// Puntaje más alto = mejor candidata. El peso del género domina a
// propósito: preferimos una voz masculina de calidad media antes que una
// femenina "mejor puntuada" solo por región o calidad.
function puntuarVoz(voz) {
  const nombre = (voz.name || '').toLowerCase()
  const lang = (voz.lang || '').toLowerCase()

  let puntos = 0

  if (lang === 'es-mx') puntos += 30
  else if (lang === 'es-419') puntos += 24
  else if (lang === 'es-us') puntos += 18
  else if (lang.startsWith('es')) puntos += 10

  if (SENALES_CALIDAD_ALTA.some(s => nombre.includes(s))) puntos += 8
  if (SENALES_CALIDAD_BAJA.some(s => nombre.includes(s))) puntos -= 8

  if (NOMBRES_MASCULINOS.some(n => nombre.includes(n))) puntos += 50
  if (NOMBRES_FEMENINOS.some(n => nombre.includes(n))) puntos -= 50

  return puntos
}

let vocesCache = []

function actualizarVocesCache() {
  vocesCache = window.speechSynthesis.getVoices()
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  actualizarVocesCache()
  // En muchos navegadores la lista de voces se carga de forma asíncrona,
  // por lo que la primera llamada a getVoices() puede volver vacía.
  window.speechSynthesis.addEventListener('voiceschanged', actualizarVocesCache)
}

function obtenerVozPreferida() {
  // getVoices() es barato de llamar; se prefiere la lista más fresca sobre
  // el cache, que solo sirve de respaldo si por lo que sea vuelve vacía.
  const frescas = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []
  const voces = frescas.length > 0 ? frescas : vocesCache

  const vocesEspanol = voces.filter(v => (v.lang || '').toLowerCase().startsWith('es'))
  if (vocesEspanol.length === 0) return null

  return vocesEspanol.reduce((mejor, actual) =>
    puntuarVoz(actual) > puntuarVoz(mejor) ? actual : mejor
  )
}

export function hablarTexto(texto, { onEnd } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !texto) return false

  window.speechSynthesis.cancel()

  // Las preguntas de Matemáticas pueden traer fórmulas LaTeX ($...$); sin
  // esta conversión el lector las deletrea tal cual ("diagonal, f, r, a, c,
  // llave..."), así que primero se traducen a español hablado.
  const utterance = new SpeechSynthesisUtterance(convertirTextoParaVoz(texto))
  const voz = obtenerVozPreferida()
  if (voz) {
    utterance.voice = voz
    utterance.lang = voz.lang
  } else {
    // Sin ninguna voz en español disponible en este dispositivo, se deja
    // que el navegador elija con solo el idioma como pista.
    utterance.lang = 'es-MX'
  }

  // Ritmo y tono ligeramente por debajo de los valores por defecto (1/1):
  // una cadencia un poco más pausada y grave suena más cálida y menos
  // robótica, sin llegar a sonar lenta o distorsionada.
  utterance.rate = 0.94
  utterance.pitch = 0.92

  if (onEnd) {
    utterance.onend = onEnd
    utterance.onerror = onEnd
  }

  window.speechSynthesis.speak(utterance)
  return true
}

export function detenerLectura() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}
