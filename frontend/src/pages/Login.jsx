// Login.jsx
// Inicio de sesión y registro POR PASOS, una cosa por pantalla (inspirado
// en el flujo de cuentas de Xbox/Microsoft, adaptado a móvil):
//
//   Iniciar sesión:  correo → contraseña
//   Crear cuenta:    correo → contraseña → usuario → confirmar
//   Google (nuevo):  vuelve a /login?continuar=1 → usuario → confirmar
//   Recuperar:       correo → "revisa tu correo"
//
// Cada paso es una entrada del historial (misma URL, con el paso en
// location.state): el botón Atrás del celular regresa un paso en vez de
// sacar al alumno del login y hacerle perder lo que ya llenó.
//
// A propósito NO se consulta si un correo ya tiene cuenta antes de pedir la
// contraseña: eso dejaría averiguar qué correos (de alumnos, muchos menores)
// están registrados. Por eso, como en Xbox, se elige desde el inicio entre
// iniciar sesión y crear cuenta (?modo=login | ?modo=registro).
//
// El usuario es el nombre público del ranking (services/usuario.js); en el
// registro va en la metadata del signUp y el trigger de perfiles lo toma.
// Con Google, el paso "confirmar" guarda el usuario (cambiar_mi_usuario) y
// la aceptación del Aviso de privacidad en la metadata de la cuenta.

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { triggerVibration } from '../utils/haptics'
import Celebracion from '../components/Celebracion'
import CasillaConsentimiento from '../components/CasillaConsentimiento'
import CampoUsuario from '../components/CampoUsuario'
import MarcaPrepaApp from '../components/MarcaPrepaApp'
import { sugerenciasSeguras, variacionesDeUsuario, usuarioDisponible, cambiarMiUsuario } from '../services/usuario'
import { resolverAvatarUsuario } from '../utils/avatar'
import { VERSION_AVISO } from '../data/avisoPrivacidad'

import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { IoIosArrowBack } from 'react-icons/io'
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEnvelopeOpen } from 'react-icons/hi2'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { RiUser3Fill } from 'react-icons/ri'

// Supabase devuelve sus mensajes de error en inglés; se traducen los más
// comunes (cortos) y el original queda como respaldo.
function traducirErrorAuth(mensaje) {
  const mapa = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Ese correo ya tiene cuenta.',
    'Password should be at least 6 characters': 'Mínimo 6 caracteres.',
    'Email not confirmed': 'Confirma tu correo primero.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera un poco.',
  }
  return mapa[mensaje] || mensaje
}

// Errores de la política de contraseñas de Supabase, que llegan hasta el
// signUp (paso "confirmar"): se traducen y el login regresa solo al paso de
// contraseña para corregirla ahí. null = el error no es de la contraseña.
function errorDeContrasena(err) {
  const m = err?.message || ''
  if (err?.code !== 'weak_password' && !/password/i.test(m)) return null
  if (/weak|guess|pwned|leaked/i.test(m)) return 'Esa contraseña es muy común. Elige otra.'
  if (/at least one character/i.test(m)) return 'Usa minúsculas, mayúsculas, números y símbolos.'
  const minimo = m.match(/at least (\d+) characters/i)
  if (minimo) return `Mínimo ${minimo[1]} caracteres.`
  return 'Elige una contraseña más segura.'
}

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Pasos de cada flujo (para la barra de progreso de arriba).
const FLUJOS = {
  login: ['correo', 'password'],
  registro: ['correo', 'password', 'usuario', 'confirmar'],
  completar: ['usuario', 'confirmar'],
  recuperar: ['correo'],
}

// ── Piezas visuales ───────────────────────────────────────────────────────

// Retícula de hexágonos (la forma de la marca) que se desvanece hacia abajo.
// SVG en línea para poder usar las variables del tema en el trazo.
function FondoHexagonal() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: 260, pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
      }}
    >
      <defs>
        <pattern id="login-hex" width="28" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1.1)">
          <path d="M14 0 L28 8.08 L28 24.25 L14 32.33 L0 24.25 L0 8.08 Z M14 32.33 L14 48.5" fill="none" stroke="#4f8ef7" strokeOpacity="0.22" strokeWidth="1" />
        </pattern>
        {/* Resplandor azul (el azul de la app, #4f8ef7): la retícula se
            siente "de sistema", y el morado queda para las acciones. */}
        <radialGradient id="login-brillo" cx="85%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-hex)" />
      <rect width="100%" height="100%" fill="url(#login-brillo)" />
    </svg>
  )
}

// Barra superior: atrás/cerrar, marca y progreso segmentado del flujo.
function Encabezado({ onAtras, esPrimero, total, indice }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 0' }}>
      <button
        onClick={onAtras}
        title={esPrimero ? 'Salir' : 'Atrás'}
        aria-label={esPrimero ? 'Salir' : 'Atrás'}
        className="util-btn"
        data-gamificacion="bajo"
        style={{
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.3rem', flexShrink: 0,
        }}
      >
        {esPrimero ? <AiOutlineClose /> : <IoIosArrowBack />}
      </button>
      <MarcaPrepaApp size={18} />
      {total > 1 && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }} aria-label={`Paso ${indice + 1} de ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{
                width: i === indice ? 22 : 8, height: 4, borderRadius: 999,
                background: i <= indice ? '#4f8ef7' : 'var(--surface2)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Ficha con el correo que acompaña los pasos posteriores (tocar = cambiarlo).
function FichaCorreo({ correo, onCambiar }) {
  return (
    <button
      type="button"
      onClick={onCambiar}
      data-gamificacion="bajo"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', maxWidth: '100%',
        minHeight: 36, padding: '6px 12px 6px 6px', borderRadius: 999, cursor: 'pointer',
        background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
      }}
    >
      <span className="login-hex" style={{
        width: 24, height: 26, flexShrink: 0, background: 'linear-gradient(160deg, #9b7de0, #5b3f9e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff',
      }}>
        {correo.charAt(0).toUpperCase()}
      </span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {correo}
      </span>
    </button>
  )
}

// La "credencial": avatar + @usuario, en vivo. El avatar es el mismo del
// Sidenav: la foto de perfil del correo (Google o Gravatar, ver
// utils/avatar.js) o, si no hay, la silueta gris de persona.
function Credencial({ usuario, avatarSrc }) {
  const [fotoFallo, setFotoFallo] = useState(false)
  useEffect(() => { setFotoFallo(false) }, [avatarSrc])

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 14, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(135deg, rgba(124,92,191,0.24), var(--surface2) 62%)',
      border: '1px solid rgba(124,92,191,0.35)',
    }}>
      <span key={usuario} className="login-credencial-brillo" />
      <span style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', color: '#8482e0',
      }}>
        {avatarSrc && !fotoFallo ? (
          <img
            src={avatarSrc}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFotoFallo(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <RiUser3Fill />
        )}
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b9a4ec' }}>
          Alumno PrepaApp
        </p>
        <p style={{
          margin: '2px 0 0', fontSize: '1.08rem', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          @{usuario || 'tu_usuario'}
        </p>
      </div>
    </div>
  )
}

function Titulo({ children, sub }) {
  return (
    <div className="login-cascada" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text)' }}>
        {children}
      </h1>
      {sub && <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function CampoIcono({ icono: Icono, derecha, ...props }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icono style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
      <input className="auth-input" style={derecha ? { paddingRight: 48 } : undefined} {...props} />
      {derecha}
    </div>
  )
}

function BotonPrincipal({ children, cargando, deshabilitado, onClick, type = 'button' }) {
  const inactivo = cargando || deshabilitado
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inactivo}
      className="gm-cta"
      style={{
        width: '100%', minHeight: 52, borderRadius: 14, border: 'none',
        background: '#7c5cbf', color: '#fff', fontWeight: 700, fontSize: '0.98rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: inactivo ? 0.55 : 1, cursor: inactivo ? 'default' : 'pointer',
        boxShadow: inactivo ? 'none' : '0 10px 24px -10px rgba(124, 92, 191, 0.7)',
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {cargando && <AiOutlineLoading3Quarters className="spin" />}
      {children}
    </button>
  )
}

function Enlace({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-gamificacion="bajo"
      style={{
        background: 'transparent', border: 'none', padding: '10px 4px', minHeight: 44,
        color: '#8b6fcf', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ── Página ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, perfil, refrescarPerfil, cargando: cargandoAuth } = useAuth()

  const location = useLocation()
  const continuarGoogle = searchParams.get('continuar') === '1'
  // Paso y flujo de la entrada del historial SIN estado (la primera).
  const pasoInicial = continuarGoogle ? 'esperando' : 'correo'
  const flujoInicial = searchParams.get('modo') === 'registro' ? 'registro' : 'login'
  const [flujo, setFlujo] = useState(location.state?.loginFlujo ?? flujoInicial)
  const [paso, setPaso] = useState(location.state?.loginPaso ?? pasoInicial)
  const [atras, setAtras] = useState(false) // sentido de la animación del paso
  // Índice de la entrada actual del historial del login: si la nueva tiene
  // uno menor, se llegó con Atrás (animación hacia el otro lado).
  const idxRef = useRef(location.state?.loginIdx ?? 0)
  // Error que debe mostrarse en el paso al que se va a llegar (el cambio de
  // entrada del historial limpia los errores; este se muestra en su lugar).
  const errorAlLlegarRef = useRef('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [usuario, setUsuario] = useState('')
  // true en cuanto el alumno escribe o elige su usuario: desde ahí ya no se
  // le cambia solo al cambiar el correo. `correoDelUsuarioRef` = el correo
  // con el que se generó la sugerencia actual.
  const [usuarioEditado, setUsuarioEditado] = useState(false)
  const correoDelUsuarioRef = useRef('')
  // #5: tras "Correo o contraseña incorrectos", ofrecer entrar con Google
  // (muchas cuentas se crearon con Google y no tienen contraseña).
  const [sugerirGoogle, setSugerirGoogle] = useState(false)
  const [estadoUsuario, setEstadoUsuario] = useState('invalido')
  const [sugerencias, setSugerencias] = useState([])
  const [avatarSrc, setAvatarSrc] = useState(null)
  const [aceptaAviso, setAceptaAviso] = useState(false)
  const [resaltarAviso, setResaltarAviso] = useState(false)

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [celebrando, setCelebrando] = useState(false)
  const [enlaceEnviado, setEnlaceEnviado] = useState(false)
  // "Revisa tu correo": segundos que faltan para poder reenviar la
  // confirmación, y aviso de que ya se reenvió.
  const [esperaReenvio, setEsperaReenvio] = useState(0)
  const [reenviado, setReenviado] = useState(false)

  const pasos = FLUJOS[flujo]
  const indice = Math.max(0, pasos.indexOf(paso))

  // Vuelta de Google: cuenta nueva (usuario genérico sin confirmar) → elige
  // usuario y acepta el aviso; cuenta que ya lo había hecho → a Home.
  useEffect(() => {
    if (paso !== 'esperando') return
    // Google no dejó sesión (cancelado o error): de vuelta al primer paso.
    if (!cargandoAuth && !user) { irA('correo', { reemplazar: true }); return }
    if (!user || !perfil) return
    if (perfil.usuario_confirmado) {
      navigate('/', { replace: true })
      return
    }
    setUsuario(perfil.usuario)
    setEmail(user.email || '')
    irA('usuario', { flujo: 'completar', reemplazar: true })
  }, [paso, user, perfil, cargandoAuth, navigate])

  // Con sesión ya iniciada no tiene sentido pedir el correo: a Home. Solo
  // en el paso de correo (a mitad del flujo, p. ej. al terminar un inicio
  // de sesión, cada paso ya navega por su cuenta).
  useEffect(() => {
    if (cargandoAuth || !user || continuarGoogle || paso !== 'correo') return
    navigate('/', { replace: true })
  }, [cargandoAuth, user, paso])

  // Límite de "Entrando con Google…" para que no gire para siempre si el
  // perfil no carga (fallo de red, etc.): a los 6s se pide otra vez; a los
  // 12s, con sesión se va a Home (ahí PedirUsuarioPendiente pide lo que
  // falte) y sin sesión se regresa al primer paso con un aviso.
  useEffect(() => {
    if (paso !== 'esperando') return
    const reintento = setTimeout(() => { if (user) refrescarPerfil() }, 6000)
    const limite = setTimeout(() => {
      if (user) {
        navigate('/', { replace: true })
      } else {
        errorAlLlegarRef.current = 'No se pudo entrar con Google.'
        irA('correo', { reemplazar: true })
      }
    }, 12000)
    return () => { clearTimeout(reintento); clearTimeout(limite) }
  }, [paso, user])

  // Foto para la credencial: la de Google (cuenta ya creada) o la de
  // Gravatar ligada al correo que se está registrando.
  useEffect(() => {
    if (paso !== 'usuario' && paso !== 'confirmar') return
    let cancelado = false
    const quien = flujo === 'completar' ? user : { email }
    resolverAvatarUsuario(quien).then(src => { if (!cancelado) setAvatarSrc(src) }).catch(() => {})
    return () => { cancelado = true }
  }, [paso, flujo, user, email])

  // Sugerencias del paso de usuario, que se recalculan CONFORME ESCRIBE:
  // variaciones de lo que ya escribió (services/usuario.js →
  // variacionesDeUsuario); si aún no hay 3 caracteres, las seguras a partir
  // de las iniciales del correo. Solo se muestran las libres. La pausa evita
  // consultar la base en cada tecla, y las anteriores se quedan visibles
  // hasta que llegan las nuevas (sin parpadeo).
  useEffect(() => {
    if (paso !== 'usuario') return
    let cancelado = false
    const t = setTimeout(() => {
      const propias = variacionesDeUsuario(usuario, 6)
      const candidatos = (propias.length > 0 ? propias : sugerenciasSeguras(email, 6)).filter(c => c !== usuario)
      Promise.all(candidatos.map(c => usuarioDisponible(c).then(ok => (ok ? c : null)).catch(() => null)))
        .then(res => { if (!cancelado) setSugerencias(res.filter(Boolean).slice(0, 3)) })
    }, 500)
    return () => { cancelado = true; clearTimeout(t) }
  }, [paso, usuario, email])

  // Cuenta regresiva del reenvío (1 por segundo mientras quede espera).
  useEffect(() => {
    if (esperaReenvio <= 0) return
    const t = setTimeout(() => setEsperaReenvio(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [esperaReenvio])

  async function reenviarConfirmacion() {
    if (esperaReenvio > 0) return
    setError('')
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    if (err) return setError(traducirErrorAuth(err.message))
    setReenviado(true)
    setEsperaReenvio(60)
  }

  // El historial manda: cada vez que cambia la entrada (avanzar, Atrás del
  // celular o de la pantalla), el paso y el flujo se toman de su estado.
  useEffect(() => {
    const st = location.state
    const nuevoIdx = st?.loginIdx ?? 0
    setAtras(nuevoIdx < idxRef.current)
    idxRef.current = nuevoIdx
    setError(errorAlLlegarRef.current)
    errorAlLlegarRef.current = ''
    setSugerirGoogle(false)
    setFlujo(st?.loginFlujo ?? flujoInicial)
    setPaso(st?.loginPaso ?? pasoInicial)
    // Solo al cambiar de entrada del historial.
  }, [location.key])

  // Ir a otro paso = nueva entrada del historial (o reemplazar la actual,
  // para saltos que no deben poder deshacerse con Atrás).
  function irA(nuevo, { flujo: nuevoFlujo = flujo, reemplazar = false } = {}) {
    const loginIdx = reemplazar ? idxRef.current : idxRef.current + 1
    navigate(`${location.pathname}${location.search}`, {
      replace: reemplazar,
      state: { loginPaso: nuevo, loginFlujo: nuevoFlujo, loginIdx },
    })
  }

  function limpiarPasswords() {
    setPassword('')
    setConfirmPassword('')
  }

  function retroceder() {
    // Primer paso de cada flujo, o pantallas finales: la flecha/X sale.
    const esInicio = (indice === 0 && paso !== 'recuperar') || paso === 'revisa'
      || (flujo === 'completar' && paso === 'usuario')
    if (esInicio || !location.state?.loginPaso) return navigate('/')
    navigate(-1)
  }

  // ── acciones de cada paso ──
  function continuarCorreo(e) {
    e.preventDefault()
    if (!CORREO_REGEX.test(email.trim())) return setError('Escribe un correo válido.')
    setEmail(email.trim())
    // Usuario de inicio: una sugerencia segura (no la parte del correo). Se
    // rehace si cambió el correo, mientras el alumno no haya puesto el suyo.
    if (flujo === 'registro' && !usuarioEditado && correoDelUsuarioRef.current !== email.trim()) {
      setUsuario(sugerenciasSeguras(email.trim(), 1)[0])
      correoDelUsuarioRef.current = email.trim()
    }
    irA('password')
  }

  async function continuarPassword(e) {
    e.preventDefault()
    if (flujo === 'login') {
      if (!password) return setError('Escribe tu contraseña.')
      setCargando(true)
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      setCargando(false)
      if (err) {
        setSugerirGoogle(err.message === 'Invalid login credentials')
        return setError(traducirErrorAuth(err.message))
      }
      triggerVibration('success')
      navigate('/')
      return
    }
    if (password.length < 6) return setError('Mínimo 6 caracteres.')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.')
    irA('usuario')
  }

  function continuarUsuario(e) {
    e.preventDefault()
    if (estadoUsuario !== 'libre') {
      if (estadoUsuario === 'revisando') return
      return setError({
        ocupado: 'Ese usuario ya está en uso.',
        no_permitido: 'Ese usuario no está permitido.',
      }[estadoUsuario] || 'Elige un usuario válido.')
    }
    irA('confirmar')
  }

  async function confirmar(e) {
    e.preventDefault()
    if (!aceptaAviso) {
      setResaltarAviso(true)
      return setError('Acepta el aviso de privacidad.')
    }
    const constancia = { aviso_privacidad_version: VERSION_AVISO, aviso_privacidad_aceptado_en: new Date().toISOString() }
    setCargando(true)
    setError('')

    if (flujo === 'completar') {
      try {
        await cambiarMiUsuario(usuario)
        await supabase.auth.updateUser({ data: constancia })
        await refrescarPerfil()
      } catch (err) {
        setCargando(false)
        return setError(err.message)
      }
      setCargando(false)
      setCelebrando(true)
      triggerVibration('celebracion')
      setTimeout(() => navigate('/', { replace: true }), 550)
      return
    }

    const { data, error: err } = await supabase.auth.signUp({
      email, password, options: { data: { usuario, ...constancia } },
    })
    setCargando(false)
    if (err) {
      const deContrasena = errorDeContrasena(err)
      if (!deContrasena) return setError(traducirErrorAuth(err.message))
      // La contraseña se corrige en su paso: dos entradas atrás del
      // historial (confirmar → usuario → contraseña), con el error ya ahí.
      errorAlLlegarRef.current = deContrasena
      if ((location.state?.loginIdx ?? 0) >= 2) navigate(-2)
      else irA('password')
      return
    }

    // Si el proyecto exige confirmar el correo, signUp no devuelve sesión.
    // Ojo: con un correo que YA tenía cuenta, Supabase responde igual (sin
    // error, para no revelar qué correos existen) y no manda nada: por eso
    // "Revisa tu correo" ofrece iniciar sesión y recuperar la contraseña.
    if (!data.session) {
      setReenviado(false)
      setEsperaReenvio(60)
      return irA('revisa', { reemplazar: true })
    }

    setCelebrando(true)
    triggerVibration('celebracion')
    setTimeout(() => navigate('/'), 550)
  }

  async function enviarRecuperacion(e) {
    e.preventDefault()
    if (!CORREO_REGEX.test(email.trim())) return setError('Escribe un correo válido.')
    setCargando(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-password`,
    })
    setCargando(false)
    if (err) return setError(traducirErrorAuth(err.message))
    setEnlaceEnviado(true)
  }

  async function entrarConGoogle() {
    setError('')
    setCargandoGoogle(true)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login?continuar=1` },
    })
    // Sin error, el navegador ya se va a Google: no se apaga el "cargando".
    if (err) {
      setError(traducirErrorAuth(err.message))
      setCargandoGoogle(false)
    }
  }

  const ojo = (
    <button
      type="button"
      onClick={() => setMostrarPassword(v => !v)}
      aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      data-gamificacion="bajo"
      style={{
        position: 'absolute', right: 4, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.05rem', cursor: 'pointer',
      }}
    >
      {mostrarPassword ? <FiEyeOff /> : <FiEye />}
    </button>
  )

  const botonGoogle = (
    <button
      type="button"
      onClick={entrarConGoogle}
      disabled={cargandoGoogle}
      className="gm-cta"
      style={{
        width: '100%', minHeight: 52, borderRadius: 14, background: 'var(--surface2)', color: 'var(--text)',
        border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.94rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: cargandoGoogle ? 0.7 : 1, cursor: cargandoGoogle ? 'default' : 'pointer',
      }}
    >
      {cargandoGoogle ? <AiOutlineLoading3Quarters className="spin" /> : <FcGoogle size={20} />}
      {cargandoGoogle ? 'Conectando…' : 'Continuar con Google'}
    </button>
  )

  const mensajeError = error && (
    <p role="alert" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: 'var(--wrong)' }}>{error}</p>
  )

  // Cada paso arma su `contenido` y su `pie` (el botón principal queda
  // abajo, al alcance del pulgar).
  let contenido = null
  let pie = null

  if (paso === 'esperando') {
    contenido = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <AiOutlineLoading3Quarters className="spin" style={{ fontSize: '1.8rem', color: '#8b6fcf' }} />
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Entrando con Google…</p>
      </div>
    )
  } else if (paso === 'correo') {
    const esLogin = flujo === 'login'
    contenido = (
      <>
        <Titulo sub={esLogin ? 'Continúa donde te quedaste.' : 'Gratis. Tu progreso queda guardado.'}>
          {esLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
        </Titulo>
        <div className="login-cascada" style={{ animationDelay: '60ms', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CampoIcono
            icono={HiOutlineEnvelope} type="email" placeholder="Correo electrónico" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" autoFocus
          />
          {mensajeError}
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {esLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Enlace onClick={() => { limpiarPasswords(); irA('correo', { flujo: esLogin ? 'registro' : 'login', reemplazar: true }) }}>
              {esLogin ? 'Crea una' : 'Inicia sesión'}
            </Enlace>
          </div>
        </div>
      </>
    )
    pie = (
      <>
        <BotonPrincipal type="submit">Siguiente</BotonPrincipal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>o</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        {botonGoogle}
        <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          Al continuar aceptas el{' '}
          <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: '#8b6fcf', fontWeight: 600 }}>
            Aviso de privacidad
          </a>.
        </p>
      </>
    )
  } else if (paso === 'password') {
    const esLogin = flujo === 'login'
    contenido = (
      <>
        <FichaCorreo correo={email} onCambiar={() => navigate(-1)} />
        {/* Correo oculto: sin él, los gestores de contraseñas (Chrome, iOS)
            no saben a qué cuenta pertenece la contraseña y no la ofrecen
            ni la guardan. */}
        <input
          type="email" name="username" autoComplete="username" value={email} readOnly
          tabIndex={-1} aria-hidden="true"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
        <Titulo sub={esLogin ? null : 'Mínimo 6 caracteres.'}>
          {esLogin ? 'Escribe tu contraseña' : 'Crea una contraseña'}
        </Titulo>
        <div className="login-cascada" style={{ animationDelay: '60ms', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CampoIcono
            icono={HiOutlineLockClosed} type={mostrarPassword ? 'text' : 'password'} placeholder="Contraseña"
            value={password} onChange={e => setPassword(e.target.value)} autoFocus
            autoComplete={esLogin ? 'current-password' : 'new-password'} derecha={ojo}
          />
          {!esLogin && (
            <CampoIcono
              icono={HiOutlineLockClosed} type={mostrarPassword ? 'text' : 'password'} placeholder="Confirmar contraseña"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"
            />
          )}
          {mensajeError}
          {esLogin && sugerirGoogle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>¿Entraste con Google? Usa ese botón.</p>
              {botonGoogle}
            </div>
          )}
          {esLogin && (
            <div><Enlace onClick={() => { setEnlaceEnviado(false); irA('recuperar') }}>¿Olvidaste tu contraseña?</Enlace></div>
          )}
        </div>
      </>
    )
    pie = <BotonPrincipal type="submit" cargando={cargando}>{esLogin ? (cargando ? 'Entrando…' : 'Iniciar sesión') : 'Siguiente'}</BotonPrincipal>
  } else if (paso === 'usuario') {
    contenido = (
      <>
        <Titulo sub="Podrás cambiarlo después.">Elige tu usuario</Titulo>
        <div className="login-cascada" style={{ animationDelay: '60ms' }}>
          <Credencial usuario={usuario} avatarSrc={avatarSrc} />
        </div>
        <div className="login-cascada" style={{ animationDelay: '120ms', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CampoUsuario
            valor={usuario}
            onChange={(v) => { setUsuario(v); setUsuarioEditado(true) }}
            onEstado={setEstadoUsuario}
            actual={flujo === 'completar' ? perfil?.usuario : null}
          />
          {sugerencias.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Disponibles</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sugerencias.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setUsuario(s); setUsuarioEditado(true) }}
                    data-gamificacion="bajo"
                    style={{
                      minHeight: 40, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                      border: `1px solid ${usuario === s ? '#7c5cbf' : 'var(--border)'}`,
                      background: usuario === s ? 'rgba(124,92,191,0.18)' : 'var(--surface2)',
                      color: 'var(--text)', fontSize: '0.84rem', fontWeight: 600,
                    }}
                  >
                    @{s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mensajeError}
        </div>
      </>
    )
    pie = <BotonPrincipal type="submit" deshabilitado={estadoUsuario !== 'libre'}>Siguiente</BotonPrincipal>
  } else if (paso === 'confirmar') {
    contenido = (
      <>
        <Titulo sub="Revisa que todo esté bien.">{flujo === 'completar' ? 'Todo listo' : 'Último paso'}</Titulo>
        <div className="login-cascada" style={{ animationDelay: '60ms' }}>
          <Credencial usuario={usuario} avatarSrc={avatarSrc} />
        </div>
        <div className="login-cascada" style={{ animationDelay: '120ms', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
            background: 'var(--surface2)', border: '1px solid var(--border)',
          }}>
            <HiOutlineEnvelope style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.86rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
          </div>
          <CasillaConsentimiento
            aceptado={aceptaAviso}
            onChange={(v) => { setAceptaAviso(v); if (v) { setResaltarAviso(false); setError('') } }}
            resaltar={resaltarAviso}
          />
          {mensajeError}
        </div>
      </>
    )
    pie = (
      <div style={{ position: 'relative' }}>
        <Celebracion activo={celebrando} color="#7c5cbf" />
        <BotonPrincipal type="submit" cargando={cargando} deshabilitado={celebrando}>
          {cargando ? 'Un momento…' : flujo === 'completar' ? 'Empezar' : 'Crear cuenta'}
        </BotonPrincipal>
      </div>
    )
  } else if (paso === 'revisa') {
    contenido = (
      <>
        <div className="login-cascada login-hex" style={{
          width: 72, height: 80, background: 'linear-gradient(160deg, #a58ae6, #5b3f9e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#fff',
        }}>
          <HiOutlineEnvelopeOpen />
        </div>
        <Titulo sub={`Te enviamos un enlace a ${email} para activar tu cuenta.`}>Revisa tu correo</Titulo>

        {/* Mismo texto para todos a propósito: decir "ese correo ya tiene
            cuenta" dejaría averiguar qué correos están registrados. */}
        <div className="login-cascada" style={{
          animationDelay: '80ms', display: 'flex', flexDirection: 'column', gap: 6,
          padding: '14px 16px', borderRadius: 14, background: 'var(--surface2)', border: '1px solid var(--border)',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>¿No te llegó?</p>
          <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
            Revisa tu carpeta de spam. Si ya tenías una cuenta con este correo, no llegará nada: inicia sesión.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 14, marginTop: 2 }}>
            <Enlace onClick={reenviarConfirmacion}>
              {esperaReenvio > 0 ? `Reenviar en ${esperaReenvio}s` : 'Reenviar correo'}
            </Enlace>
            <Enlace onClick={() => { limpiarPasswords(); irA('password', { flujo: 'login' }) }}>Iniciar sesión</Enlace>
            <Enlace onClick={() => { limpiarPasswords(); setEnlaceEnviado(false); irA('recuperar', { flujo: 'login' }) }}>Recuperar contraseña</Enlace>
          </div>
          {reenviado && esperaReenvio > 0 && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--correct)' }}>Correo reenviado.</p>
          )}
          {mensajeError}
        </div>
      </>
    )
    pie = <BotonPrincipal onClick={() => { limpiarPasswords(); irA('password', { flujo: 'login' }) }}>Ya lo confirmé</BotonPrincipal>
  } else if (paso === 'recuperar') {
    contenido = enlaceEnviado ? (
      <Titulo sub={`Si ${email} tiene cuenta, te llegará un enlace para crear una nueva contraseña.`}>Revisa tu correo</Titulo>
    ) : (
      <>
        <Titulo sub="Te enviaremos un enlace para crear una nueva.">Recupera tu contraseña</Titulo>
        <div className="login-cascada" style={{ animationDelay: '60ms', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CampoIcono
            icono={HiOutlineEnvelope} type="email" placeholder="Correo electrónico" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" autoFocus
          />
          {mensajeError}
        </div>
      </>
    )
    pie = enlaceEnviado
      ? <BotonPrincipal onClick={() => navigate(-1)}>Volver</BotonPrincipal>
      : <BotonPrincipal type="submit" cargando={cargando}>{cargando ? 'Enviando…' : 'Enviar enlace'}</BotonPrincipal>
  }

  const alEnviar = {
    correo: continuarCorreo,
    password: continuarPassword,
    usuario: continuarUsuario,
    confirmar,
    recuperar: enviarRecuperacion,
  }[paso] || ((e) => e.preventDefault())

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflowX: 'hidden' }}>
      <FondoHexagonal />
      <Encabezado
        onAtras={retroceder}
        esPrimero={(indice === 0 && paso !== 'recuperar') || paso === 'esperando' || paso === 'revisa'}
        total={paso === 'recuperar' || paso === 'revisa' || paso === 'esperando' ? 0 : pasos.length}
        indice={indice}
      />

      <form
        key={paso}
        onSubmit={alEnviar}
        noValidate
        className={atras ? 'login-paso-atras' : 'login-paso'}
        style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 24px 24px', gap: 22 }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {contenido}
        </div>
        {pie && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{pie}</div>}
      </form>
    </div>
  )
}
