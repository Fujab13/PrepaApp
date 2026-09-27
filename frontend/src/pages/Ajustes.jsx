// Ajustes.jsx
// Panel de opciones del usuario (botón de engrane junto al perfil en
// Sidenav.jsx). "Música enriquecida" cambia la música generada por la lista
// de .mp3 de src/assets/musica (ver MusicContext.jsx); se desbloquea
// compartiendo la app 2 veces (services/compartirApp.js). "Tus datos": deja borrar los resultados del
// examen y el formulario de área guardados en Supabase — primer paso de
// control de datos personales para alumnos que en su mayoría son menores.
// Requiere sesión: sin ella no hay datos propios que mostrar.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import { contarMisDatos, borrarMisDatos } from '../services/misDatos'
import {
  COMPARTIDAS_REQUERIDAS,
  compartirEnlaceApp,
  leerProgresoCompartir,
  guardarProgresoCompartir,
} from '../services/compartirApp'
import ConfirmDialog from '../components/ConfirmDialog'
import ElegirUsuarioDialog from '../components/ElegirUsuarioDialog'
import RecordatoriosAjustes from '../components/RecordatoriosAjustes'
import AjustesSkeleton from '../components/skeletons/AjustesSkeleton'

import { AiOutlineClose } from 'react-icons/ai'
import { RiShareForwardLine } from 'react-icons/ri'

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
  const music = useMusic()
  const hayCanciones = music.totalCanciones > 0
  const [compartidas, setCompartidas] = useState(0)

  useEffect(() => {
    if (user) setCompartidas(leerProgresoCompartir(user.id).compartidas)
  }, [user])

  const bloqueada = !hayCanciones || !music.desbloqueada

  const compartir = async () => {
    try {
      if (!(await compartirEnlaceApp())) return
    } catch {
      return // ni compartir ni copiar funcionaron: no cuenta
    }
    const n = Math.min(compartidas + 1, COMPARTIDAS_REQUERIDAS)
    setCompartidas(n)
    guardarProgresoCompartir(user.id, { compartidas: n })
    if (n >= COMPARTIDAS_REQUERIDAS) {
      if (!music.esperandoDesbloqueo) music.iniciarEsperaDesbloqueo()
    }
  }

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
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Usuario: </span>@{perfil?.usuario ?? '—'}
              </p>
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

        <p style={{ ...estiloEncabezado, marginTop: 8 }}>Música</p>
        <div style={estiloTarjeta}>
          <div style={filaStyle(0)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>Música enriquecida</p>
            </div>
            {hayCanciones && !music.desbloqueada && (
              <button
                type="button"
                onClick={compartir}
                title="Compartir"
                aria-label={`Compartir (${compartidas} de ${COMPARTIDAS_REQUERIDAS})`}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0, position: 'relative',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text)', fontSize: '1.25rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RiShareForwardLine />
                {/* Progreso hacia el desbloqueo, como insignia en la esquina. */}
                <span style={{
                  position: 'absolute', top: -6, right: -8, padding: '1px 5px', borderRadius: 999,
                  background: '#4f8ef7', color: '#fff', fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.4,
                }}>
                  {compartidas}/{COMPARTIDAS_REQUERIDAS}
                </span>
              </button>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={music.enriquecida}
              aria-label="Música enriquecida"
              onClick={() => music.cambiarEnriquecida(!music.enriquecida)}
              disabled={bloqueada}
              style={{
                width: 56, height: 44, flexShrink: 0, background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: bloqueada ? 'default' : 'pointer',
                opacity: bloqueada ? 0.5 : 1,
              }}
            >
              <span style={{
                width: 44, height: 26, borderRadius: 999, position: 'relative',
                background: music.enriquecida ? '#4f8ef7' : 'var(--surface)', border: '1px solid var(--border)',
                transition: 'background 0.2s ease',
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: music.enriquecida ? 20 : 2, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'left 0.2s ease',
                }} />
              </span>
            </button>
          </div>
        </div>

        <p style={{ ...estiloEncabezado, marginTop: 8 }}>Tus datos</p>

        <div style={estiloTarjeta}>
          {OPCIONES.map((op, i) => {
            const hayDatos = (conteos?.[op.clave] ?? 0) > 0
            const enCurso = borrando === op.clave
            return (
              <div key={op.clave} style={filaStyle(i)}>
                <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{op.titulo}</p>
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
