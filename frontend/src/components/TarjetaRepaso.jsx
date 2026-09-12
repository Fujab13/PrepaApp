// TarjetaRepaso.jsx
// Dinámica alterna para las preguntas de repaso/reforzamiento dentro de
// Leccion.jsx: la pregunta cae como una tarjeta sobre un panel con 3 zonas
// de respuesta ancladas a los bordes (izquierda, derecha, abajo). Cada
// respuesta es solo su ícono de dirección + texto flotando sobre el panel
// — sin un contenedor propio (ni fondo, ni borde) — y ya no un triángulo.
// El usuario arrastra la tarjeta hasta sacarla de pantalla en dirección de
// la zona donde cree que está la respuesta correcta. A propósito NO se
// puede responder tocando la zona directamente (antes sí se podía): un tap
// accidental sobre una respuesta ya no cuenta como responder.
//
// Es puramente presentacional: quien la usa sigue siendo dueño del estado
// de la pregunta (estados, respondido) y de la lógica de acierto/error
// (onResponder recibe el índice ORIGINAL de la opción, igual que OpcionBtn).

import { useEffect, useMemo, useRef, useState } from 'react'
import { FaVolumeUp, FaGoogle, FaChevronLeft, FaChevronRight, FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa'
import Latex from './Latex'

// Fracción de la tarjeta que debe salir del contenedor para contar como
// respuesta. Antes era 0.7 (~60% del ANCHO DE PANTALLA arrastrado en un
// celular típico antes de disparar — un gesto nada natural). Se baja a
// 0.32 para que un swipe normal (bastante menos de medio ancho de
// pantalla) ya alcance a activarlo. Usar el snippet de pruebas del PR para
// afinar este número a mano si hiciera falta (ver README/mensaje del PR).
const UMBRAL_SALIDA = 0.32

// Cada zona es solo la REGIÓN (posición + hitbox de toque) anclada a un
// borde del panel — ya no un triángulo, y sin un contenedor visual propio
// (ver Zona más abajo): izquierda/derecha son franjas verticales en su
// mitad superior, abajo es una franja horizontal completa, dejando aire
// arriba (donde cae la tarjeta) y separación entre las tres.
const POSICION_ZONA = {
  izquierda: { left: 10, top: 10, bottom: '36%', width: '35%' },
  derecha:   { right: 10, top: 10, bottom: '36%', width: '35%' },
  abajo:     { left: 10, right: 10, bottom: 10, height: '28%' },
}

const ICONO_DIRECCION = {
  izquierda: FaChevronLeft,
  derecha: FaChevronRight,
  abajo: FaChevronDown,
}

function barajar(arr) {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Calcula, a partir del desplazamiento de arrastre (dx, dy) y del tamaño del
// contenedor, qué fracción de la tarjeta ha quedado fuera de pantalla en
// cada eje. Es puramente analítico (no lee el DOM de la tarjeta) para poder
// llamarse en cada pointermove sin depender de un re-render previo.
function calcularFraccionFuera(dx, dy, anchoContenedor, altoContenedor) {
  const anchoCarta = Math.min(anchoContenedor * 0.46, 175)
  const altoCarta = anchoCarta / (65 / 85.6) // misma proporción que el CSS de la tarjeta

  const leftCarta = anchoContenedor / 2 - anchoCarta / 2 + dx
  const rightCarta = leftCarta + anchoCarta
  const topCarta = altoContenedor * 0.09 + dy
  const bottomCarta = topCarta + altoCarta

  const overlapX = Math.max(0, Math.min(rightCarta, anchoContenedor) - Math.max(leftCarta, 0))
  const fueraX = 1 - overlapX / anchoCarta

  const overlapY = Math.max(0, Math.min(bottomCarta, altoContenedor) - Math.max(topCarta, 0))
  const fueraY = 1 - overlapY / altoCarta

  return { fueraX, fueraY, haciaIzquierda: dx < 0, haciaAbajo: dy > 0 }
}

export default function TarjetaRepaso({ pregunta, estados, respondido, color, onResponder, leyendo, onLeer, onExplicar, pista = false }) {
  const contenedorRef = useRef(null)
  const arrastreRef = useRef(null) // { inicioX, inicioY, activo }

  const [caida, setCaida] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [zonaElegida, setZonaElegida] = useState(null) // 'izquierda' | 'abajo' | 'derecha' | null
  const [zonaHover, setZonaHover] = useState(null) // hacia dónde se está arrastrando ahora mismo
  const [intensidadHover, setIntensidadHover] = useState(0) // 0-1, qué tan cerca está de salir

  // Reparte las 3 opciones en los 3 destinos; se vuelve a barajar en cada
  // pregunta nueva para que no se pueda memorizar la posición.
  const orden = useMemo(() => barajar([0, 1, 2]), [pregunta])
  const zonas = [
    { id: 'izquierda', indiceOriginal: orden[0] },
    { id: 'derecha', indiceOriginal: orden[1] },
    { id: 'abajo', indiceOriginal: orden[2] },
  ]

  // Animación de "caída" de la tarjeta al entrar una pregunta nueva.
  useEffect(() => {
    setCaida(false)
    setOffset({ x: 0, y: 0 })
    setZonaElegida(null)
    setZonaHover(null)
    setIntensidadHover(0)
    const id = requestAnimationFrame(() => setCaida(true))
    return () => cancelAnimationFrame(id)
  }, [pregunta])

  // Solo se llama desde soltarArrastre(), cuando el arrastre YA cruzó
  // UMBRAL_SALIDA — no hay forma de responder con un toque directo sobre
  // una zona (ver Zona más abajo: ya no tiene onClick), a propósito: un
  // tap accidental sobre una respuesta ya no cuenta como responder.
  function elegir(zonaId) {
    if (respondido) return
    const zona = zonas.find(z => z.id === zonaId)
    if (!zona) return

    setZonaElegida(zonaId)
    onResponder(zona.indiceOriginal)
  }

  function iniciarArrastre(e) {
    if (respondido) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    arrastreRef.current = { inicioX: e.clientX, inicioY: e.clientY }
    setArrastrando(true)
  }

  function moverArrastre(e) {
    if (!arrastreRef.current || respondido) return
    const dx = e.clientX - arrastreRef.current.inicioX
    const dy = Math.max(e.clientY - arrastreRef.current.inicioY, -20)
    setOffset({ x: dx, y: dy })

    const rect = contenedorRef.current?.getBoundingClientRect()
    if (!rect) return
    const { fueraX, fueraY, haciaIzquierda, haciaAbajo } = calcularFraccionFuera(dx, dy, rect.width, rect.height)

    if (haciaAbajo && fueraY > 0 && fueraY >= fueraX) {
      setZonaHover('abajo')
      setIntensidadHover(Math.min(fueraY / UMBRAL_SALIDA, 1))
    } else if (fueraX > 0) {
      setZonaHover(haciaIzquierda ? 'izquierda' : 'derecha')
      setIntensidadHover(Math.min(fueraX / UMBRAL_SALIDA, 1))
    } else {
      setZonaHover(null)
      setIntensidadHover(0)
    }
  }

  function soltarArrastre() {
    if (!arrastreRef.current || respondido) {
      arrastreRef.current = null
      return
    }
    arrastreRef.current = null
    setArrastrando(false)

    const rect = contenedorRef.current?.getBoundingClientRect()
    if (!rect) { setOffset({ x: 0, y: 0 }); setZonaHover(null); setIntensidadHover(0); return }

    const { fueraX, fueraY, haciaIzquierda, haciaAbajo } = calcularFraccionFuera(offset.x, offset.y, rect.width, rect.height)
    let zonaId = null
    if (haciaAbajo && fueraY >= UMBRAL_SALIDA && fueraY >= fueraX) zonaId = 'abajo'
    else if (fueraX >= UMBRAL_SALIDA) zonaId = haciaIzquierda ? 'izquierda' : 'derecha'

    if (zonaId) {
      elegir(zonaId)
    } else {
      // No salió lo suficiente: la tarjeta regresa al centro.
      setOffset({ x: 0, y: 0 })
      setZonaHover(null)
      setIntensidadHover(0)
    }
  }

  // Ya no hay un contenedor por respuesta que rellenar (fondo/borde): solo
  // el color del texto/ícono y un ligero "pop" de escala mientras se
  // arrastra hacia esa zona.
  function estiloZona(zonaId, indiceOriginal) {
    const estado = estados?.[indiceOriginal]

    if (respondido) {
      if (estado === 'correcto') return { texto: 'var(--correct)', escala: 1.08 }
      if (estado === 'incorrecto') return { texto: 'var(--wrong)', escala: 1.08 }
      return { texto: 'var(--text-muted)', escala: 1 }
    }

    if (zonaHover === zonaId) {
      return { texto: color, escala: 1 + intensidadHover * 0.18 }
    }

    return { texto: 'var(--text-muted)', escala: 1 }
  }

  const cartaTransform = `translate(-50%, 0) translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 18}deg)`

  return (
    <div
      ref={contenedorRef}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 400,
        borderRadius: 20,
        overflow: 'hidden',
        userSelect: 'none',
        background: 'linear-gradient(180deg, var(--surface), var(--bg))',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {zonas.map(z => (
        <Zona
          key={z.id}
          zonaId={z.id}
          opcion={pregunta.opciones[z.indiceOriginal]}
          indiceOriginal={z.indiceOriginal}
          estado={estados?.[z.indiceOriginal]}
          respondido={respondido}
          estiloZona={estiloZona}
          esPista={pista && z.indiceOriginal === pregunta.correcta}
        />
      ))}

      {onExplicar && (
        <button
          onClick={onExplicar}
          title="Explicar con IA (Google)"
          className="util-btn fondo-sutil"
          style={{
            position: 'absolute',
            top: 10,
            right: 56,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            color: 'var(--text-muted)',
            fontSize: '0.92rem',
            zIndex: 6,
          }}
        >
          <FaGoogle />
        </button>
      )}

      {onLeer && (
        <button
          onClick={onLeer}
          title={leyendo ? 'Detener lectura' : 'Leer en voz alta'}
          className={`util-btn${leyendo ? '' : ' fondo-sutil'}`}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            background: leyendo ? color : undefined,
            color: leyendo ? '#fff' : 'var(--text-muted)',
            fontSize: '1rem',
            transition: 'background 0.2s ease, color 0.2s ease',
            zIndex: 6,
          }}
        >
          <FaVolumeUp />
        </button>
      )}

      {/* Tarjeta que cae */}
      <div
        data-testid="tarjeta-repaso"
        onPointerDown={iniciarArrastre}
        onPointerMove={moverArrastre}
        onPointerUp={soltarArrastre}
        onPointerCancel={soltarArrastre}
        style={{
          position: 'absolute',
          left: '50%',
          top: caida ? '9%' : '-55%',
          width: 'min(46%, 175px)',
          aspectRatio: '65 / 85.6', // proporción de una tarjeta de crédito (ISO/IEC 7810 ID-1), en vertical
          transform: cartaTransform,
          background: 'linear-gradient(150deg, var(--surface2), var(--surface))',
          border: `2px solid ${color}`,
          borderRadius: 16,
          padding: '18px 14px',
          boxShadow: '0 14px 30px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: respondido ? 'default' : 'grab',
          touchAction: 'none',
          opacity: respondido && zonaElegida ? 0 : 1,
          transition: arrastrando
            ? 'none'
            : 'top 0.55s cubic-bezier(.34,1.35,.64,1), transform 0.35s ease-out, opacity 0.3s ease-out',
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text)', fontWeight: 600, textAlign: 'center' }}>
          <Latex texto={pregunta.pregunta} />
        </div>
      </div>
    </div>
  )
}

// Puramente decorativa: sin contenedor visual propio (sin fondo/borde/
// sombra) Y sin poder recibir clics/toques (pointerEvents: 'none') — la
// ÚNICA forma de responder es arrastrar la tarjeta hasta sacarla de esta
// región (ver soltarArrastre/elegir arriba); un tap accidental sobre una
// respuesta ya no cuenta. El único feedback es el color del texto/ícono y
// un ligero "pop" de escala (ver estiloZona).
function Zona({ zonaId, opcion, indiceOriginal, estado, respondido, estiloZona, esPista }) {
  const { texto, escala } = estiloZona(zonaId, indiceOriginal)
  const pos = POSICION_ZONA[zonaId]
  const esFranjaHorizontal = zonaId === 'abajo'

  let Icono = ICONO_DIRECCION[zonaId]
  if (respondido && estado === 'correcto') Icono = FaCheck
  else if (respondido && estado === 'incorrecto') Icono = FaTimes

  return (
    <div
      data-testid={`zona-repaso-${zonaId}`}
      data-pista-mascota={esPista ? 'true' : undefined}
      style={{
        position: 'absolute',
        ...pos,
        display: 'flex',
        flexDirection: esFranjaHorizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 12px',
        pointerEvents: 'none',
        transform: `scale(${escala})`,
        transition: 'transform 0.15s ease-out',
        zIndex: 2,
      }}
    >
      <Icono style={{ color: texto, fontSize: 14, opacity: 0.7, flexShrink: 0, transition: 'color 0.15s ease' }} />
      <span style={{
        color: texto,
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.3,
        wordBreak: 'break-word',
        textAlign: 'center',
        pointerEvents: 'none',
        transition: 'color 0.15s ease',
      }}>
        <Latex texto={opcion} />
      </span>
    </div>
  )
}
