// CampoUsuario.jsx
// Campo de nombre de usuario con revisión de disponibilidad en vivo (con
// una pausa de 400ms después de dejar de escribir, para no consultar en
// cada tecla). Se usa en el registro (Login.jsx) y al elegir/cambiar usuario
// (ElegirUsuarioDialog.jsx). Informa su estado con `onEstado`:
// 'invalido' | 'revisando' | 'libre' | 'ocupado' | 'no_permitido' | 'error'.
// `actual` = el usuario que ya es del alumno: se considera libre.

import { useEffect, useState } from 'react'
import { limpiarUsuario, validarUsuario, estadoUsuario } from '../services/usuario'
import { HiOutlineAtSymbol } from 'react-icons/hi2'

const MENSAJES = {
  revisando: { texto: 'Revisando…', color: 'var(--text-muted)' },
  libre: { texto: 'Disponible', color: 'var(--correct)' },
  ocupado: { texto: 'Ya está en uso', color: 'var(--wrong)' },
  no_permitido: { texto: 'No está permitido', color: 'var(--wrong)' },
  error: { texto: 'No se pudo revisar', color: 'var(--text-muted)' },
}

export default function CampoUsuario({ valor, onChange, onEstado, actual = null, autoFocus = false }) {
  const [estado, setEstado] = useState('invalido')
  const errorFormato = validarUsuario(valor)

  useEffect(() => {
    let cancelado = false
    let nuevo
    if (errorFormato) nuevo = 'invalido'
    else if (actual && valor === actual) nuevo = 'libre'
    else nuevo = 'revisando'
    setEstado(nuevo)
    onEstado?.(nuevo)
    if (nuevo !== 'revisando') return

    const t = setTimeout(() => {
      estadoUsuario(valor)
        .then(e => { if (!cancelado) { setEstado(e); onEstado?.(e) } })
        .catch(() => { if (!cancelado) { setEstado('error'); onEstado?.('error') } })
    }, 400)
    return () => { cancelado = true; clearTimeout(t) }
    // onEstado se omite a propósito de las dependencias: suele ser una
    // función nueva en cada render y relanzaría la consulta sin necesidad.
  }, [valor, errorFormato, actual])

  const aviso = estado === 'invalido'
    ? (valor ? { texto: errorFormato, color: 'var(--wrong)' } : { texto: '3 a 20: letras, números, "_" o "."', color: 'var(--text-muted)' })
    : MENSAJES[estado]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <HiOutlineAtSymbol style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', fontSize: '1.1rem', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Usuario"
          value={valor}
          onChange={e => onChange(limpiarUsuario(e.target.value))}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus={autoFocus}
          maxLength={20}
          className="auth-input"
        />
      </div>
      <p style={{ margin: '0 4px', fontSize: '0.74rem', color: aviso.color, minHeight: 16 }}>{aviso.texto}</p>
    </div>
  )
}
