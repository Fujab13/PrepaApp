import { useNavigate } from 'react-router-dom'
import { renderIconoMateria } from '../utils/renderIconoMateria'

export default function TemariosCards({ materias, featuredColor, onSelect }) {
  const navigate = useNavigate()

  const handleClick = (materia) => {
    if (typeof onSelect === 'function') {
      onSelect(materia)
    }
    navigate(`/lectura/${materia.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {materias.map((materia) => (
        <div
          key={materia.id}
          onClick={() => handleClick(materia)}
          style={{
            width: '100%',
            minHeight: '96px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)',
              borderRadius: '14px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              minHeight: '96px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: featuredColor || '#ccc'
            }} />

            <div style={{
              fontSize: '1.7rem',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {renderIconoMateria(materia.icono, { size: 24 })}
            </div>

            <div style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.64rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Temario
              </span>
              <div style={{
                color: 'var(--text)',
                fontSize: '1.05rem',
                fontWeight: '600',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {materia.descripcion}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '1.4rem',
              paddingLeft: '8px',
              userSelect: 'none'
            }}>
              ›
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
