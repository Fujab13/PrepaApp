// Ajustes.jsx
// Panel de opciones del usuario (botón de engrane junto al perfil en
// Sidenav.jsx). Por ahora solo "Tus datos": deja borrar los resultados del
// examen y el formulario de área guardados en Supabase — primer paso de
// control de datos personales para alumnos que en su mayoría son menores.
// Requiere sesión: sin ella no hay datos propios que mostrar.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contarMisDatos, borrarMisDatos } from '../services/misDatos'
import ConfirmDialog from '../components/ConfirmDialog'
import ElegirUsuarioDialog from '../components/ElegirUsuarioDialog'
import RecordatoriosAjustes from '../components/RecordatoriosAjustes'
import AjustesSkeleton from '../components/skeletons/AjustesSkeleton'

import { AiOutlineClose } from 'react-icons/ai'

const OPCIONES = [
  { clave: 'examen', titulo: 'Resultados del examen', confirmar: 'Borrar resultados del examen' },
  { clave: 'formulario', titulo: 'Formulario de área', confirmar: 'Borrar formulario de área' },
]

const estiloEncabezado = {
  color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
}

const estiloTarjeta = {
  background: 'var(--surface2)', borderRadius: 'var(--radius)', overflow: 'hidden',
}

function filaStyle(i) {
  return {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
  }
}

export default function Ajustes() {
  const navigate = useNavigate()
  const { user, cargando: cargandoAuth, perfil, refrescarPerfil } = useAuth()
  const [editandoUsuario, setEditandoUsuario] = useState(false)

  const [conteos, setConteos] = useState(null) // { examen: n, formulario: n }
  const [borrando, setBorrando] = useState(null) // clave en curso
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)

  useEffect(() => {
    if (!cargandoAuth && !user) navigate('/login', { replace: true })
  }, [cargandoAuth, user, navigate])

  useEffect(() => {
    if (!user) return
    let cancelado = false
    contarMisDatos(user.id)
      .then(c => { if (!cancelado) setConteos(c) })
      .catch(() => { if (!cancelado) setError('No se pudieron cargar tus datos.') })
    return () => { cancelado = true }
  }, [user])

  const borrar = useCallback(async (clave) => {
    setBorrando(clave)
    setError('')
    try {
      const borradas = await borrarMisDatos(clave, user.id)
      // Filas existentes pero 0 borradas = RLS lo bloqueó (ver misDatos.js).
      if (borradas === 0 && conteos?.[clave] > 0) throw new Error('sin_permiso')
      setConteos(c => ({ ...c, [clave]: 0 }))
    } catch {
      setError('No se pudo borrar. Intenta más tarde.')
    } finally {
      setBorrando(null)
    }
  }, [user, conteos])

  const pedirConfirmacion = (op) => {
    setConfirmacion({
      titulo: op.confirmar,
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      colorConfirmar: 'var(--wrong)',
      accion: () => borrar(op.clave),
    })
  }

  if (!user || (conteos === null && !error)) return <AjustesSkeleton />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="page-topbar-compact">
        <button onClick={() => navigate('/')} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Ajustes</h2>
      </header>

      <main className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={estiloEncabezado}>Tu cuenta</p>
        <div style={estiloTarjeta}>
          <div style={filaStyle(0)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{perfil?.usuario ?? '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Tu nombre en el ranking</p>
            </div>
            <button
              type="button"
              onClick={() => setEditandoUsuario(true)}
              disabled={!perfil?.usuario}
              style={{
                minHeight: 44, minWidth: 78, padding: '0 16px', borderRadius: 12, flexShrink: 0,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Cambiar
            </button>
          </div>
        </div>

        <p style={{ ...estiloEncabezado, marginTop: 8 }}>Notificaciones</p>
        <RecordatoriosAjustes user={user} />

        <p style={{ ...estiloEncabezado, marginTop: 8 }}>Tus datos</p>

        <div style={estiloTarjeta}>
          {OPCIONES.map((op, i) => {
            const hayDatos = (conteos?.[op.clave] ?? 0) > 0
            const enCurso = borrando === op.clave
            return (
              <div key={op.clave} style={filaStyle(i)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{op.titulo}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {conteos === null ? '—' : hayDatos ? 'Guardado en tu cuenta' : 'Sin datos guardados'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => pedirConfirmacion(op)}
                  disabled={!hayDatos || enCurso}
                  style={{
                    minHeight: 44, minWidth: 78, padding: '0 16px', borderRadius: 12, flexShrink: 0,
                    border: `1px solid ${hayDatos ? 'var(--wrong)' : 'var(--border)'}`,
                    background: 'transparent',
                    color: hayDatos ? 'var(--wrong)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.82rem',
                    cursor: hayDatos && !enCurso ? 'pointer' : 'default',
                    opacity: hayDatos ? 1 : 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {enCurso ? <span className="sp-spinner" /> : 'Borrar'}
                </button>
              </div>
            )
          })}
        </div>

        {error && <p style={{ color: 'var(--wrong)', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>{error}</p>}

        <button
          type="button"
          onClick={() => navigate('/privacidad')}
          style={{
            ...estiloTarjeta, ...filaStyle(0), width: '100%', minHeight: 52, marginTop: 8,
            border: 'none', cursor: 'pointer', textAlign: 'left',
            color: 'var(--text)', fontSize: '0.92rem', fontWeight: 600,
          }}
        >
          <span style={{ flex: 1 }}>Aviso de privacidad</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>›</span>
        </button>
      </main>

      <ElegirUsuarioDialog
        abierto={editandoUsuario}
        titulo="Cambiar usuario"
        usuarioActual={perfil?.usuario}
        onCerrar={() => setEditandoUsuario(false)}
        onGuardado={() => { refrescarPerfil(); setEditandoUsuario(false) }}
      />

      <ConfirmDialog
        abierto={!!confirmacion}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.textoConfirmar}
        colorConfirmar={confirmacion?.colorConfirmar}
        onCancelar={() => setConfirmacion(null)}
        onConfirmar={() => {
          const accion = confirmacion?.accion
          setConfirmacion(null)
          if (accion) accion()
        }}
      />
    </div>
  )
}
