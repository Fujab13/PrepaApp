import { useState, useEffect, useCallback } from 'react'

// Safari (iPad, macOS antiguo) todavía expone la Fullscreen API con el
// prefijo "webkit"; Safari en iPhone no la expone en absoluto (ni siquiera
// con prefijo) — ahí `elementoSoportaFullscreen()` devuelve false.
function getElementoFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

function elementoSoportaFullscreen() {
  const el = document.documentElement
  return !!(el.requestFullscreen || el.webkitRequestFullscreen)
}

function pedirFullscreen(el) {
  const metodo = el.requestFullscreen || el.webkitRequestFullscreen
  if (!metodo) return Promise.reject(new Error('Fullscreen no soportado en este navegador'))
  // El Safari con prefijo "webkit" no devuelve una Promise, a diferencia del estándar.
  const resultado = metodo.call(el)
  return resultado instanceof Promise ? resultado : Promise.resolve()
}

function salirFullscreen() {
  const metodo = document.exitFullscreen || document.webkitExitFullscreen
  if (!metodo) return Promise.reject(new Error('Fullscreen no soportado en este navegador'))
  const resultado = metodo.call(document)
  return resultado instanceof Promise ? resultado : Promise.resolve()
}

export function esFullscreenSoportado() {
  return typeof document !== 'undefined' && elementoSoportaFullscreen()
}

/**
 * useFullscreen
 * Envuelve la Fullscreen API de forma segura para iOS/Android/desktop:
 * - Nunca lanza una excepción (iPhone/Safari no la soporta y llamarla
 *   directamente rompía el botón; aquí se ignora en silencio).
 * - Mantiene `esFullscreen` sincronizado con el estado real del navegador,
 *   incluso si el usuario sale con Esc o el gesto de "atrás" de Android en
 *   vez de tocar el botón de la app.
 * - Expone `soportado` para que la UI pueda ocultar el botón por completo
 *   en plataformas donde nunca podrá funcionar (iPhone).
 */
export function useFullscreen() {
  const [esFullscreen, setEsFullscreen] = useState(() =>
    typeof document !== 'undefined' ? !!getElementoFullscreen() : false
  )

  useEffect(() => {
    const sincronizar = () => setEsFullscreen(!!getElementoFullscreen())
    document.addEventListener('fullscreenchange', sincronizar)
    document.addEventListener('webkitfullscreenchange', sincronizar)
    return () => {
      document.removeEventListener('fullscreenchange', sincronizar)
      document.removeEventListener('webkitfullscreenchange', sincronizar)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!getElementoFullscreen()) {
      pedirFullscreen(document.documentElement).catch(() => {})
    } else {
      salirFullscreen().catch(() => {})
    }
  }, [])

  return { esFullscreen, toggleFullscreen, soportado: esFullscreenSoportado() }
}
