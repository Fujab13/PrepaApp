// ExamenCard.jsx — tarjeta de examen para SeleccionExamen.jsx, mismo lenguaje
// visual que MateriaCard.jsx (icono + nombre + chevron) pero sin el toggle de
// Modo difícil, que es un concepto propio de Lecciones y no aplica a un
// examen con cronómetro propio.
import { triggerVibration } from '../utils/haptics'

export default function ExamenCard({ nombre, color, icono, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface2)',
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
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
      onPointerUp={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        triggerVibration('success')
      }}
      onPointerCancel={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        fontSize: '1.6rem',
        width: '52px', height: '52px',
        background: `${color}26`,
        color,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icono}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{nombre}</div>
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>›</span>
    </div>
  )
}
