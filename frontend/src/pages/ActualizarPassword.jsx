import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiOutlineAcademicCap, HiOutlineLockClosed } from 'react-icons/hi2'
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 28px 40px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #7c5cbf, #4f3a82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', color: '#fff', marginBottom: 16,
            boxShadow: '0 8px 24px rgba(124, 92, 191, 0.35)'
          }}>
            <HiOutlineAcademicCap />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Nueva contraseña</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6, textAlign: 'center' }}>
            Elige una nueva contraseña para tu cuenta
          </p>
        </div>

        {!listo && !enlaceInvalido && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            Verificando el enlace…
          </p>
        )}

        {enlaceInvalido && !listo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
              borderRadius: '10px', padding: '10px 12px'
            }}>
              <FaCircleExclamation style={{ color: 'var(--wrong)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }} />
              <p style={{ color: 'var(--wrong)', fontSize: '0.82rem', margin: 0 }}>
                Este enlace no es válido o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#7c5cbf', color: '#fff', fontWeight: 700, border: 'none',
                borderRadius: '12px', padding: '14px', fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 92, 191, 0.3)'
              }}
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}

        {listo && !exito && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                className="auth-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(v => !v)}
                title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute', right: 14,
                  background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '1.05rem', display: 'flex', padding: 0
                }}
              >
                {mostrarPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="auth-input"
              />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                borderRadius: '10px', padding: '10px 12px'
              }}>
                <FaCircleExclamation style={{ color: 'var(--wrong)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: 'var(--wrong)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                background: '#7c5cbf', color: '#fff', fontWeight: 700, border: 'none',
                borderRadius: '12px', padding: '14px', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: cargando ? 0.75 : 1, cursor: cargando ? 'default' : 'pointer',
                boxShadow: '0 4px 14px rgba(124, 92, 191, 0.3)'
              }}
            >
              {cargando && <AiOutlineLoading3Quarters className="spin" />}
              {cargando ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}

        {exito && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: '10px', padding: '10px 12px'
          }}>
            <FaCircleCheck style={{ color: 'var(--correct)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }} />
            <p style={{ color: 'var(--correct)', fontSize: '0.82rem', margin: 0 }}>
              Contraseña actualizada. Redirigiendo…
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
