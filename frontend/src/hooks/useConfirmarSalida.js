// useConfirmarSalida.js
// Intercepta el botón "Atrás" del navegador (y el cierre/recarga de la
// pestaña) para poder avisar antes de perder una lección/formulario a
// medio hacer, en vez de dejar salir sin preguntar nada — mismo problema
// que ya resolvía el botón "X" de Examen.jsx, pero ese aviso solo cubría
// el botón propio de la página, no el de atrás del navegador.
//
// `react-router-dom` trae `useBlocker`/`unstable_useBlocker` para esto,
// pero SOLO funcionan con un data router (`createBrowserRouter`) — este
// proyecto usa `<BrowserRouter>` normal (ver main.jsx), así que se hace a
// mano con un truco de historial ya clásico: al activarse, se empuja una
// entrada "centinela" idéntica encima de la actual. Cuando el navegador
// dispara `popstate` (el usuario presionó Atrás), en vez de dejarlo salir
// se vuelve a empujar esa misma entrada de inmediato — cancelando la
// salida real — y se avisa al llamador (`onIntentarSalir`) para que
// muestre su propio diálogo de confirmación (el mismo ConfirmDialog que ya
// usa cada página).
//
// Si el usuario sí confirma que quiere salir, la página debe navegar con
// `{ replace: true }` (no un push normal): así la entrada centinela se
// sobreescribe en vez de quedar abandonada en el historial, que dejaría un
// "atrás" fantasma que regresa a esta misma pantalla otra vez.
import { useEffect, useRef } from 'react'

export function useConfirmarSalida(activo, onIntentarSalir) {
  const callbackRef = useRef(onIntentarSalir)
  callbackRef.current = onIntentarSalir

  useEffect(() => {
    if (!activo) return

    window.history.pushState(null, '', window.location.href)

    function onPopState() {
      window.history.pushState(null, '', window.location.href)
      callbackRef.current()
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [activo])

  // Cerrar/recargar la pestaña: el navegador ya trae su propio diálogo
  // nativo para esto (no se puede sustituir por uno propio), solo hay que
  // pedírselo explícitamente.
  useEffect(() => {
    if (!activo) return
    function onBeforeUnload(e) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [activo])
}
