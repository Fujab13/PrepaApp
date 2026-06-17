import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMateria } from '../data/index'
import Hexagono from '../components/Hexagono'
import OpcionBtn from '../components/OpcionBtn'
import { useProgreso } from '../hooks/useProgreso'
import { getPreguntasDeUnidad } from '../components/unidades'

export default function Leccion() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const materia = getMateria(materiaId)
  const { unidad, elemento, cargando, guardarProgreso, reiniciar } = useProgreso(materiaId)
  const [idx, setIdx]               = useState(0)
  const [respondido, setRespondido] = useState(false)
  const [feedback, setFeedback]     = useState('')
  const [estados, setEstados]       = useState(['normal', 'normal', 'normal'])
  const [esFullscreen, setEsFullscreen] = useState(false)

  useEffect(() => {
    if (!cargando && elemento !== undefined) setIdx(elemento)
  }, [cargando, elemento])

  useEffect(() => {
    if (!materia) navigate('/')
  }, [materia, navigate])

  if (!materia) return null

  const preguntas = cargando ? [] : getPreguntasDeUnidad(materia.preguntas, unidad)
  const pregunta  = preguntas[idx]

  if (cargando || !pregunta) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Cargando lección…
      </div>
    )
  }

  const avance     = Math.round((idx / preguntas.length) * 100)
  const progresoHex = Math.round((idx / preguntas.length) * 6)

  function responder(i) {
    if (respondido) return
    const correcta = pregunta.correcta
    const nuevos = pregunta.opciones.map((_, j) => {
      if (j === correcta) return 'correcto'
      if (j === i && i !== correcta) return 'incorrecto'
      return 'normal'
    })
    setEstados(nuevos)
    setRespondido(true)
    setFeedback(i === correcta ? '✅ ¡Correcto!' : '❌ Incorrecto. La respuesta correcta está marcada.')
  }

  async function siguiente() {
    const esUltima = idx === preguntas.length - 1
    if (esUltima) {
      await guardarProgreso(unidad + 1, 0)
      navigate('/')
    } else {
      const sig = idx + 1
      setIdx(sig)
      setRespondido(false)
      setFeedback('')
      setEstados(Array(preguntas[sig].opciones.length).fill('normal'))
      await guardarProgreso(unidad, sig)
    }
  }

  async function borrarProgresoTemporal() {
    if (window.confirm('Esto borrará todo el progreso de esta materia. ¿Continuar?')) {
      await reiniciar()
      setIdx(0)
      setEstados(['normal', 'normal', 'normal'])
      setRespondido(false)
      setFeedback('')
      navigate('/')
    }
  }

  function copiarPregunta() {
    const texto = `${pregunta.pregunta}\n\n${pregunta.opciones.map((op, i) => `${i + 1}. ${op}`).join('\n')}\n\nRespuesta correcta: ${pregunta.opciones[pregunta.correcta]}`
    navigator.clipboard.writeText(texto)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setEsFullscreen(true)
    } else {
      document.exitFullscreen()
      setEsFullscreen(false)
    }
  }

  const esUltima = idx === preguntas.length - 1

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      padding: '0 16px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 0 12px',
      }}>
        <button
          onClick={() => navigate('/')}
          title="Salir"
          style={{
            flexShrink: 0,
            background: 'var(--surface)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            width: 34,
            height: 34,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        ✕
        </button>
        
        <div style={{
          flex: 1,
          height: '6px',
          background: 'var(--surface2)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: '99px',
            background: materia.color,
            width: `${avance}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{materia.icono}</span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 18,
      }}>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <Hexagono progreso={progresoHex} color={materia.color} size={92} />
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.68rem',
            margin: '3px 0 0',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            U{unidad}
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 2px' }}>
            Pregunta {idx + 1}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {preguntas.length}</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            Unidad {unidad}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {[
            { label: '↺', title: 'Reiniciar', action: borrarProgresoTemporal },
            { label: '⎘', title: 'Copiar pregunta', action: copiarPregunta },
            { label: esFullscreen ? '⛶' : '⛶', title: 'Pantalla completa', action: toggleFullscreen },
          ].map(({ label, title, action }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              style={{
                background: 'var(--surface)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '7px',
                width: 30,
                height: 30,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '16px 18px',
        marginBottom: 14,
        borderLeft: `3px solid ${materia.color}`,
      }}>
        <p style={{
          fontSize: '1rem',
          lineHeight: 1.65,
          fontWeight: 500,
          margin: 0,
          color: 'var(--text)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}>
          {pregunta.pregunta}
        </p>
      </div>

      <div style={{ minHeight: 22, marginBottom: 10 }}>
        {feedback && (
          <p style={{
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.88rem',
            margin: 0,
            color: feedback.startsWith('✅') ? 'var(--correct)' : 'var(--wrong)',
          }}>
            {feedback}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {pregunta.opciones.map((op, i) => (
          <OpcionBtn key={i} texto={op} estado={estados[i]} onClick={() => responder(i)} />
        ))}
      </div>

      <div style={{ padding: '14px 0 20px', minHeight: 62 }}>
        {respondido && (
          <button
            onClick={siguiente}
            style={{
              background: materia.color,
              color: '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '0.95rem',
              width: '100%',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {esUltima ? '🏁 Finalizar lección' : 'Siguiente →'}
          </button>
        )}
      </div>

    </div>
  )
}