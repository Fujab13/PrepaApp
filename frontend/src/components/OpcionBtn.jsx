import Latex from './Latex'

export default function OpcionBtn({ texto, estado, onClick }) {
  const colores = {
    normal:     { border: 'rgba(255,255,255,0.08)', bg: 'linear-gradient(180deg, var(--surface2), var(--surface))', sombra: 'rgba(0,0,0,0.45)' },
    correcto:   { border: 'var(--correct)', bg: 'rgba(74,222,128,0.1)',  sombra: 'rgba(74,222,128,0.25)' },
    incorrecto: { border: 'var(--wrong)',   bg: 'rgba(248,113,113,0.1)', sombra: 'rgba(248,113,113,0.25)' },
  }
  const c = colores[estado] || colores.normal

  return (
    <button
      onClick={onClick}
      disabled={estado !== 'normal'}
      className="opcion-btn"
      data-gamificacion="manual"
      style={{
        background: c.bg,
        color: 'var(--text)',
        border: `2px solid ${c.border}`,
        borderRadius: 6,
        padding: '16px 20px',
        fontSize: '1rem',
        fontWeight: 500,
        textAlign: 'left',
        width: '100%',
        boxShadow: `0 3px 10px -4px ${c.sombra}`,
      }}
    >
      <Latex texto={texto} />
    </button>
  )
}
