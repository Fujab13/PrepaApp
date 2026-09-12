import { useEffect, useRef, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { MASCOTAS } from '../data/mascotas'
import { useImpulsoActivo } from '../hooks/useImpulsoActivo'
import PixelArt from './PixelArt'

const TAMANO_PX = 3
// Ancho: sí tiene sentido como % fijo, el ancho de la página prácticamente
// no cambia (siempre ronda el del viewport, sin scroll horizontal).
const X_MIN = 8
const X_MAX = 92
// Alto: en cambio NO puede ser un % fijo del contenedor — este es el alto
// REAL de la página completa (ver nota más abajo), que en Home puede ser
// varias veces la altura de la pantalla. Un 12% fijo ahí eran cientos de
// píxeles reales, justo por la zona del hexágono — de ahí que antes no se
// pudiera arrastrar (ni pasear) más arriba de esa franja por más que
// hubiera pantalla libre encima. En su lugar, `limitesY` convierte un
// margen fijo en PÍXELES (despeja la topbar arriba, un respiro abajo) al
// % que le toca según el alto real del contenedor en ese momento.
const MARGEN_SUPERIOR_PX = 64
const MARGEN_INFERIOR_PX = 24
// Cada paso la mueve como mucho esta distancia desde donde ya está (radio,
// no reasignación libre) — así el paseo se siente natural en vez de
// teletransportarse a cualquier punto de la página de un salto.
const RADIO_PASEO = 18
const INTENTOS_EVITAR_ZONA = 5 // ver elegirDestino: reintenta esta cantidad de veces antes de rendirse y aceptar un punto dentro de la zona a evitar
const DURACION_PISTA_VISIBLE_MS = 4500 // cuánto se queda junto a la respuesta antes de retomar el paseo
const DURACION_FRASE_MS = 2200
const UMBRAL_ARRASTRE_PX = 6 // desplazamiento mínimo para contar como arrastre y no como un tap

function clamp(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor))
}

function limitesY(alturaPx) {
  if (!alturaPx || alturaPx <= 0) return { min: 15, max: 90 } // antes de poder medir el contenedor (primer render)
  return {
    min: clamp((MARGEN_SUPERIOR_PX / alturaPx) * 100, 2, 45),
    max: clamp(100 - (MARGEN_INFERIOR_PX / alturaPx) * 100, 55, 98),
  }
}

// Punto candidato a `RADIO_PASEO` de `actual`, evitando por norma general
// (no a la fuerza — ver INTENTOS_EVITAR_ZONA) caer dentro de
// `[data-mascota-evitar="true"]` (la pregunta/respuestas, ver Leccion.jsx/
// Examen.jsx) — sigue pudiendo terminar ahí si los reintentos no encuentran
// nada mejor, a propósito: no es una zona prohibida, solo una preferencia.
function elegirDestino(actual, contenedor) {
  const rectContenedor = contenedor?.getBoundingClientRect()
  const { min: yMin, max: yMax } = limitesY(rectContenedor?.height)
  const zonaEvitar = document.querySelector('[data-mascota-evitar="true"]')
  const rectZona = zonaEvitar && rectContenedor?.width > 0 ? zonaEvitar.getBoundingClientRect() : null

  let ultimoCandidato = null
  for (let intento = 0; intento < INTENTOS_EVITAR_ZONA; intento++) {
    const angulo = Math.random() * Math.PI * 2
    const radio = Math.random() * RADIO_PASEO
    const candidato = {
      x: clamp(actual.x + Math.cos(angulo) * radio, X_MIN, X_MAX),
      y: clamp(actual.y + Math.sin(angulo) * radio, yMin, yMax),
    }

    if (!rectZona) return candidato

    const zonaXMin = ((rectZona.left - rectContenedor.left) / rectContenedor.width) * 100
    const zonaXMax = ((rectZona.right - rectContenedor.left) / rectContenedor.width) * 100
    const zonaYMin = ((rectZona.top - rectContenedor.top) / rectContenedor.height) * 100
    const zonaYMax = ((rectZona.bottom - rectContenedor.top) / rectContenedor.height) * 100
    const dentroDeLaZona = candidato.x >= zonaXMin && candidato.x <= zonaXMax && candidato.y >= zonaYMin && candidato.y <= zonaYMax
    if (!dentroDeLaZona) return candidato
    ultimoCandidato = candidato
  }
  return ultimoCandidato
}

// La mascota "compañera" (ver estrella en Mascota.jsx → Tu colección,
// StoreContext.jsx: mascotaSeleccionada/seleccionarMascota): a lo sumo una,
// y solo si de verdad sigue siendo tuya (si la elimina de su colección,
// deja de aparecer aunque `mascotaSeleccionada` quedara sin limpiar por
// algún motivo). Se monta en páginas puntuales (Home, Leccion, Examen),
// pero a propósito NO es `position: fixed` sobre el viewport — sería una
// "pegatina" clavada en la pantalla, ajena al scroll. En cambio es
// `position: absolute` dentro del contenedor raíz de esa página (que debe
// tener `position: relative`, ver Home.jsx/Leccion.jsx/Examen.jsx), con
// `inset: 0` — eso hace que abarque el alto REAL de la página (no solo el
// viewport) y se desplace junto con el contenido al hacer scroll.
//
// Pasea sola con pasos cortos (ver RADIO_PASEO/elegirDestino), mirando
// hacia donde camina. Un tap con el impulso activo (ver
// utils/mascotasEstado.js: activarImpulso, al alimentar — dura 3 min) y una
// pregunta con respuesta correcta en pantalla (marcada
// `[data-pista-mascota="true"]`, ver Leccion.jsx/Examen.jsx) hace que deje
// de pasear y se pare junto a esa respuesta — pegada a su lado DERECHO
// (para no tapar el texto, que se lee de izquierda a derecha) y mirando a
// la izquierda, hacia la respuesta — durante unos segundos, y luego retoma
// el paseo normal por su cuenta. Un tap sin impulso (o sin pregunta en
// pantalla) solo muestra su frase, como siempre.
//
// También se puede arrastrar a mano (Pointer Events: mouse, touch y pen con
// la misma API) — mientras se arrastra, el paseo automático y cualquier
// pista en curso se pausan (ver `arrastrando` como dependencia del efecto
// de paseo), y se retoman solos desde la posición donde se soltó. Un
// desplazamiento menor a UMBRAL_ARRASTRE_PX cuenta como tap normal, no
// como arrastre — así seguir pudiendo tocarla sin que un pequeño temblor
// del dedo se confunda con querer moverla.
export default function MascotaCompanera() {
  const { mascotaSeleccionada, ownsItem } = useStore()
  const mascota = mascotaSeleccionada ? MASCOTAS.find(m => m.id === mascotaSeleccionada) : null
  const tieneMascota = Boolean(mascota) && ownsItem(`mascota-${mascota.id}`)
  const pistaActiva = useImpulsoActivo(tieneMascota ? mascota.id : null)

  const [pos, setPos] = useState(() => {
    // Todavía no hay contenedor que medir en este primer render — usa el
    // alto de la ventana como aproximación (el spawn se corrige solo con
    // el primer paso/paseo de todas formas).
    const { min: yMin, max: yMax } = limitesY(typeof window !== 'undefined' ? window.innerHeight : 0)
    return {
      x: X_MIN + Math.random() * (X_MAX - X_MIN),
      y: yMin + Math.random() * (yMax - yMin),
    }
  })
  const [mirandoIzq, setMirandoIzq] = useState(false)
  const [fraseVisible, setFraseVisible] = useState(false)
  const [enPista, setEnPista] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const contenedorRef = useRef(null)
  const pasoTimeoutRef = useRef(null)
  const pistaTimeoutRef = useRef(null)
  const fraseTimeoutRef = useRef(null)
  const inicioArrastreRef = useRef({ x: 0, y: 0 })
  const seMovioRef = useRef(false)

  // Paseo normal — en pausa mientras muestra la pista o mientras la
  // arrastran a mano (ver más abajo, se reanuda solo al terminar) para que
  // un paso al azar no la aleje de la respuesta a medio mostrarla, ni le
  // pelee la posición a quien la está moviendo.
  useEffect(() => {
    if (!tieneMascota || enPista || arrastrando) return
    let cancelado = false

    function programarPaso() {
      const espera = 3000 + Math.random() * 3000
      pasoTimeoutRef.current = setTimeout(() => {
        if (cancelado) return
        setPos(actual => {
          const destino = elegirDestino(actual, contenedorRef.current) || actual
          setMirandoIzq(destino.x < actual.x)
          return destino
        })
        programarPaso()
      }, espera)
    }

    programarPaso()
    return () => { cancelado = true; clearTimeout(pasoTimeoutRef.current) }
  }, [tieneMascota, mascota?.id, enPista, arrastrando])

  // Si el impulso vence mientras muestra la pista, la corta ahí mismo en
  // vez de esperar a que se cumpla el temporizador de arriba.
  useEffect(() => {
    if (!pistaActiva && enPista) {
      clearTimeout(pistaTimeoutRef.current)
      setEnPista(false)
    }
  }, [pistaActiva, enPista])

  useEffect(() => () => {
    clearTimeout(pasoTimeoutRef.current)
    clearTimeout(pistaTimeoutRef.current)
    clearTimeout(fraseTimeoutRef.current)
  }, [])

  if (!tieneMascota) return null

  function alTocarla() {
    const objetivo = pistaActiva ? document.querySelector('[data-pista-mascota="true"]') : null
    const contenedor = contenedorRef.current

    if (objetivo && contenedor) {
      const rectObjetivo = objetivo.getBoundingClientRect()
      const rectContenedor = contenedor.getBoundingClientRect()
      if (rectContenedor.width > 0 && rectContenedor.height > 0) {
        // Junto al borde derecho del botón (no centrada ni encima del
        // texto), mirando a la izquierda — así señala la respuesta sin
        // taparla.
        const px = rectObjetivo.right - rectContenedor.left - 14
        const py = rectObjetivo.top + rectObjetivo.height / 2 - rectContenedor.top
        setPos({
          x: clamp((px / rectContenedor.width) * 100, 3, 97),
          y: clamp((py / rectContenedor.height) * 100, 3, 97),
        })
        setMirandoIzq(true)
        setEnPista(true)
        setFraseVisible(false)
        clearTimeout(pistaTimeoutRef.current)
        pistaTimeoutRef.current = setTimeout(() => setEnPista(false), DURACION_PISTA_VISIBLE_MS)
        return
      }
    }

    // Sin impulso activo, o sin pregunta con respuesta correcta en pantalla:
    // solo un saludo, como antes.
    setFraseVisible(true)
    clearTimeout(fraseTimeoutRef.current)
    fraseTimeoutRef.current = setTimeout(() => setFraseVisible(false), DURACION_FRASE_MS)
  }

  function alSoltarElPuntero(x, y) {
    const contenedor = contenedorRef.current
    if (!contenedor) return
    const rect = contenedor.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const { min: yMin, max: yMax } = limitesY(rect.height)
    setPos({
      x: clamp(((x - rect.left) / rect.width) * 100, X_MIN, X_MAX),
      y: clamp(((y - rect.top) / rect.height) * 100, yMin, yMax),
    })
  }

  function alPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    inicioArrastreRef.current = { x: e.clientX, y: e.clientY }
    seMovioRef.current = false
    // Agarrarla corta cualquier pista en curso — quien la mueve a mano
    // toma el control, no tiene sentido que siga "señalando" desde donde
    // ya no está.
    clearTimeout(pistaTimeoutRef.current)
    setEnPista(false)
  }

  function alPointerMove(e) {
    if (e.buttons === 0 && e.pointerType === 'mouse') return // botón soltado fuera del elemento
    if (!seMovioRef.current) {
      const dx = e.clientX - inicioArrastreRef.current.x
      const dy = e.clientY - inicioArrastreRef.current.y
      if (Math.hypot(dx, dy) < UMBRAL_ARRASTRE_PX) return
      seMovioRef.current = true
      setArrastrando(true)
    }
    alSoltarElPuntero(e.clientX, e.clientY)
  }

  function alPointerUp(e) {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ya liberado */ }
    if (seMovioRef.current) {
      alSoltarElPuntero(e.clientX, e.clientY)
      setArrastrando(false)
    }
    // El click sintético que sigue a esto revisa `seMovioRef` para decidir
    // si fue un arrastre (lo ignora) o un tap de verdad (ver onClick).
  }

  function alHacerClic() {
    if (seMovioRef.current) {
      seMovioRef.current = false
      return
    }
    alTocarla()
  }

  return (
    <div ref={contenedorRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 20 }}>
      <button
        type="button"
        onClick={alHacerClic}
        onPointerDown={alPointerDown}
        onPointerMove={alPointerMove}
        onPointerUp={alPointerUp}
        onPointerCancel={alPointerUp}
        style={{
          position: 'absolute',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: arrastrando ? 'none' : 'left 0.6s ease-in-out, top 0.6s ease-in-out',
          touchAction: 'none',
          pointerEvents: 'auto',
          background: 'transparent',
          border: 'none',
          padding: 6,
          cursor: arrastrando ? 'grabbing' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {(fraseVisible || enPista) && (
          <span style={{
            fontSize: 10.5, color: fraseVisible ? 'var(--text)' : '#04140c',
            background: fraseVisible ? 'var(--surface)' : '#facc15',
            border: fraseVisible ? '1px solid var(--border)' : 'none',
            borderRadius: 10, padding: '4px 9px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.4)',
            fontWeight: fraseVisible ? 600 : 700,
          }}>
            {fraseVisible ? mascota.frase : '¡Aquí!'}
          </span>
        )}
        <span className="mascota-balanceo">
          <PixelArt grid={mascota.grid} paleta={mascota.paleta} size={TAMANO_PX} flip={mirandoIzq} />
        </span>
      </button>
    </div>
  )
}
