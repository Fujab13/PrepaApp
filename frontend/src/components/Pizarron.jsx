// Pizarron.jsx — marco de la ilustración (enlace_svg) de cada pregunta o
// concepto en Leccion.jsx, como un pizarrón: esquinas marcadas con el color
// de la materia y la repisa del gis abajo. Los neutros salen de las variables
// del tema (global.css); solo las esquinas usan el color de acento.
// Si la imagen no carga, se oculta el pizarrón completo (no un marco vacío).

import { useState } from 'react'

const ESQUINAS = [
  { top: 8, left: 8, borderTop: true, borderLeft: true },
  { top: 8, right: 8, borderTop: true, borderRight: true },
  { bottom: 8, left: 8, borderBottom: true, borderLeft: true },
  { bottom: 8, right: 8, borderBottom: true, borderRight: true },
]

export default function Pizarron({ src, alt, color = '#7c5cbf' }) {
  const [fallo, setFallo] = useState(false)
  if (fallo) return null

  const linea = `2px solid ${color}`

  return (
    <figure style={{ margin: '0 0 16px' }}>
      <div style={{
        position: 'relative', margin: '0 6px', padding: 12, minHeight: 120,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(160deg, var(--surface2), var(--surface))',
        border: '1.5px solid var(--border-strong)', borderRadius: 10,
        boxShadow: '0 10px 24px -16px rgba(0,0,0,0.6)',
      }}>
        {ESQUINAS.map(({ borderTop, borderRight, borderBottom, borderLeft, ...pos }, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute', ...pos, width: 14, height: 14, opacity: 0.8,
              borderTop: borderTop ? linea : undefined,
              borderRight: borderRight ? linea : undefined,
              borderBottom: borderBottom ? linea : undefined,
              borderLeft: borderLeft ? linea : undefined,
              borderRadius: 3,
            }}
          />
        ))}
        <img
          src={src}
          alt={alt}
          onError={() => setFallo(true)}
          style={{ display: 'block', width: '100%', maxHeight: 400, objectFit: 'contain' }}
        />
      </div>

      {/* Repisa del gis: un poco más ancha que el pizarrón. */}
      <div aria-hidden="true" style={{
        height: 6, marginTop: 3, borderRadius: 3,
        background: 'var(--border-strong)',
      }} />
    </figure>
  )
}
