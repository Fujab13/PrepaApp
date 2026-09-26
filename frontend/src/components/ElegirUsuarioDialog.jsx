// ElegirUsuarioDialog.jsx
// Diálogo para elegir/cambiar el nombre de usuario público (el del ranking).
// Mismo look que ConfirmDialog.jsx (clases cd-*).
//
// - default ElegirUsuarioDialog: el diálogo en sí (lo abre Ajustes para
//   cambiar el usuario).
// - PedirUsuarioPendiente: se monta una vez en App.jsx y abre el diálogo
//   si a la cuenta le falta algo que el registro por pasos (Login.jsx) sí
//   pide: un usuario confirmado (tiene el GENÉRICO) y/o la aceptación de la
//   versión vigente del Aviso de privacidad (cuentas anteriores al aviso, o
//   de Google que abandonaron el registro a medias). Solo pide lo que falte.
//   "Ahora no" lo pospone hasta la siguiente sesión del navegador.

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { cambiarMiUsuario } from '../services/usuario'
import { VERSION_AVISO } from '../data/avisoPrivacidad'
import CampoUsuario from './CampoUsuario'
import CasillaConsentimiento from './CasillaConsentimiento'

// ¿La cuenta ya aceptó la versión vigente del aviso? (constancia guardada en
// la metadata de la cuenta: al registrarse con correo o al terminar el
// registro de Google en Login.jsx, o desde este diálogo).
export function aceptoAvisoVigente(user) {
  return user?.user_metadata?.aviso_privacidad_version === VERSION_AVISO
}

// `pedirUsuario` / `pedirAviso`: qué secciones mostrar (al menos una).
export default function ElegirUsuarioDialog({
  abierto, usuarioActual, titulo, onCerrar, onGuardado, pedirUsuario = true, pedirAviso = false,
}) {
  const [valor, setValor] = useState(usuarioActual || '')
  const [estado, setEstado] = useState('invalido')
  const [aceptaAviso, setAceptaAviso] = useState(false)
  const [resaltarAviso, setResaltarAviso] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (abierto) { setValor(usuarioActual || ''); setError(''); setAceptaAviso(false); setResaltarAviso(false) }
  }, [abierto, usuarioActual])

  if (!abierto) return null

  const tituloFinal = titulo || (pedirUsuario && pedirAviso ? 'Completa tu cuenta' : pedirAviso ? 'Aviso de privacidad' : 'Elige tu usuario')
  const mensaje = pedirUsuario ? 'Así aparecerás en el ranking.' : 'Acéptalo para seguir usando PrepaApp.'
  const listo = (!pedirUsuario || estado === 'libre') && (!pedirAviso || aceptaAviso)

  const guardar = async () => {
    if (guardando) return
    if (pedirAviso && !aceptaAviso) { setResaltarAviso(true); return }
    if (!listo) return
    setGuardando(true)
    setError('')
    try {
      // Primero el usuario (puede fallar por ocupado/no permitido) y luego la
      // constancia del aviso, igual que el paso "confirmar" del login.
      const nuevo = pedirUsuario ? await cambiarMiUsuario(valor) : usuarioActual
      if (pedirAviso) {
        const { error: err } = await supabase.auth.updateUser({
          data: { aviso_privacidad_version: VERSION_AVISO, aviso_privacidad_aceptado_en: new Date().toISOString() },
        })
        if (err) throw new Error('No se pudo guardar. Intenta más tarde.')
      }
      onGuardado?.(nuevo)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="cd-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && onCerrar) onCerrar() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 200,
      }}
    >
      <div
        className="cd-card"
        role="dialog"
        aria-modal="true"
        aria-label={tituloFinal}
        style={{
          width: '100%', maxWidth: 340, background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '22px 20px', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{tituloFinal}</p>
        <p style={{ margin: '0 0 8px', fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>
          {mensaje}
        </p>

        {pedirUsuario && (
          <CampoUsuario valor={valor} onChange={setValor} onEstado={setEstado} actual={usuarioActual} autoFocus />
        )}

        {pedirAviso && (
          <CasillaConsentimiento
            aceptado={aceptaAviso}
            onChange={(v) => { setAceptaAviso(v); if (v) setResaltarAviso(false) }}
            resaltar={resaltarAviso}
          />
        )}

        {error && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--wrong)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="cd-btn"
              style={{
                flex: 1, minHeight: 44, background: 'transparent', border: '1px solid var(--border-strong, var(--border))',
                borderRadius: 12, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem',
              }}
            >
              Ahora no
            </button>
          )}
          <button
            onClick={guardar}
            disabled={guardando || (pedirUsuario && estado !== 'libre')}
            className="cd-btn"
            style={{
              flex: 1, minHeight: 44, background: '#7c5cbf', border: 'none', borderRadius: 12,
              color: '#fff', fontWeight: 700, fontSize: '0.88rem',
              opacity: listo && !guardando ? 1 : 0.55,
              cursor: listo && !guardando ? 'pointer' : 'default',
            }}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Rutas donde no tiene sentido interrumpir con el diálogo.
const RUTAS_SIN_DIALOGO = ['/login', '/privacidad', '/actualizar-password']
const CLAVE_POSPUESTO = 'usuario_pospuesto'

export function PedirUsuarioPendiente() {
  const { user, perfil, refrescarPerfil } = useAuth()
  const { pathname } = useLocation()
  const [pospuesto, setPospuesto] = useState(() => {
    try { return sessionStorage.getItem(CLAVE_POSPUESTO) === '1' } catch { return false }
  })

  const faltaUsuario = Boolean(perfil?.usuario && !perfil.usuario_confirmado)
  const faltaAviso = Boolean(user && !aceptoAvisoVigente(user))
  const abierto = Boolean(
    user && perfil && (faltaUsuario || faltaAviso) &&
    !pospuesto && !RUTAS_SIN_DIALOGO.includes(pathname)
  )

  const posponer = () => {
    try { sessionStorage.setItem(CLAVE_POSPUESTO, '1') } catch { /* sin storage: solo esta vista */ }
    setPospuesto(true)
  }

  return (
    <ElegirUsuarioDialog
      abierto={abierto}
      usuarioActual={perfil?.usuario}
      pedirUsuario={faltaUsuario}
      pedirAviso={faltaAviso}
      onCerrar={posponer}
      // La metadata nueva del aviso llega sola: updateUser dispara
      // USER_UPDATED y AuthContext actualiza `user`.
      onGuardado={() => refrescarPerfil()}
    />
  )
}
