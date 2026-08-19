import { useState, useEffect, useRef, isValidElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'
import * as FiIcons from 'react-icons/fi'
import * as PiIcons from 'react-icons/pi'
import * as BsIcons from 'react-icons/bs'
import * as MdIcons from 'react-icons/md'
import * as RiIcons from 'react-icons/ri'
import Hexagono from '../components/Hexagono'
import OpcionBtn from '../components/OpcionBtn'
import TarjetaRepaso from '../components/TarjetaRepaso'
import Celebracion from '../components/Celebracion'
import { useProgreso } from '../hooks/useProgreso'
import { getPreguntasDeUnidad } from '../data/unidades'
import { obtenerLeccionDeSesion } from '../services/leccionesPremium';
import { triggerVibration } from '../utils/haptics';

import { IoMdClose } from "react-icons/io";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { MdRestartAlt } from "react-icons/md";
import { PiCopy, PiCheckBold } from "react-icons/pi";
import { MdOutlineReplay } from "react-icons/md";

const COLOR_REFUERZO = '#26d1e8' // mismo azul que la lección de español, por coincidencia

// --- Persistencia local de preguntas falladas, por materia y por unidad ---
// No usa Supabase: es una mejora de UX local, no progreso "oficial".
function leerFallosGuardados(materiaId) {
  try {
    const raw = localStorage.getItem(`refuerzo_${materiaId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function guardarFalloEnUnidad(materiaId, unidad, preguntaObj) {
  const todos = leerFallosGuardados(materiaId)
  const lista = todos[unidad] || []
  if (lista.some(p => p.pregunta === preguntaObj.pregunta)) return

  todos[unidad] = [
    ...lista,
    { pregunta: preguntaObj.pregunta, opciones: preguntaObj.opciones, correcta: preguntaObj.correcta }
  ].slice(-6)

  localStorage.setItem(`refuerzo_${materiaId}`, JSON.stringify(todos))
}

// Extrae hasta `cantidad` preguntas falladas de una unidad (al azar) y las
// retira de la reserva para no repetirlas en el siguiente repaso.
function tomarFallosDeUnidad(materiaId, unidad, cantidad) {
  const todos = leerFallosGuardados(materiaId)
  const lista = todos[unidad] || []
  if (lista.length === 0) return []

  const barajada = [...lista].sort(() => Math.random() - 0.5)
  const elegidas = barajada.slice(0, cantidad)

  todos[unidad] = lista.filter(p => !elegidas.includes(p))
  localStorage.setItem(`refuerzo_${materiaId}`, JSON.stringify(todos))

  return elegidas
}

export default function Leccion() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const [materia, setMateria] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const { unidad, elemento, cargando: cargandoProgreso, guardarProgreso } = useProgreso(materiaId)

  const [cola, setCola]                             = useState(null)
  const [correctasIniciales, setCorrectasIniciales]  = useState(0)
  const [correctasNuevas, setCorrectasNuevas]        = useState(0)
  const [respondido, setRespondido]                  = useState(false)
  const [feedback, setFeedback]                      = useState('')
  const [estados, setEstados]                        = useState(['normal', 'normal', 'normal'])
  const [esFullscreen, setEsFullscreen]              = useState(false)
  const [enRepaso, setEnRepaso]                      = useState(false)
  const [colaRepaso, setColaRepaso]                  = useState([])
  const [copiado, setCopiado]                        = useState(false)
  const [celebrando, setCelebrando]                  = useState(false)
  const inicializadoRef = useRef(false)

  useEffect(() => {
    // Espera tanto a que cargue la lección como a que useProgreso termine de
    // leer la unidad/elemento reales (Supabase o localStorage); si no, este
    // efecto corre primero con los valores por defecto (unidad 1, elemento 0)
    // y se alcanza a ver un parpadeo de la unidad 1 antes de corregirse.
    if (cargando || cargandoProgreso || elemento === undefined || !materia || inicializadoRef.current) return

    const total = getPreguntasDeUnidad(materia.preguntas, unidad).length
    if (total === 0) return

    const yaCorrectas = Math.min(elemento, total)
    const restantes = Array.from({ length: total - yaCorrectas }, (_, i) => i + yaCorrectas)

    setCorrectasIniciales(yaCorrectas)
    setCorrectasNuevas(0)
    setCola(restantes.length > 0 ? restantes : Array.from({ length: total }, (_, i) => i))

    inicializadoRef.current = true
  }, [cargando, cargandoProgreso, elemento, materia, unidad])

  useEffect(() => {
    inicializadoRef.current = false
    setEnRepaso(false)
    setColaRepaso([])
  }, [materiaId, unidad])

  useEffect(() => {
    let activo = true

    async function cargarLeccion() {
      if (!materiaId) return

      try {
        setCargando(true)
        setErrorCarga('')

        // --- Lección premium (comprada, viene del bucket privado) ---
        if (materiaId.startsWith('premium-')) {
          const productoId = materiaId.replace('premium-', '')
          const cacheada = obtenerLeccionDeSesion(productoId)

          if (!cacheada) {
            throw new Error('La lección no está disponible. Vuelve al inventario e ábrela de nuevo.')
          }

          const data = cacheada.data
          const leccion = {
            ...data,
            id: materiaId,
            preguntas: Array.isArray(data.preguntas) ? data.preguntas : [],
            icono: data.icono || 'FaBookOpen',
            color: data.color || '#7c5cbf',
            nombre: data.nombre || data.titulo || cacheada.nombreProducto,
          }

          if (activo) setMateria(leccion)
          return
        }

        // --- Lección gratuita (JSON local, como antes) ---
        const modulos = import.meta.glob('../data/lecciones/*.json', { eager: true, import: 'default' })
        const ruta = Object.keys(modulos).find((rutaActual) => rutaActual.endsWith(`/${materiaId}.json`))

        if (!ruta) {
          throw new Error('No existe una lección JSON para esta materia.')
        }

        const data = modulos[ruta]
        const leccion = {
          ...data,
          id: materiaId,
          preguntas: Array.isArray(data.preguntas) ? data.preguntas : [],
          icono: data.icono || 'FaBookOpen',
          color: data.color || '#7c5cbf',
          nombre: data.nombre || data.titulo || materiaId,
        }

        if (activo) setMateria(leccion)
      } catch (error) {
        console.error('No se pudo cargar la lección:', error)
        if (activo) {
          setErrorCarga(error.message || 'No se pudo cargar la lección.')
          setMateria(null)
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarLeccion()

    return () => {
      activo = false
    }
  }, [materiaId])

  useEffect(() => {
    if (!materia && !cargando) navigate('/')
  }, [materia, cargando, navigate])

  if (!materia) return null

  const preguntas = (cargando || cargandoProgreso) ? [] : getPreguntasDeUnidad(materia.preguntas, unidad)
  const colaLista = cola !== null
  const idxActual = colaLista && cola.length > 0 ? cola[0] : null
  const pregunta  = enRepaso
    ? (colaRepaso[0] || null)
    : (idxActual !== null ? preguntas[idxActual] : null)

  if (cargando || cargandoProgreso || !colaLista || preguntas.length === 0 || !pregunta) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center',
      }}>
        {errorCarga ? (
          <p style={{ color: 'var(--wrong)', fontSize: '0.9rem', margin: 0 }}>{errorCarga}</p>
        ) : (
          <>
            <AiOutlineLoading3Quarters
              className="spin"
              style={{ fontSize: '1.8rem', color: materia?.color || '#7c5cbf' }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Preparando tu lección…
            </p>
          </>
        )}
      </div>
    )
  }

  const totalCorrectas = correctasIniciales + correctasNuevas
  const avance      = Math.round((totalCorrectas / preguntas.length) * 100)
  const progresoHex = Math.round((totalCorrectas / preguntas.length) * 6)
  const esUltima    = enRepaso ? colaRepaso.length === 1 : cola.length === 1

  // Tolerancia a preguntas incompletas: cualquiera de estos campos puede
  // faltar sin detener el flujo de la lección (ver responder/siguiente).
  const tieneOpciones      = Array.isArray(pregunta.opciones) && pregunta.opciones.length > 0
  const tieneCorrecta      = typeof pregunta.correcta === 'number'
  const tienePreguntaTexto = typeof pregunta.pregunta === 'string' && pregunta.pregunta.trim() !== ''
  const avanceDirecto      = !enRepaso && !tieneOpciones

  function responder(i) {
    if (respondido) return
    const correcta = pregunta.correcta
    // Sin "correcta" definida, cualquier opción cuenta como válida.
    const esCorrecta = !tieneCorrecta || i === correcta
    const nuevos = pregunta.opciones.map((_, j) => {
      if (!tieneCorrecta) return j === i ? 'correcto' : 'normal'
      if (j === correcta) return 'correcto'
      if (j === i && i !== correcta) return 'incorrecto'
      return 'normal'
    })
    setEstados(nuevos)
    setRespondido(true)
    setFeedback(esCorrecta ? '✅ ¡Correcto!' : '❌ Incorrecto. Corrigela al final.')
    triggerVibration(esCorrecta ? 'success' : 'error')

    if (!esCorrecta && !pregunta.intro) {
      // Las preguntas "intro" (bienvenida/tutorial) nunca van a repaso: no
      // son contenido que se deba dominar ni repetir más adelante.
      // En repaso, guarda de nuevo bajo la unidad de origen para que
      // vuelva a aparecer más adelante si aún no se domina.
      const unidadClave = enRepaso ? unidad - 1 : unidad
      guardarFalloEnUnidad(materiaId, unidadClave, pregunta)
    }
  }

  // Terminar una unidad es el logro más grande dentro de la lección: se
  // retrasa un poco la salida para que la celebración alcance a verse.
  function celebrarYNavegar() {
    setCelebrando(true)
    triggerVibration('celebracion')
    setTimeout(async () => {
      await guardarProgreso(unidad + 1, 0)
      navigate('/')
    }, 550)
  }

  async function siguiente() {
    const respondioMal = estados.includes('incorrecto')

    if (enRepaso) {
      let nuevaColaRepaso = colaRepaso.slice(1)
      if (respondioMal) {
        nuevaColaRepaso = [...nuevaColaRepaso, colaRepaso[0]]
      }

      if (nuevaColaRepaso.length === 0) {
        // Se deja "respondido" y colaRepaso tal cual (sin resetear) para que
        // la última tarjeta siga visible detrás de la celebración.
        celebrarYNavegar()
        return
      }

      setRespondido(false)
      setFeedback('')
      setColaRepaso(nuevaColaRepaso)
      setEstados(Array(nuevaColaRepaso[0].opciones.length).fill('normal'))
      return
    }

    let nuevaCola = cola.slice(1)
    let nuevasCorrectas = correctasNuevas

    if (respondioMal) {
      nuevaCola = [...nuevaCola, idxActual]
    } else {
      nuevasCorrectas = correctasNuevas + 1
      setCorrectasNuevas(nuevasCorrectas)
    }

    if (nuevaCola.length === 0) {
      // Unidad terminada: si en la unidad anterior hubo preguntas falladas,
      // se hace un repaso de refuerzo antes de avanzar de verdad.
      const fallosPrevios = unidad > 1 ? tomarFallosDeUnidad(materiaId, unidad - 1, 3) : []
      if (fallosPrevios.length > 0) {
        setRespondido(false)
        setFeedback('')
        setEnRepaso(true)
        setColaRepaso(fallosPrevios)
        setEstados(Array(fallosPrevios[0].opciones.length).fill('normal'))
        return
      }

      // Se deja "respondido" y "cola" tal cual (sin resetear) para que la
      // última pregunta siga visible detrás de la celebración.
      celebrarYNavegar()
      return
    }

    setRespondido(false)
    setFeedback('')
    setCola(nuevaCola)
    const siguienteIdx = nuevaCola[0]
    const siguientesOpciones = preguntas[siguienteIdx].opciones
    setEstados(Array(Array.isArray(siguientesOpciones) ? siguientesOpciones.length : 0).fill('normal'))

    if (!respondioMal) {
      await guardarProgreso(unidad, correctasIniciales + nuevasCorrectas)
    }
  }

  async function retrocederUnidad() {
    const unidadDestino = Math.max(1, unidad - 1)
    const mensaje = unidadDestino === unidad
      ? 'Esto reiniciará tu progreso en la unidad actual. ¿Continuar?'
      : `Esto te regresará a la unidad ${unidadDestino}. ¿Continuar?`
    if (window.confirm(mensaje)) {
      await guardarProgreso(unidadDestino, 0)
      setCola(null)
      setCorrectasIniciales(0)
      setCorrectasNuevas(0)
      setEnRepaso(false)
      setColaRepaso([])
      setEstados(['normal', 'normal', 'normal'])
      setRespondido(false)
      setFeedback('')
      navigate('/')
    }
  }

  function copiarPregunta() {
    const partes = []
    if (tienePreguntaTexto) partes.push(pregunta.pregunta)
    if (tieneOpciones) {
      partes.push(pregunta.opciones.map((op, i) => `${i + 1}. ${op}`).join('\n'))
      if (tieneCorrecta) partes.push(`Respuesta correcta: ${pregunta.opciones[pregunta.correcta]}`)
    }
    navigator.clipboard.writeText(partes.join('\n\n'))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
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

  const renderIconoMateria = (icono) => {
    if (!icono) return null

    if (isValidElement(icono)) {
      return icono
    }

    const iconName = typeof icono === 'string' ? icono : ''
    const iconSet = {
      ...FaIcons,
      ...FiIcons,
      ...PiIcons,
      ...BsIcons,
      ...MdIcons,
      ...RiIcons,
    }

    const Icono = iconSet[iconName]
    return Icono ? <Icono size={20} /> : null
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
    }}>

      <div className="page-topbar-compact" style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* 1. Botón Salir */}
        <button
          onClick={() => navigate('/')}
          title="Salir"
          className="page-topbar-btn"
          data-gamificacion="bajo"
        >
          <AiOutlineClose />
        </button>

        {/* 2. Icono de la Materia */}
        <span className="page-topbar-btn" style={{ fontSize: '1.35rem' }}>
          {renderIconoMateria(materia.icono)}
        </span>

        <span style={{ 
          position: 'relative',
          width: '40px',
          display: 'inline-flex',
        }}>
          <span style={{ 
            position: 'absolute',
            left: '0px',  // Desplazado el doble a la derecha (24px)
            top: '-18px',   // Bajado un poco (12px)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10 
          }}>
            <Hexagono progreso={progresoHex} color={materia.color} size={82} />
          </span>
        </span>

        {/* 3. Barra de Progreso (flex: 1 hace que ocupe todo el espacio sobrante) */}
        <div style={{
          flex: 1,
          height: '6px',
          background: 'var(--surface2)',
          borderRadius: '99px',
          overflow: 'hidden',
          // Un pequeño margen interno no afecta la alineación flexbox del contenedor externo
        }}>
          <div style={{
            height: '100%',
            borderRadius: '99px',
            background: materia.color,
            width: `${avance}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* 4. Contenedor de Botones de Utilidad (Alineado a la derecha) */}
        <div className="page-topbar-actions" style={{ gap: '4px' }}>
          {[
            { label: <MdRestartAlt />, title: 'Regresar unidad', action: retrocederUnidad },
            { label: copiado ? <PiCheckBold /> : <PiCopy />, title: 'Copiar pregunta', action: copiarPregunta },
            { label: esFullscreen ? <MdFullscreenExit /> : <MdFullscreen />, title: 'Pantalla completa', action: toggleFullscreen },
          ].map(({ label, title, action }) => (
            <div key={title} style={{ position: 'relative', display: 'flex' }}>
              <button
                onClick={action}
                title={title}
                className="util-btn"
                data-gamificacion="bajo"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: title === 'Copiar pregunta' && copiado ? 'var(--correct)' : 'var(--text-muted)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'background 0.2s ease',
                }}
              >
                {label}
              </button>
              {title === 'Copiar pregunta' && copiado && (
                <span style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 2,
                  color: 'var(--correct)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  ¡Copiado!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="page-content-compact" style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 100 }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 18,
      }}>
        <div style={{ flex: 1 }}>
          {enRepaso ? (
            <>
              <p style={{
                color: COLOR_REFUERZO, fontWeight: 700, fontSize: '0.78rem', margin: '0 0 2px',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                <MdOutlineReplay /> Refuerzo
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                Repasando la unidad {unidad - 1} · {colaRepaso.length} restante{colaRepaso.length === 1 ? '' : 's'}
              </p>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 2px' }}>
                Correctas {totalCorrectas}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {preguntas.length}</span>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                Unidad {unidad}
              </p>
            </>
          )}
        </div>
      </div>
      {/* En repaso, TarjetaRepaso ya trae su propia animación de "tarjeta
          que cae"; en modo normal, el bloque completo (imagen + pregunta +
          opciones) entra con un fundido minimalista por cada pregunta nueva,
          usando el índice como key para forzar el remount. */}
      {enRepaso ? (
        <>
          {pregunta.enlace_svg && (
            <div style={{
              background: "linear-gradient(135deg, var(--surface2), var(--surface))",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              marginBottom: 14,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
              boxShadow: "0 4px 16px -10px rgba(0,0,0,0.6)",
            }}>
              <img
                src={`/svgs/${pregunta.enlace_svg}`}
                alt={`Imagen de la pregunta ${pregunta.id}`}
                style={{ maxWidth: "100%", maxHeight: 400, width: "100%", objectFit: "contain", margin: 4 }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}

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

          <TarjetaRepaso
            pregunta={pregunta}
            estados={estados}
            respondido={respondido}
            color={COLOR_REFUERZO}
            onResponder={responder}
          />
        </>
      ) : (
        <div key={idxActual} className="gm-entrada" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {pregunta.enlace_svg && (
            <div style={{
              background: "linear-gradient(135deg, var(--surface2), var(--surface))",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              marginBottom: 14,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
              boxShadow: "0 4px 16px -10px rgba(0,0,0,0.6)",
            }}>
              <img
                src={`/svgs/${pregunta.enlace_svg}`}
                alt={`Imagen de la pregunta ${pregunta.id}`}
                style={{ maxWidth: "100%", maxHeight: 400, width: "100%", objectFit: "contain", margin: 4 }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}

          {tienePreguntaTexto && (
            <div style={{
              background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
              borderRadius: 6,
              padding: '18px 20px',
              marginBottom: 14,
              borderLeft: `4px solid ${materia.color}`,
              boxShadow: '0 4px 16px -10px rgba(0,0,0,0.6)',
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
          )}

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

          {tieneOpciones && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {pregunta.opciones.map((op, i) => (
                <OpcionBtn key={i} texto={op} estado={estados[i]} onClick={() => responder(i)} />
              ))}
            </div>
          )}
        </div>
      )}

      </div>

      {(respondido || avanceDirecto) && (
        <div className="page-footer-fixed">
          <div style={{ position: 'relative', width: '100%' }}>
            <Celebracion activo={celebrando} color={enRepaso ? COLOR_REFUERZO : materia.color} />
            <button
              onClick={siguiente}
              disabled={celebrando}
              className="gm-cta"
              style={{
                background: enRepaso ? COLOR_REFUERZO : materia.color,
                color: '#000',
                fontWeight: 700,
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '0.95rem',
                width: '100%',
                cursor: celebrando ? 'default' : 'pointer',
                letterSpacing: '0.01em',
                boxShadow: `0 6px 18px -6px ${enRepaso ? COLOR_REFUERZO : materia.color}80`,
                opacity: celebrando ? 0.85 : 1,
              }}
            >
              {esUltima
                ? (enRepaso ? 'Finalizar repaso' : 'Finalizar lección')
                : (avanceDirecto && !respondido ? 'Continuar' : 'Siguiente')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}