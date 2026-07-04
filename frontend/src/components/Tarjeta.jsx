import { useState, useMemo } from 'react'
import SubtemaItem from './SubtemaItem'

export default function Tarjeta({ tema, color, completados, onToggleSubtema }) {
  const [modo, setModo] = useState('teoria') // 'teoria' | 'practica'

  const total = tema.subtemas.length
  const completadosCount = tema.subtemas.filter(s => completados.has(s.id)).length
  const progreso = total === 0 ? 0 : Math.round((completadosCount / total) * 100)

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '20px', overflow: 'hidden' }}>

      {/* Barra de progreso */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color, margin: 0 }}>
            {tema.titulo}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #9ca3af)', fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>
            {progreso}%
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progreso}%`,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
              transition: 'width 300ms ease'
            }}
          />
        </div>
      </div>

      {/* Tabs internos: Teoría / Práctica rápida */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 16
        }}
      >
        {[
          { key: 'teoria', label: 'Teoría' },
          { key: 'practica', label: 'Práctica rápida' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setModo(t.key)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 9,
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: modo === t.key ? color : 'transparent',
              color: modo === t.key ? '#000' : 'var(--text-muted, #9ca3af)',
              transition: 'all 300ms ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido: Teoría (lista de subtemas) o Práctica rápida (placeholder) */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: modo === 'teoria' ? 'flex' : 'none',
            flexDirection: 'column',
            gap: 2,
            opacity: modo === 'teoria' ? 1 : 0,
            transition: 'opacity 300ms ease'
          }}
        >
          {tema.subtemas.map(subtema => (
            <SubtemaItem
              key={subtema.id}
              subtema={subtema}
              color={color}
              completado={completados.has(subtema.id)}
              onToggleCompletado={() => onToggleSubtema(subtema.id)}
            />
          ))}
        </div>

        {modo === 'practica' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '40px 16px',
              textAlign: 'center',
              opacity: 1,
              transition: 'opacity 300ms ease'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}
            >
              ruben
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)', maxWidth: 240, lineHeight: 1.5 }}>
              pendiente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}