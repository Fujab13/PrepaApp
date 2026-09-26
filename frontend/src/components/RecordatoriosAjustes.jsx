// RecordatoriosAjustes.jsx
// Sección "Recordatorios de estudio" de pages/Ajustes.jsx: activar o
// desactivar las notificaciones de este navegador (lo mismo que la
// campanita del Sidenav), y elegir cada cuánto (diario / cada 3 días /
// semanal) y a qué hora llegan, en la hora local del alumno. Se guarda al
// momento, sin botón de guardar. Las preferencias valen para todos sus
// dispositivos; el servidor las usa en suscripciones_recordatorio_pendientes
// (migración 20260926200000).

import { useEffect, useState } from 'react'
import {
  notificacionesSoportadas,
  estadoPermiso,
  obtenerSuscripcionActual,
  activarNotificaciones,
  desactivarNotificaciones,
  mensajeErrorNotificaciones,
  obtenerPreferenciasRecordatorio,
  guardarPreferenciasRecordatorio,
} from '../services/pushNotifications'
import { Skeleton } from './Skeleton'

const FRECUENCIAS = [
  { dias: 1, texto: 'Diario' },
  { dias: 3, texto: 'Cada 3 días' },
  { dias: 7, texto: 'Semanal' },
]

// Mismos valores por defecto que usa el servidor si no hay preferencias.
const POR_DEFECTO = { frecuenciaDias: 3, hora: 17 }

function textoHora(h) {
  const fecha = new Date(2000, 0, 1, h, 0)
  return fecha.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

const estiloTarjeta = { background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }
const estiloEtiqueta = { margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }

export default function RecordatoriosAjustes({ user }) {
  const soportadas = notificacionesSoportadas()
  const [activas, setActivas] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [cambiando, setCambiando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    Promise.all([
      soportadas ? obtenerSuscripcionActual() : Promise.resolve(null),
      obtenerPreferenciasRecordatorio(user.id).catch(() => null),
    ]).then(([sub, p]) => {
      if (cancelado) return
      setActivas(Boolean(sub))
      setPrefs(p ? { frecuenciaDias: p.frecuencia_dias, hora: p.hora } : POR_DEFECTO)
    })
    return () => { cancelado = true }
  }, [user.id, soportadas])

  useEffect(() => {
    if (!guardado) return
    const t = setTimeout(() => setGuardado(false), 1800)
    return () => clearTimeout(t)
  }, [guardado])

  async function alternar() {
    setCambiando(true)
    setError('')
    try {
      if (activas) {
        await desactivarNotificaciones()
        setActivas(false)
      } else {
        // Crea las preferencias si no había; luego se reescriben abajo con
        // lo que muestre esta pantalla, para que coincidan.
        await activarNotificaciones()
        setActivas(true)
        await guardarPreferenciasRecordatorio(prefs)
      }
    } catch (err) {
      setError(mensajeErrorNotificaciones(err))
    }
    setCambiando(false)
  }

  async function cambiar(nuevas) {
    const antes = prefs
    const siguientes = { ...prefs, ...nuevas }
    setPrefs(siguientes)
    setError('')
    try {
      await guardarPreferenciasRecordatorio(siguientes)
      setGuardado(true)
    } catch {
      setPrefs(antes)
      setError('No se pudo guardar. Intenta de nuevo.')
    }
  }

  if (activas === null || prefs === null) {
    return (
      <div style={estiloTarjeta} aria-busy="true">
        <Skeleton width="55%" height={13} sutil />
        <Skeleton height={40} radius={999} sutil />
        <Skeleton height={44} radius={12} sutil />
      </div>
    )
  }

  const bloqueado = estadoPermiso() === 'denied'
  const horaActual = new Date().getHours()

  return (
    <div style={estiloTarjeta}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>Recordatorios de estudio</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {!soportadas ? 'Tu navegador no las permite.' : activas ? 'Activados en este dispositivo' : 'Desactivados'}
          </p>
        </div>
        {soportadas && (
          <button
            type="button"
            role="switch"
            aria-checked={activas}
            aria-label="Recordatorios de estudio"
            onClick={alternar}
            disabled={cambiando}
            style={{
              width: 56, height: 44, flexShrink: 0, background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: cambiando ? 'default' : 'pointer',
              opacity: cambiando ? 0.6 : 1,
            }}
          >
            <span style={{
              width: 44, height: 26, borderRadius: 999, position: 'relative',
              background: activas ? '#4f8ef7' : 'var(--surface)', border: '1px solid var(--border)',
              transition: 'background 0.2s ease',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: activas ? 20 : 2, width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'left 0.2s ease',
              }} />
            </span>
          </button>
        )}
      </div>

      {soportadas && bloqueado && !activas && (
        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
          Las notificaciones están bloqueadas para este sitio. Permítelas en la configuración del navegador (el candado junto a la dirección) y vuelve a activarlas aquí.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={estiloEtiqueta}>Frecuencia</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {FRECUENCIAS.map(f => {
            const elegida = prefs.frecuenciaDias === f.dias
            return (
              <button
                key={f.dias}
                type="button"
                onClick={() => !elegida && cambiar({ frecuenciaDias: f.dias })}
                aria-pressed={elegida}
                style={{
                  flex: 1, minHeight: 44, borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${elegida ? '#4f8ef7' : 'var(--border)'}`,
                  background: elegida ? 'rgba(79,142,247,0.16)' : 'var(--surface)',
                  color: 'var(--text)', fontSize: '0.84rem', fontWeight: elegida ? 700 : 600,
                }}
              >
                {f.texto}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={estiloEtiqueta}>Hora</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={prefs.hora}
            onChange={e => cambiar({ hora: Number(e.target.value) })}
            aria-label="Hora del recordatorio"
            style={{
              flex: 1, minHeight: 44, borderRadius: 12, padding: '0 12px',
              background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
              fontSize: '0.9rem', fontFamily: 'inherit',
            }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{textoHora(h)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => cambiar({ hora: horaActual })}
            disabled={prefs.hora === horaActual}
            style={{
              minHeight: 44, padding: '0 14px', borderRadius: 12, flexShrink: 0,
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: prefs.hora === horaActual ? 'default' : 'pointer', opacity: prefs.hora === horaActual ? 0.5 : 1,
            }}
          >
            Usar hora actual
          </button>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.76rem', minHeight: 16, color: error ? 'var(--wrong)' : 'var(--correct)' }} role={error ? 'alert' : undefined}>
        {error || (guardado ? 'Guardado' : '')}
      </p>
    </div>
  )
}
