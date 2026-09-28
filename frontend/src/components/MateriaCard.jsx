import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdBolt, MdFitnessCenter } from 'react-icons/md'
import { renderIconoMateria } from '../utils/renderIconoMateria'
import { triggerVibration } from '../utils/haptics'
import { leerModoDificil, guardarModoDificil } from '../utils/modoDificil'
import { leerModoConceptos, guardarModoConceptos } from '../utils/modoConceptos'

// Botón redondo de modo (rayo = difícil, pesa = conceptos): lleno con el
// color de la materia cuando está activo.
function BotonModo({ activo, color, titulo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
      aria-pressed={activo}
      className={activo ? undefined : 'fondo-sutil'}
      style={{
        width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '50%',
        border: 'none',
        background: activo ? color : undefined,
        color: activo ? '#fff' : 'var(--text-muted)',
        fontSize: '1.3rem',
        cursor: 'pointer',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

export default function MateriaCard({ materia }) {
  const navigate = useNavigate()
  // Modo difícil (rayo) y Modo conceptos (pesa) son excluyentes: activar
  // uno apaga el otro.
  const [modoDificil, setModoDificil] = useState(() => leerModoDificil(materia.id))
  const [modoConceptos, setModoConceptos] = useState(() => leerModoConceptos(materia.id) && !leerModoDificil(materia.id))

  function alternarModoDificil(e) {
    e.stopPropagation()
    const nuevo = !modoDificil
    setModoDificil(nuevo)
    triggerVibration('success')
    guardarModoDificil(materia.id, nuevo)
    if (nuevo && modoConceptos) {
      setModoConceptos(false)
      guardarModoConceptos(materia.id, false)
    }
  }

  function alternarModoConceptos(e) {
    e.stopPropagation()
    const nuevo = !modoConceptos
    setModoConceptos(nuevo)
    triggerVibration('success')
    guardarModoConceptos(materia.id, nuevo)
    if (nuevo && modoDificil) {
      setModoDificil(false)
      guardarModoDificil(materia.id, false)
    }
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

      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <BotonModo
          activo={modoConceptos}
          color={materia.color}
          titulo={modoConceptos ? 'Modo conceptos activado' : 'Activar modo conceptos'}
          onClick={alternarModoConceptos}
        >
          <MdFitnessCenter />
        </BotonModo>
        <BotonModo
          activo={modoDificil}
          color={materia.color}
          titulo={modoDificil ? 'Modo difícil activado' : 'Activar modo difícil'}
          onClick={alternarModoDificil}
        >
          <MdBolt />
        </BotonModo>
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>›</span>
    </div>

  )
}