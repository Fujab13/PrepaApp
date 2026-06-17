import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo]         = useState('login') 
  const [error, setError]       = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleEmail() {
    setCargando(true)
    setError('')
    const fn = modo === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setCargando(false)
    if (error) return setError(error.message)
    navigate('/')
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: '24px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>🐺 PrepaApp</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        {modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
      </p>

      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '12px', padding: 4, marginBottom: 24 }}>
        {['login', 'registro'].map(m => (
          <button key={m} onClick={() => setModo(m)} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            background: modo === m ? 'var(--surface2)' : 'transparent',
            color: modo === m ? 'var(--text)' : 'var(--text-muted)'
          }}>
            {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        ))}
      </div>

      <input
        type="email" placeholder="Correo electrónico" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ background: 'var(--surface)', border: 'none', borderRadius: '12px', padding: '14px 16px', color: 'var(--text)', fontSize: '1rem', marginBottom: 12 }}
      />
      <input
        type="password" placeholder="Contraseña" value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ background: 'var(--surface)', border: 'none', borderRadius: '12px', padding: '14px 16px', color: 'var(--text)', fontSize: '1rem', marginBottom: 12 }}
      />

      {error && <p style={{ color: 'var(--wrong)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

      <button onClick={handleEmail} disabled={cargando} style={{
        background: '#7c5cbf', color: '#fff', fontWeight: 700, border: 'none',
        borderRadius: '12px', padding: '14px', fontSize: '1rem', marginBottom: 12
      }}>
        {cargando ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>o</div>

      <button onClick={handleGoogle} style={{
        background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, border: 'none',
        borderRadius: '12px', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        <span>G</span> Continuar con Google
      </button>
    </div>
  )
}