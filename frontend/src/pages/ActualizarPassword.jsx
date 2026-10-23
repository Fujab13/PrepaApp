import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import MarcaPrepaApp from '../components/MarcaPrepaApp'
import FondoHexagonal from '../components/FondoHexagonal'

import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiOutlineLockClosed } from 'react-icons/hi2'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FaCircleExclamation, FaCircleCheck } from 'react-icons/fa6'

function traducirErrorAuth(mensaje) {
  const mapa = {
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'New password should be different from the old password.': 'La nueva contraseña debe ser distinta a la anterior.',
  }
  return mapa[mensaje] || mensaje
}

export default function ActualizarPassword() {
  const navigate = useNavigate()
  const [listo, setListo] = useState(false)
  const [enlaceInvalido, setEnlaceInvalido] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const listoRef = useRef(false)

  useEffect(() => {
    listoRef.current = listo
  }, [listo])

  useEffect(() => {
    // El enlace del correo trae un token de recuperación en la URL; el cliente
    // de Supabase lo procesa solo y abre una sesión temporal para poder
    // cambiar la contraseña.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setListo(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setListo(true)
    })

    const timeout = setTimeout(() => {
      if (!listoRef.current) setEnlaceInvalido(true)
    }, 5000)

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setError('Completa ambos campos.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setCargando(false)
    if (error) return setError(traducirErrorAuth(error.message))

    setExito(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden' }}>
      <FondoHexagonal />

      <header style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 0' }}>
        <button
          type="button"
          onClick={() => navigate('/login?modo=login')}
          title="Volver al inicio de sesión"
          aria-label="Volver al inicio de sesión"
          className="util-btn"
          data-gamificacion="bajo"
          style={{
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.3rem', flexShrink: 0,
          }}
        >
          <AiOutlineClose />
        </button>
        <MarcaPrepaApp size={18} />
      </header>

      <main style={{ position: 'relative', flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box', padding: '28px 24px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, margin: 'auto 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
            <img src="/logo.ico" alt="" width="52" height="52" style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text)' }}>
                Nueva contraseña
              </h1>
              <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                Elige una nueva contraseña para tu cuenta.
              </p>
            </div>
          </div>

          {!listo && !enlaceInvalido && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <AiOutlineLoading3Quarters className="spin" style={{ color: '#8b6fcf' }} />
              Verificando el enlace…
            </div>
          )}

          {enlaceInvalido && !listo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div role="alert" style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.25)',
                borderRadius: 12, padding: '12px 14px',
              }}>
                <FaCircleExclamation style={{ color: 'var(--wrong)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: 'var(--wrong)', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
                  El enlace no es válido o ya venció. Solicita uno nuevo desde el inicio de sesión.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login?modo=login')}
                className="gm-cta"
                style={{
                  width: '100%', minHeight: 52, borderRadius: 14, border: 'none',
                  background: '#7c5cbf', color: '#fff', fontWeight: 700, fontSize: '0.98rem',
                  boxShadow: '0 10px 24px -10px rgba(124,92,191,0.7)',
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {listo && !exito && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Nueva contraseña', password, setPassword], ['Confirmar contraseña', confirmPassword, setConfirmPassword]].map(([placeholder, value, setValue], index) => (
                <div key={placeholder} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <HiOutlineLockClosed style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    autoComplete="new-password"
                    aria-label={placeholder}
                    className="auth-input"
                    style={{ paddingRight: index === 0 ? 48 : undefined }}
                  />
                  {index === 0 && (
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(v => !v)}
                      title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      data-gamificacion="bajo"
                      style={{
                        position: 'absolute', right: 4, width: 44, height: 44,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none', color: 'var(--text-muted)',
                        fontSize: '1.05rem', cursor: 'pointer',
                      }}
                    >
                      {mostrarPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  )}
                </div>
              ))}

              <p style={{ margin: '-2px 0 2px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Usa al menos 6 caracteres.</p>

              {error && (
                <div role="alert" style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.25)',
                  borderRadius: 10, padding: '10px 12px',
                }}>
                  <FaCircleExclamation style={{ color: 'var(--wrong)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ color: 'var(--wrong)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="gm-cta"
                style={{
                  width: '100%', minHeight: 52, borderRadius: 14, border: 'none',
                  background: '#7c5cbf', color: '#fff', fontWeight: 700, fontSize: '0.98rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: cargando ? 0.55 : 1, cursor: cargando ? 'default' : 'pointer',
                  boxShadow: cargando ? 'none' : '0 10px 24px -10px rgba(124,92,191,0.7)',
                }}
              >
                {cargando && <AiOutlineLoading3Quarters className="spin" />}
                {cargando ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}

          {exito && (
            <div role="status" style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.25)',
              borderRadius: 12, padding: '12px 14px',
            }}>
              <FaCircleCheck style={{ color: 'var(--correct)', fontSize: '1rem', marginTop: 2, flexShrink: 0 }} />
              <p style={{ color: 'var(--correct)', fontSize: '0.88rem', margin: 0 }}>Contraseña actualizada. Redirigiendo…</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
