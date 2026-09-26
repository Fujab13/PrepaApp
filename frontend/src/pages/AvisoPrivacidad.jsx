// AvisoPrivacidad.jsx
// Página pública (sin sesión) con el Aviso de privacidad. El texto vive en
// data/avisoPrivacidad.js; aquí solo se presenta. Se enlaza desde la
// casilla de consentimiento del registro y del Formulario de área (en otra
// pestaña, para no perder lo que el alumno ya escribió) y desde Ajustes.

import { useNavigate } from 'react-router-dom'
import { SECCIONES, VERSION_AVISO } from '../data/avisoPrivacidad'
import { AiOutlineClose } from 'react-icons/ai'

const fechaLegible = new Date(`${VERSION_AVISO}T12:00:00`).toLocaleDateString('es-MX', {
  day: 'numeric', month: 'long', year: 'numeric',
})

export default function AvisoPrivacidad() {
  const navigate = useNavigate()

  // Abierta en pestaña nueva (desde una casilla) no hay "atrás": se va a Home.
  const salir = () => (window.history.length > 1 ? navigate(-1) : navigate('/'))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="page-topbar-compact" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg)', paddingBottom: 12 }}>
        <button onClick={salir} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Aviso de privacidad</h2>
      </header>

      <main className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 48 }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Última actualización: {fechaLegible}
        </p>

        {SECCIONES.map(sec => (
          <section key={sec.titulo} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)' }}>{sec.titulo}</h3>
            {sec.lista && (
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sec.lista.map(item => (
                  <li key={item} style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>{item}</li>
                ))}
              </ul>
            )}
            {sec.parrafos?.map(p => (
              <p key={p} style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{p}</p>
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}
