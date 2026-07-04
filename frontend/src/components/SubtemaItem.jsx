import { useRef, useState, useEffect } from 'react'

/**
 * SubtemaItem
 * Una fila de la lista de subtemas. Funciona como accordion:
 * - Click en el texto del título -> expande/colapsa una sub-lista de conceptos.
 * - Click en el círculo de la izquierda -> marca/desmarca el subtema como estudiado
 *   (esto NO abre/cierra el accordion, son acciones independientes).
 *
 * Props:
 * - subtema: { id, titulo, conceptos: string[] }
 * - completado: boolean
 * - onToggleCompletado: () => void
 * - color: string (color de acento de la materia, ej. '#22d3ee')
 */
export default function SubtemaItem({ subtema, completado, onToggleCompletado, color }) {
  const [abierto, setAbierto] = useState(false)
  const contentRef = useRef(null)
  const [maxHeight, setMaxHeight] = useState('0px')

  // Recalcula la altura real del contenido cada vez que se abre/cierra,
  // así la transición de max-height es siempre suave sin importar cuánto texto haya.
  useEffect(() => {
    if (abierto && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`)
    } else {
      setMaxHeight('0px')
    }
  }, [abierto, subtema.conceptos])

  return (
    <div
      style={{
        borderRadius: 14,
        background: abierto ? 'var(--surface-2, rgba(255,255,255,0.04))' : 'transparent',
        transition: 'background 300ms ease',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 8px',
          cursor: 'pointer'
        }}
        onClick={() => setAbierto(o => !o)}
      >
        {/* Checkbox circular de progreso — independiente del accordion */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCompletado()
          }}
          aria-label={completado ? 'Marcar como no estudiado' : 'Marcar como estudiado'}
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `2px solid ${completado ? color : 'var(--text-muted, #6b7280)'}`,
            background: completado ? color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 300ms ease'
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: completado ? 1 : 0,
              transform: completado ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 200ms ease'
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        {/* Título del subtema */}
        <span
          style={{
            flex: 1,
            fontSize: '0.92rem',
            color: completado ? 'var(--text-muted, #9ca3af)' : 'var(--text, #fff)',
            textDecoration: completado ? 'line-through' : 'none',
            textDecorationColor: 'var(--text-muted, #9ca3af)',
            transition: 'color 300ms ease'
          }}
        >
          {subtema.titulo}
        </span>

        {/* Chevron indicador de expandido/colapsado */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted, #9ca3af)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms ease'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Sub-lista de conceptos clave — animada con max-height + opacity */}
      <div
        style={{
          maxHeight,
          opacity: abierto ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 300ms ease, opacity 300ms ease'
        }}
      >
        <div ref={contentRef} style={{ padding: '2px 8px 14px 50px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subtema.conceptos.map((concepto, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted, #9ca3af)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  lineHeight: 1.5
                }}
              >
                <span style={{ color, marginTop: 2 }}>•</span>
                <span>{concepto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}