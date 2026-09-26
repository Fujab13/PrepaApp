// CasillaConsentimiento.jsx
// Casilla de aceptación del Aviso de privacidad, con la confirmación de
// autorización de madre/padre/tutor para menores de edad. Se usa al crear
// cuenta (Login.jsx) y al enviar el Formulario de área. El enlace abre el
// aviso en otra pestaña para no perder lo que ya se escribió.
// Toda la fila es tocable (label), con área de 44px de alto como mínimo.

export default function CasillaConsentimiento({ aceptado, onChange, resaltar = false }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        minHeight: 44, padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
        background: 'var(--surface2)',
        border: `1px solid ${resaltar && !aceptado ? 'var(--wrong)' : 'var(--border)'}`,
        transition: 'border-color 0.2s ease',
      }}
    >
      <input
        type="checkbox"
        checked={aceptado}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: '#7c5cbf', cursor: 'pointer' }}
      />
      <span style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
        Acepto el{' '}
        <a
          href="/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ color: '#8b6fcf', fontWeight: 600 }}
        >
          Aviso de privacidad
        </a>
        . Si soy menor de 18, mi madre, padre o tutor lo autorizó.
      </span>
    </label>
  )
}
