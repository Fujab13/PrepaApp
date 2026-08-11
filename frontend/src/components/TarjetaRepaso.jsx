// TarjetaRepaso.jsx
// Dinámica alterna para las preguntas de repaso/reforzamiento dentro de
// Leccion.jsx: la pregunta cae como una tarjeta y las 3 opciones se colocan
// en los bordes (izquierda / abajo / derecha) de una zona de juego. El
// usuario arrastra la tarjeta hacia el borde donde cree que está la
// respuesta correcta (o toca directamente ese borde).
//
// Es puramente presentacional: quien la usa sigue siendo dueño del estado
// de la pregunta (estados, respondido) y de la lógica de acierto/error
// (onResponder recibe el índice ORIGINAL de la opción, igual que OpcionBtn).

import { useEffect, useMemo, useRef, useState } from 'react'

const UMBRAL = 0.22 // fracción del contenedor que hay que arrastrar para "soltar" en un lado

function barajar(arr) {
  const copia = [...arr]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export default function TarjetaRepaso({ pregunta, estados, respondido, color, onResponder }) {
  const contenedorRef = useRef(null)
  const arrastreRef = useRef(null) // { inicioX, inicioY, activo }

  const [caida, setCaida] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const [zonaElegida, setZonaElegida] = useState(null) // 'izquierda' | 'abajo' | 'derecha' | null

  // Reparte las 3 opciones en los 3 bordes; se vuelve a barajar en cada
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
    const id = requestAnimationFrame(() => setCaida(true))
    return () => cancelAnimationFrame(id)
  }, [pregunta])

  function decidirZona(dx, dy, ancho, alto) {
    const rx = dx / (ancho / 2)
    const ry = dy / (alto / 2)
    if (ry > UMBRAL && ry >= Math.abs(rx)) return 'abajo'
    if (rx < -UMBRAL) return 'izquierda'
    if (rx > UMBRAL) return 'derecha'
    return null
  }

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
    const dy = e.clientY - arrastreRef.current.inicioY
    setOffset({ x: dx, y: Math.max(dy, -20) })
  }

  function soltarArrastre() {
    if (!arrastreRef.current || respondido) {
      arrastreRef.current = null
      return
    }
    arrastreRef.current = null
    setArrastrando(false)

    const rect = contenedorRef.current?.getBoundingClientRect()
    if (!rect) { setOffset({ x: 0, y: 0 }); return }

    const zonaId = decidirZona(offset.x, offset.y, rect.width, rect.height)
    if (zonaId) {
      elegir(zonaId)
    } else {
      setOffset({ x: 0, y: 0 })
    }
  }

  // Una vez respondido, si el usuario soltó dentro de una zona la tarjeta se
  // queda "enviada" hacia ese lado; si no llegó a soltar en ningún lado
  // (poco probable, ej. onResponder llamado por click directo en la zona)
  // la mandamos igual hacia allá para que la animación sea consistente.
  useEffect(() => {
    if (!respondido || !zonaElegida) return
    const distancia = 90
    const destino = {
      izquierda: { x: -distancia, y: 0 },
      derecha: { x: distancia, y: 0 },
      abajo: { x: 0, y: distancia },
    }[zonaElegida]
    if (destino) setOffset(destino)
  }, [respondido, zonaElegida])

  function estiloZona(zonaId, indiceOriginal) {
    const estado = estados?.[indiceOriginal]
    const esElegida = zonaElegida === zonaId
    let borde = 'var(--surface)'
    let fondo = 'var(--surface2)'
    let texto = 'var(--text)'

    if (respondido) {
      if (estado === 'correcto') { borde = 'var(--correct)'; fondo = 'rgba(74,222,128,0.12)'; texto = 'var(--correct)' }
      else if (estado === 'incorrecto') { borde = 'var(--wrong)'; fondo = 'rgba(248,113,113,0.12)'; texto = 'var(--wrong)' }
    } else if (esElegida) {
      borde = color
    }

    return { borde, fondo, texto }
  }

  const cartaTransform = `translate(-50%, 0) translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 18}deg)`

  return (
    <div
      ref={contenedorRef}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 380,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Zona izquierda */}
      <ZonaLateral lado="izquierda" opciones={pregunta.opciones} zonas={zonas} estiloZona={estiloZona} onClick={elegir} deshabilitada={respondido} />
      {/* Zona derecha */}
      <ZonaLateral lado="derecha" opciones={pregunta.opciones} zonas={zonas} estiloZona={estiloZona} onClick={elegir} deshabilitada={respondido} />
      {/* Zona abajo */}
      <ZonaInferior opciones={pregunta.opciones} zonas={zonas} estiloZona={estiloZona} onClick={elegir} deshabilitada={respondido} />

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
          background: 'var(--surface2)',
          border: `2px solid ${color}`,
          borderRadius: 16,
          padding: '18px 14px',
          boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
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
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: 'var(--text)', fontWeight: 500, textAlign: 'justify' }}>
          {pregunta.pregunta}
        </p>
      </div>
    </div>
  )
}

function ZonaLateral({ lado, opciones, zonas, estiloZona, onClick, deshabilitada }) {
  const zona = zonas.find(z => z.id === lado)
  const { borde, fondo, texto } = estiloZona(lado, zona.indiceOriginal)
  return (
    <button
      type="button"
      onClick={() => onClick(lado)}
      disabled={deshabilitada}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 84,
        [lado === 'izquierda' ? 'left' : 'right']: 0,
        width: 73, // 68px + 8%
        background: fondo,
        border: 'none',
        [lado === 'izquierda' ? 'borderRight' : 'borderLeft']: `2px solid ${borde}`,
        color: texto,
        fontSize: 11.5,
        fontWeight: 600,
        padding: '10px 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        lineHeight: 1.3,
        cursor: deshabilitada ? 'default' : 'pointer',
        wordBreak: 'break-word',
      }}
    >
      {opciones[zona.indiceOriginal]}
    </button>
  )
}

function ZonaInferior({ opciones, zonas, estiloZona, onClick, deshabilitada }) {
  const zona = zonas.find(z => z.id === 'abajo')
  const { borde, fondo, texto } = estiloZona('abajo', zona.indiceOriginal)
  return (
    <button
      type="button"
      onClick={() => onClick('abajo')}
      disabled={deshabilitada}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 84,
        background: fondo,
        border: 'none',
        borderTop: `2px solid ${borde}`,
        color: texto,
        fontSize: 12.5,
        fontWeight: 600,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: deshabilitada ? 'default' : 'pointer',
        wordBreak: 'break-word',
      }}
    >
      {opciones[zona.indiceOriginal]}
    </button>
  )
}
