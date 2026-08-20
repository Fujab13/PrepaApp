// Lectura de preguntas en voz alta (Web Speech API), usada por Leccion.jsx.

const NOMBRE_VOZ_PREFERIDA = 'es-es-x-eff-local'

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
  return vocesCache.find(v => v.voiceURI === NOMBRE_VOZ_PREFERIDA || v.name === NOMBRE_VOZ_PREFERIDA)
}

export function hablarTexto(texto, { onEnd } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !texto) return false

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(texto)
  const voz = obtenerVozPreferida()
  if (voz) {
    utterance.voice = voz
    utterance.lang = voz.lang
  } else {
    // Sin la voz preferida disponible en este dispositivo, se deja que el
    // navegador elija su voz por defecto para español.
    utterance.lang = 'es-MX'
  }
  utterance.rate = 1 // velocidad normal
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
