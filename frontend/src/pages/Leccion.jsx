import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMateria } from '../data/index'
import Hexagono from '../components/Hexagono'
import OpcionBtn from '../components/OpcionBtn'
import { useProgreso } from '../hooks/useProgreso'
import { getPreguntasDeUnidad } from '../components/unidades'

import { IoMdClose } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { MdFullscreen } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { MdRestartAlt } from "react-icons/md";
import { PiCopy } from "react-icons/pi";


export default function Leccion() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const materia = getMateria(materiaId)
  const { unidad, elemento, cargando, guardarProgreso, reiniciar } = useProgreso(materiaId)

  const [cola, setCola]                             = useState(null)
  const [correctasIniciales, setCorrectasIniciales]  = useState(0)
  const [correctasNuevas, setCorrectasNuevas]        = useState(0)
  const [respondido, setRespondido]                  = useState(false)
  const [feedback, setFeedback]                      = useState('')
  const [estados, setEstados]                        = useState(['normal', 'normal', 'normal'])
  const [esFullscreen, setEsFullscreen]              = useState(false)
  const inicializadoRef = useRef(false)

  useEffect(() => {
    if (cargando || elemento === undefined || !materia || inicializadoRef.current) return

    const total = getPreguntasDeUnidad(materia.preguntas, unidad).length
    if (total === 0) return

    const yaCorrectas = Math.min(elemento, total)
    const restantes = Array.from({ length: total - yaCorrectas }, (_, i) => i + yaCorrectas)

    setCorrectasIniciales(yaCorrectas)
    setCorrectasNuevas(0)
    setCola(restantes.length > 0 ? restantes : Array.from({ length: total }, (_, i) => i))

    inicializadoRef.current = true
  }, [cargando, elemento, materia, unidad])

  useEffect(() => {
    inicializadoRef.current = false
  }, [materiaId, unidad])

  useEffect(() => {
    if (!materia) navigate('/')
  }, [materia, navigate])

  if (!materia) return null

  const preguntas = cargando ? [] : getPreguntasDeUnidad(materia.preguntas, unidad)
  const colaLista = cola !== null
  const idxActual = colaLista && cola.length > 0 ? cola[0] : null
  const pregunta  = idxActual !== null ? preguntas[idxActual] : null

  if (cargando || !colaLista || preguntas.length === 0 || !pregunta) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Cargando lección…
      </div>
    )
  }

  const totalCorrectas = correctasIniciales + correctasNuevas
  const avance      = Math.round((totalCorrectas / preguntas.length) * 100)
  const progresoHex = Math.round((totalCorrectas / preguntas.length) * 6)
  const esUltima    = cola.length === 1 // && totalCorrectas === preguntas.length - 1

  function responder(i) {
    if (respondido) return
    const correcta = pregunta.correcta
    const esCorrecta = i === correcta
    const nuevos = pregunta.opciones.map((_, j) => {
      if (j === correcta) return 'correcto'
      if (j === i && i !== correcta) return 'incorrecto'
      return 'normal'
    })
    setEstados(nuevos)
    setRespondido(true)
    setFeedback(esCorrecta ? '✅ ¡Correcto!' : '❌ Incorrecto. Corrigela al final.')
  }

  async function siguiente() {
    const respondioMal = estados.includes('incorrecto')

    let nuevaCola = cola.slice(1)
    let nuevasCorrectas = correctasNuevas

    if (respondioMal) {
      nuevaCola = [...nuevaCola, idxActual]
    } else {
      nuevasCorrectas = correctasNuevas + 1
      setCorrectasNuevas(nuevasCorrectas)
    }

    setRespondido(false)
    setFeedback('')

    if (nuevaCola.length === 0) {
      await guardarProgreso(unidad + 1, 0)
      navigate('/')
      return
    }

    setCola(nuevaCola)
    const siguienteIdx = nuevaCola[0]
    setEstados(Array(preguntas[siguienteIdx].opciones.length).fill('normal'))

    if (!respondioMal) {
      await guardarProgreso(unidad, correctasIniciales + nuevasCorrectas)
    }
  }

  async function borrarProgresoTemporal() {
    if (window.confirm('Esto borrará todo el progreso de esta materia. ¿Continuar?')) {
      await reiniciar()
      setCola(null)
      setCorrectasIniciales(0)
      setCorrectasNuevas(0)
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
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 5}}
        >
        <AiOutlineClose />
        </button>
        <span style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.35rem', padding: 2}}>{materia.icono}</span>
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

        
        <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)', 
          fontSize: '0.75rem', 
          marginLeft: 'auto',
          textTransform: 'uppercase', 
          letterSpacing: '1.5px', 
          padding: 7
          
        }}>
          {[
            { label: <MdRestartAlt />, title: 'Reiniciar', action: borrarProgresoTemporal },
            { label: <PiCopy />, title: 'Copiar pregunta', action: copiarPregunta },
            { label: esFullscreen ? <MdFullscreen /> : <MdFullscreen />, title: 'Pantalla completa', action: toggleFullscreen },
          ].map(({ label, title, action }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="util-btn" >{label}</button>
          ))}
        </div>
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
            Correctas {totalCorrectas}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {preguntas.length}</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            Unidad {unidad}
          </p>
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
            {esUltima ? '🏁 Finalizar lección' : 'Siguiente'}
          </button>
        )}
      </div>

    </div>
  )
}