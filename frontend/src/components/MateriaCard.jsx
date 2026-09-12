import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdBolt } from 'react-icons/md'
import { renderIconoMateria } from '../utils/renderIconoMateria'
import { triggerVibration } from '../utils/haptics'
import { leerModoDificil, guardarModoDificil } from '../utils/modoDificil'

export default function MateriaCard({ materia }) {
  const navigate = useNavigate()
  const [modoDificil, setModoDificil] = useState(() => leerModoDificil(materia.id))

  function alternarModoDificil(e) {
    e.stopPropagation()
    const nuevo = !modoDificil
    setModoDificil(nuevo)
    triggerVibration('success')
    guardarModoDificil(materia.id, nuevo)
  }

  return (
    <div
      onClick={() => navigate(`/leccion/${materia.id}`)}
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
        e.currentTarget.style.borderColor = materia.color
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
        fontSize: '2rem',
        width: '52px', height: '52px',
        background: 'var(--surface2)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {renderIconoMateria(materia.icono, { size: 24 })}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{materia.nombre}</div>
        {/*<div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
          {materia.descripcion}
        </div>*/}
      </div>

      <button
        type="button"
        onClick={alternarModoDificil}
        title={modoDificil ? 'Modo difícil activado' : 'Activar modo difícil'}
        aria-pressed={modoDificil}
        className={modoDificil ? undefined : 'fondo-sutil'}
        style={{
          width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          borderRadius: '50%',
          border: 'none',
          background: modoDificil ? materia.color : undefined,
          color: modoDificil ? '#fff' : 'var(--text-muted)',
          fontSize: '1.3rem',
          cursor: 'pointer',
          transition: 'background 0.2s ease, color 0.2s ease',
        }}
      >
        <MdBolt />
      </button>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>›</span>
    </div>

  )
}