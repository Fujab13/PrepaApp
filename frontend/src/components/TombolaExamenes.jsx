// TombolaExamenes.jsx — selector de exámenes para SeleccionExamen.jsx en
// forma de rodillo 3D (como un cartucho de tarjetas que gira): las tarjetas
// van montadas en un cilindro que rota sobre el eje X. NO se gira tocándola
// (a propósito: en móvil el arrastre peleaba con el scroll y los toques
// accidentales): la mueven los botones de la página, por `ref`
// { anterior, siguiente, elegir }, y las flechas del teclado. Siempre se
// acomoda con una tarjeta de frente, y `onCambio(indice)` avisa cuál. Al
// montarse da una vuelta completa, como si las tarjetas cayeran al cartucho.
//
// Sin librerías: el ángulo vive en un estado y cada tarjeta se coloca con
// rotateX(-diferencia) translateZ(radio) respecto al frente, así que solo se
// dibujan las de la mitad delantera.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { triggerVibration } from '../utils/haptics'

const ALTO_TARJETA = 84
const SEPARACION = 6 // espacio entre tarjetas vecinas, en el borde del cilindro

const easeOutCubic = t => 1 - (1 - t) ** 3
const mod = (a, n) => ((a % n) + n) % n

// Diferencia angular normalizada a (-180, 180].
function diferencia(a, b) {
  const d = mod(a - b, 360)
  return d > 180 ? d - 360 : d
}

const TombolaExamenes = forwardRef(function TombolaExamenes({ examenes, onElegir, onCambio }, ref) {
  const n = examenes.length
  const paso = 360 / n
  // Radio para que las tarjetas vecinas no se encimen en el frente.
  const radio = Math.max(140, (ALTO_TARJETA / 2 + SEPARACION) / Math.tan(Math.PI / n))
  const altoVisor = Math.round(2 * radio * Math.sin(Math.min(90, paso * 2) * Math.PI / 180) + ALTO_TARJETA)

  const sinMovimiento = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [rot, setRot] = useState(sinMovimiento ? 0 : -360)
  const rotRef = useRef(rot)
  const animRef = useRef(0)
  // A dónde va la animación en curso: los pasos se suman sobre esto (no
  // sobre el ángulo a medio camino), así varios toques rápidos o dejar
  // presionado avanzan exactamente una tarjeta cada uno.
  const destinoRef = useRef(0)
  const entradaRef = useRef(!sinMovimiento) // true mientras da la vuelta de entrada

  const seleccionado = mod(Math.round(rot / paso), n)
  const seleccionadoRef = useRef(seleccionado)

  function fijar(valor) {
    rotRef.current = valor
    setRot(valor)
  }

  function animarA(destino, duracion = 450) {
    cancelAnimationFrame(animRef.current)
    destinoRef.current = destino
    const desde = rotRef.current
    if (sinMovimiento || desde === destino) return fijar(destino)
    const inicio = performance.now()
    const cuadro = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      fijar(desde + (destino - desde) * easeOutCubic(t))
      if (t < 1) animRef.current = requestAnimationFrame(cuadro)
      else cortarEntrada()
    }
    animRef.current = requestAnimationFrame(cuadro)
  }

  // Al cortar la vuelta de entrada se parte de la tarjeta en la que iba.
  const base = () => (entradaRef.current ? Math.round(rotRef.current / paso) * paso : destinoRef.current)

  // Vuelta de entrada.
  useEffect(() => {
    animarA(0, 1300)
    return () => cancelAnimationFrame(animRef.current)
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // "Clic" háptico al pasar de una tarjeta a otra.
  useEffect(() => {
    if (seleccionadoRef.current === seleccionado) return
    seleccionadoRef.current = seleccionado
    // Durante la vuelta de entrada pasan todas: no se avisa cada una.
    if (entradaRef.current) return
    triggerVibration('tick')
    onCambio?.(seleccionado)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionado])

  // Cortar la vuelta de entrada (tocar o usar un botón) deja al frente la
  // tarjeta en la que iba: se avisa esa.
  function cortarEntrada() {
    if (!entradaRef.current) return
    entradaRef.current = false
    onCambio?.(seleccionadoRef.current)
  }

  // Easing de salida: arranca rápido (responde al instante al toque) y
  // frena suave al encajar la tarjeta.
  const mover = (dir) => { const desde = base(); cortarEntrada(); animarA(desde + dir * paso, 380) }
  const siguiente = () => mover(1)
  const anterior = () => mover(-1)
  const elegir = () => onElegir(examenes[seleccionadoRef.current])

  useImperativeHandle(ref, () => ({ siguiente, anterior, elegir }))

  function alTeclear(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); siguiente() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); anterior() }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir() }
  }

  return (
    <div
      role="listbox"
      tabIndex={0}
      aria-label="Exámenes"
      aria-activedescendant={`tombola-${examenes[seleccionado].id}`}
      onKeyDown={alTeclear}
      style={{
        position: 'relative', width: '100%', height: altoVisor,
        perspective: 900, userSelect: 'none', outline: 'none', pointerEvents: 'none',
        // Las tarjetas se desvanecen hacia arriba y abajo, como si se
        // perdieran dentro del cartucho.
        maskImage: 'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
      }}
    >
      {/* Ventana del cartucho: dos rieles que enmarcan la ranura del frente. */}
      {[-1, 1].map(lado => (
        <span
          key={lado}
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, right: 0, height: 2, borderRadius: 2,
            top: `calc(50% + ${lado * (ALTO_TARJETA / 2 + 8)}px)`,
            background: 'linear-gradient(90deg, transparent, var(--border-strong) 12%, var(--border-strong) 88%, transparent)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${-radio}px)` }}>
        {examenes.map((examen, i) => {
          const d = diferencia(i * paso, rot)
          if (Math.abs(d) >= 90) return null // mitad trasera del cilindro
          const alFrente = i === seleccionado
          const { Icono, color } = examen
          return (
            <div
              key={examen.id}
              id={`tombola-${examen.id}`}
              role="option"
              aria-selected={alFrente}
              style={{
                position: 'absolute', left: 0, right: 0, top: '50%', height: ALTO_TARJETA, marginTop: -ALTO_TARJETA / 2,
                transform: `rotateX(${-d}deg) translateZ(${radio}px)`,
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                opacity: 0.3 + 0.7 * Math.cos((d * Math.PI) / 180),
                display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px',
                background: alFrente
                  ? `linear-gradient(100deg, ${color}2e, var(--surface2) 55%)`
                  : 'var(--surface2)',
                borderRadius: 'var(--radius)',
                border: `2px solid ${alFrente ? color : 'var(--border)'}`,
                boxShadow: alFrente ? `0 12px 30px -14px ${color}` : 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{
                fontSize: '1.35rem', width: 48, height: 48, flexShrink: 0, borderRadius: 12,
                background: `${color}26`, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icono />
              </div>
              <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                {examen.nombre}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default TombolaExamenes
