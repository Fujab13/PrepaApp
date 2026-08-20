import { useEffect, useCallback } from 'react'

// Modal de confirmación minimalista, reemplazo estético de window.confirm().
// Uso: guarda en un state el mensaje/acción a confirmar y renderiza este
// componente una sola vez por página (ver Leccion.jsx y Examen.jsx).
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  colorConfirmar = '#7c5cbf',
  onConfirmar,
  onCancelar,
}) {
  const cerrar = useCallback(() => {
    if (onCancelar) onCancelar()
  }, [onCancelar])

  useEffect(() => {
    if (!abierto) return

    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alPresionarTecla = (e) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', alPresionarTecla)

    return () => {
      document.body.style.overflow = overflowPrevio
      window.removeEventListener('keydown', alPresionarTecla)
    }
  }, [abierto, cerrar])

  if (!abierto) return null

  return (
    <div
      className="cd-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) cerrar() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 200,
      }}
    >
      <div
        className="cd-card"
        role="dialog"
        aria-modal="true"
        aria-label={titulo || mensaje}
        style={{
          width: '100%',
          maxWidth: 320,
          background: 'var(--surface2)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)',
          padding: '22px 20px',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {titulo && (
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            {titulo}
          </p>
        )}

        {mensaje && (
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>
            {mensaje}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={cerrar}
            className="cd-btn"
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            {textoCancelar}
          </button>
          <button
            onClick={() => onConfirmar && onConfirmar()}
            className="cd-btn"
            style={{
              flex: 1,
              background: colorConfirmar,
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 8px 20px -10px rgba(0,0,0,0.6)',
            }}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
