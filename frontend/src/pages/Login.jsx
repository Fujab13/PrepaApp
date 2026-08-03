import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FaCircleExclamation } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'

// Supabase devuelve sus mensajes de error en inglés; los traducimos para
// los casos más comunes y dejamos el original como fallback.
function traducirErrorAuth(mensaje) {
  const mapa = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Ya existe una cuenta con ese correo.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  }
  return mapa[mensaje] || mensaje
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modoInicial = searchParams.get('modo') === 'registro' ? 'registro' : 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState(modoInicial)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)

  async function handleEmail(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Completa tu correo y contraseña.')
      return
    }

    setCargando(true)
    setError('')
    const fn = modo === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setCargando(false)
    if (error) return setError(traducirErrorAuth(error.message))
    navigate('/')
  }

  async function handleGoogle() {
    setError('')
    setCargandoGoogle(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    // Si no hubo error, el navegador ya está redirigiendo a Google:
    // no hace falta apagar el loading, la página va a cambiar de todos modos.
    if (error) {
      setError(traducirErrorAuth(error.message))
      setCargandoGoogle(false)
    }
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo)
    setError('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '16px 24px' }}>
        <button
          onClick={() => navigate('/')}
          title="Salir"
          className="util-btn"
        >
          <AiOutlineClose />
        </button>
      </div>

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>PrepaApp</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6, textAlign: 'center' }}>
            {modo === 'login' ? 'Inicia sesión para continuar tu progreso' : 'Crea tu cuenta gratis y empieza a estudiar'}
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '14px', padding: 4, marginBottom: 20 }}>
          {['login', 'registro'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => cambiarModo(m)}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '11px',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                background: modo === m ? '#7c5cbf' : 'transparent',
                color: modo === m ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <HiOutlineEnvelope style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <HiOutlineLockClosed style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
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
            {cargando ? 'Un momento…' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--surface2)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: 'var(--surface2)' }} />
        </div>

        <button
          onClick={handleGoogle}
          disabled={cargandoGoogle}
          style={{
            background: 'var(--surface)', color: 'var(--text)', fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '13px', fontSize: '0.92rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: cargandoGoogle ? 0.75 : 1, cursor: cargandoGoogle ? 'default' : 'pointer'
          }}
        >
          {cargandoGoogle ? <AiOutlineLoading3Quarters className="spin" /> : <FcGoogle size={20} />}
          {cargandoGoogle ? 'Conectando…' : 'Continuar con Google'}
        </button>
      </div>
    </div>
  )
}
