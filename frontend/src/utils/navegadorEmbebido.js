// navegadorEmbebido.js
// Detecta el navegador in-app de Instagram/Facebook (mismo WebView
// restringido en ambos) para poder avisar cuando una función que necesita
// el navegador "de verdad" —hoy, la lectura en voz alta (Web Speech API)—
// no va a sonar ahí: `speechSynthesis` existe como objeto pero `speak()`
// no reproduce nada y nunca dispara `onend`/`onerror`, así que sin esta
// detección el botón de TTS se queda pegado en "leyendo" para siempre.
export function esNavegadorEmbebido() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Instagram|FBAN|FBAV|FB_IAB/.test(ua)
}

function esAndroid() {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent || '')
}

// Intenta sacar al usuario del WebView embebido hacia su navegador normal.
// No hay forma 100% confiable en ningún sistema operativo, así que se
// intenta lo mejor disponible por plataforma y se cae a copiar el enlace.
// Devuelve una pista de qué pasó, para que el llamador ajuste su mensaje.
export async function intentarAbrirEnNavegador() {
  const url = window.location.href

  if (esAndroid()) {
    // Truco estándar para escapar de WebViews restringidos en Android: sin
    // "package", Android muestra su propio selector de apps (Chrome,
    // Samsung Internet, etc.) en vez de forzar una en particular.
    const sinEsquema = url.replace(/^https?:\/\//, '')
    window.location.href = `intent://${sinEsquema}#Intent;scheme=https;end`
    return 'intent'
  }

  // iOS no permite forzar la salida del WebView por JavaScript; la hoja de
  // compartir nativa (navigator.share) sí incluye "Abrir en Safari" y
  // funciona incluso dentro del navegador embebido de Instagram.
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ url })
      return 'share'
    } catch {
      // El usuario canceló la hoja de compartir: no es un error real, solo
      // no completó la acción. Cae al último recurso (copiar el enlace).
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copiado'
  } catch {
    return 'fallo'
  }
}
