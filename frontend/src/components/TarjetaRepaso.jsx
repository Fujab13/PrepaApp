// TarjetaRepaso.jsx
// Dinámica alterna para las preguntas de repaso/reforzamiento dentro de
// Leccion.jsx: la pregunta cae como una tarjeta sobre una pantalla dividida
// en 3 zonas triangulares (izquierda / derecha / abajo), cada una con la
// respuesta escrita dentro. El usuario arrastra la tarjeta hasta sacarla de
// pantalla (al menos un 70% de su tamaño) en la dirección de la zona donde
// cree que está la respuesta correcta, o toca esa zona directamente.
//
// Es puramente presentacional: quien la usa sigue siendo dueño del estado
// de la pregunta (estados, respondido) y de la lógica de acierto/error
// (onResponder recibe el índice ORIGINAL de la opción, igual que OpcionBtn).

import { useEffect, useMemo, useRef, useState } from 'react'

const UMBRAL_SALIDA = 0.7 // fracción de la tarjeta que debe salir del contenedor para contar como respuesta

// Cada zona es un triángulo; las 3 juntas cubren todo el rectángulo,
// encontrándose en el punto superior central donde cae la tarjeta.
const FORMA_ZONA = {
  izquierda: { clip: 'polygon(0% 0%, 50% 0%, 0% 100%)', texto: { left: '20%', top: '42%', width: '34%' } },
  derecha:   { clip: 'polygon(50% 0%, 100% 0%, 100% 100%)', texto: { left: '80%', top: '42%', width: '34%' } },
  abajo:     { clip: 'polygon(0% 100%, 50% 0%, 100% 100%)', texto: { left: '50%', top: '78%', width: '54%' } },
}

function barajar(arr) {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Convierte un hex de 6 dígitos + una opacidad 0-1 a un hex de 8 dígitos.
function conAlfa(hex, alfa) {
  const a = Math.round(Math.min(Math.max(alfa, 0), 1) * 255).toString(16).padStart(2, '0')
  return `${hex}${a}`
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

// Desplazamiento que deja la tarjeta completamente fuera de pantalla hacia
// una zona (para el "vuelo" al tocar la zona directamente, sin arrastrar).
function calcularOffsetSalida(zonaId, ancho, alto) {
  const anchoCarta = Math.min(ancho * 0.46, 175)
  if (zonaId === 'izquierda') return { x: -(ancho / 2 + anchoCarta / 2), y: 0 }
  if (zonaId === 'derecha') return { x: ancho / 2 + anchoCarta / 2, y: 0 }
  return { x: 0, y: alto * 0.91 }
}

export default function TarjetaRepaso({ pregunta, estados, respondido, color, onResponder }) {
  const contenedorRef = useRef(null)
  const arrastreRef = useRef(null) // { inicioX, inicioY, activo }

  const [caida, setCaida] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [zonaElegida, setZonaElegida] = useState(null) // 'izquierda' | 'abajo' | 'derecha' | null
  const [zonaHover, setZonaHover] = useState(null) // hacia dónde se está arrastrando ahora mismo
  const [intensidadHover, setIntensidadHover] = useState(0) // 0-1, qué tan cerca está de salir

  // Reparte las 3 opciones en los 3 triángulos; se vuelve a barajar en cada
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

  function elegir(zonaId) {
    if (respondido) return
    const zona = zonas.find(z => z.id === zonaId)
    if (!zona) return

    const rect = contenedorRef.current?.getBoundingClientRect()
    if (rect) {
      const { fueraX, fueraY, haciaAbajo } = calcularFraccionFuera(offset.x, offset.y, rect.width, rect.height)
      const yaSalio = zonaId === 'abajo'
        ? (haciaAbajo && fueraY >= UMBRAL_SALIDA)
        : fueraX >= UMBRAL_SALIDA
      // Si no se llegó arrastrando (toque directo sobre la zona), se manda
      // la tarjeta a volar fuera de pantalla para que la animación sea
      // consistente con la de un arrastre completo.
      if (!yaSalio) setOffset(calcularOffsetSalida(zonaId, rect.width, rect.height))
    }

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

  function estiloZona(zonaId, indiceOriginal) {
    const estado = estados?.[indiceOriginal]

    if (respondido) {
      if (estado === 'correcto') return { fondo: 'rgba(74,222,128,0.3)', borde: 'var(--correct)', texto: 'var(--correct)' }
      if (estado === 'incorrecto') return { fondo: 'rgba(248,113,113,0.3)', borde: 'var(--wrong)', texto: 'var(--wrong)' }
      return { fondo: conAlfa(color, 0.05), borde: 'transparent', texto: 'var(--text-muted)' }
    }

    if (zonaHover === zonaId) {
      const alfa = 0.08 + intensidadHover * 0.32
      return {
        fondo: conAlfa(color, alfa),
        borde: intensidadHover >= 1 ? color : 'transparent',
        texto: 'var(--text)',
      }
    }

    return { fondo: conAlfa(color, 0.05), borde: 'transparent', texto: 'var(--text-muted)' }
  }

  const cartaTransform = `translate(-50%, 0) translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 18}deg)`

  return (
    <div
      ref={contenedorRef}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 380,
        borderRadius: 0,
        overflow: 'hidden',
        userSelect: 'none',
        background: 'var(--bg)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginLeft: -16,
        marginRight: -16,
      }}
    >
      {zonas.map(z => (
        <Zona
          key={z.id}
          zonaId={z.id}
          opcion={pregunta.opciones[z.indiceOriginal]}
          indiceOriginal={z.indiceOriginal}
          estiloZona={estiloZona}
          onClick={elegir}
          deshabilitada={respondido}
        />
      ))}

      {/* Tarjeta que cae */}
      <div
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
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: 'var(--text)', fontWeight: 600, textAlign: 'center' }}>
          {pregunta.pregunta}
        </p>
      </div>
    </div>
  )
}

function Zona({ zonaId, opcion, indiceOriginal, estiloZona, onClick, deshabilitada }) {
  const { fondo, borde, texto } = estiloZona(zonaId, indiceOriginal)
  const forma = FORMA_ZONA[zonaId]
  return (
    <button
      type="button"
      onClick={() => onClick(zonaId)}
      disabled={deshabilitada}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        clipPath: forma.clip,
        background: fondo,
        border: `2px solid ${borde}`,
        borderRadius: 0,
        padding: 0,
        cursor: deshabilitada ? 'default' : 'pointer',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        zIndex: 2,
      }}
    >
      <span style={{
        position: 'absolute',
        left: forma.texto.left,
        top: forma.texto.top,
        width: forma.texto.width,
        transform: 'translate(-50%, -50%)',
        color: texto,
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.3,
        wordBreak: 'break-word',
        pointerEvents: 'none',
        transition: 'color 0.15s ease',
      }}>
        {opcion}
      </span>
    </button>
  )
}
