export default function OpcionBtn({ texto, estado, onClick }) {
  const colores = {
    normal:     { border: 'var(--surface2)', bg: 'var(--surface)' },
    correcto:   { border: 'var(--correct)',  bg: 'rgba(74,222,128,0.1)' },
    incorrecto: { border: 'var(--wrong)',    bg: 'rgba(248,113,113,0.1)' },
  }
  const c = colores[estado] || colores.normal

  return (
    <button
      onClick={onClick}
      disabled={estado !== 'normal'}
      style={{
        background: c.bg,
        color: 'var(--text)',
        border: `2px solid ${c.border}`,
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        fontSize: '1rem',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.2s, background 0.2s',
        opacity: estado === 'normal' ? 1 : 1,
      }}
    >
      {texto}
    </button>
  )
}