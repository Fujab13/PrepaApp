import SubtemaItem from '../components/SubtemaItem'

export default function Tarjeta({ tema, color, completados, onToggleSubtema }) {
  const total = tema.subtemas.length
  const completadosCount = tema.subtemas.filter(s => completados.has(s.id)).length
  const progreso = total === 0 ? 0 : Math.round((completadosCount / total) * 100)

  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '20px', overflow: 'hidden' }}>

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

      {/* Teoría */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
    </div>
  )
}