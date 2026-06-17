import { useNavigate } from 'react-router-dom'

export default function MateriaCard({ materia }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/leccion/${materia.id}`)}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = materia.color
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        fontSize: '2rem',
        width: '52px', height: '52px',
        background: 'var(--surface2)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {materia.icono}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{materia.nombre}</div>
        {/*<div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
          {materia.descripcion}
        </div>*/}
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>›</span>
    </div>
    
  )
}