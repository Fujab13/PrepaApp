import { useEffect, useRef } from 'react'

const HISTORY_MARKER = '__prepaapp_back_dismiss'
const layers = []
let markerId = null
let markerSequence = 0
let suppressNextPop = false
let listenerInstalled = false

function installPopstateListener() {
  if (listenerInstalled || typeof window === 'undefined') return

  window.addEventListener('popstate', event => {
    if (suppressNextPop) {
      suppressNextPop = false
      markerId = null
      event.stopImmediatePropagation()
      return
    }

    const topLayer = layers.pop()
    if (!topLayer) return

    event.preventDefault()
    event.stopImmediatePropagation()
    topLayer.popped = true
    markerId = null

    if (layers.length > 0) {
      markerId = `back-dismiss-${++markerSequence}`
      window.history.pushState(
        { ...window.history.state, [HISTORY_MARKER]: markerId },
        '',
        window.location.href
      )
    }

    topLayer.onDismiss()
  }, true)

  listenerInstalled = true
}

function agregarMarcador() {
  const actual = window.history.state?.[HISTORY_MARKER]
  if (actual) {
    markerId = actual
    return
  }

  markerId = `back-dismiss-${++markerSequence}`
  window.history.pushState(
    { ...window.history.state, [HISTORY_MARKER]: markerId },
    '',
    window.location.href
  )
}

export function useBackDismiss(abierto, alCerrar) {
  const callbackRef = useRef(alCerrar)
  callbackRef.current = alCerrar

  useEffect(() => {
    if (!abierto || typeof window === 'undefined') return

    installPopstateListener()
    if (layers.length === 0) agregarMarcador()

    const capa = {
      onDismiss: () => callbackRef.current?.(),
      popped: false,
    }
    layers.push(capa)

    return () => {
      const index = layers.indexOf(capa)
      if (index !== -1) layers.splice(index, 1)
      if (capa.popped || layers.length > 0) return

      setTimeout(() => {
        if (layers.length > 0) return
        if (window.history.state?.[HISTORY_MARKER] !== markerId) {
          markerId = null
          return
        }

        suppressNextPop = true
        window.history.back()
      }, 0)
    }
  }, [abierto])
}
