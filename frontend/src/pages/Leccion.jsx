import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Hexagono from '../components/Hexagono'
import OpcionBtn from '../components/OpcionBtn'
import TarjetaRepaso from '../components/TarjetaRepaso'
import EscaneoRecompensa from '../components/EscaneoRecompensa'
import Latex from '../components/Latex'
import Celebracion from '../components/Celebracion'
import ConfirmDialog from '../components/ConfirmDialog'
import MascotaCompanera from '../components/MascotaCompanera'
import { useStore } from '../context/StoreContext'
import { useImpulsoActivo } from '../hooks/useImpulsoActivo'
import { useProgreso } from '../hooks/useProgreso'
import { getPreguntasDeUnidad, getTotalUnidades, PREGUNTAS_POR_UNIDAD, PREGUNTAS_POR_UNIDAD_DIFICIL } from '../data/unidades'
import { obtenerLeccionDeSesion } from '../services/leccionesPremium';
import { triggerVibration } from '../utils/haptics';
import { leerModoDificil } from '../utils/modoDificil';
import { hablarTexto, detenerLectura } from '../utils/tts';
import { getLectura } from '../data/lecturas/index';
import { buscarConceptoSimilar } from '../utils/buscarConcepto';
import { useFullscreen } from '../hooks/useFullscreen';
import { renderIconoMateria } from '../utils/renderIconoMateria';

import { IoMdClose } from "react-icons/io";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdFullscreen, MdFullscreenExit, MdSkipNext, MdTimer } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { MdRestartAlt } from "react-icons/md";
import { PiCopy, PiCheckBold } from "react-icons/pi";
import { MdOutlineReplay } from "react-icons/md";
import { FaVolumeUp, FaGoogle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const COLOR_REFUERZO = '#26d1e8' // mismo azul que la lección de español, por coincidencia

// Preferencia de "lectura automática" (leer cada pregunta nueva en voz alta
// sin tener que tocar el botón de TTS). Es global entre materias: una vez
// que el alumno la prende o apaga, se respeta en cualquier lección hasta que
// la vuelva a cambiar — con la única excepción de la unidad 1 de Español
// (ver más abajo), que la activa por default en el primerísimo uso.
const AUTO_LECTURA_KEY = 'tts_auto'

function leerPreferenciaAutoLectura() {
  try {
    const raw = localStorage.getItem(AUTO_LECTURA_KEY)
    return raw === null ? null : raw === 'true'
  } catch {
    return null
  }
}

function guardarPreferenciaAutoLectura(valor) {
  try {
    localStorage.setItem(AUTO_LECTURA_KEY, String(valor))
  } catch {
    // Sin localStorage disponible, la preferencia simplemente no persiste
    // entre lecciones; no es crítico para poder seguir usando la app.
  }
}

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

  // "Pista" de la mascota compañera (ver MascotaCompanera.jsx, la estrella
  // en Mascota.jsx → Tu colección, y utils/mascotasEstado.js: activarImpulso
  // al alimentar): mientras el impulso de 3 min siga activo, se marca la
  // respuesta correcta en el DOM (ver OpcionBtn `pista`) y la mascota se
  // para ahí en vez de pasear.
  const { mascotaSeleccionada, ownsItem } = useStore()
  const impulsoActivo = useImpulsoActivo(mascotaSeleccionada)
  const pistaActiva = impulsoActivo && Boolean(mascotaSeleccionada) && ownsItem(`mascota-${mascotaSeleccionada}`)

  const [materia, setMateria] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  // Modo difícil (ver MateriaCard/Home): unidades más largas, sin tarjetas
  // de solo concepto, y con cronómetro por pregunta. Es una preferencia
  // local por materia (localStorage), no toca progreso_usuario: el
  // contador de unidad/elemento sigue siendo el mismo en ambos modos.
  const [modoDificil, setModoDificil] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(220) // décimas de segundo (22.0s)
  const tamanoUnidad = modoDificil ? PREGUNTAS_POR_UNIDAD_DIFICIL : PREGUNTAS_POR_UNIDAD
  const preguntasPool = materia
    ? (modoDificil ? materia.preguntas.filter(p => Array.isArray(p.opciones) && p.opciones.length > 0) : materia.preguntas)
    : []
  const totalUnidades = materia ? getTotalUnidades(preguntasPool, tamanoUnidad) : undefined
  const { unidad, elemento, cargando: cargandoProgreso, guardarProgreso } = useProgreso(materiaId, totalUnidades)

  const [cola, setCola]                             = useState(null)
  const [correctasIniciales, setCorrectasIniciales]  = useState(0)
  const [correctasNuevas, setCorrectasNuevas]        = useState(0)
  const [respondido, setRespondido]                  = useState(false)
  const [feedback, setFeedback]                      = useState('')
  const [estados, setEstados]                        = useState(['normal', 'normal', 'normal'])
  const { esFullscreen, toggleFullscreen, soportado: fullscreenSoportado } = useFullscreen()
  const [enRepaso, setEnRepaso]                      = useState(false)
  const [colaRepaso, setColaRepaso]                  = useState([])
  const [copiado, setCopiado]                        = useState(false)
  const [celebrando, setCelebrando]                  = useState(false)
  const [confirmacion, setConfirmacion]              = useState(null)
  const [menuAbierto, setMenuAbierto]                = useState(false)
  const [historial, setHistorial]                    = useState([])
  const [leyendo, setLeyendo]                        = useState(false)
  const [lecturaAutomatica, setLecturaAutomatica]     = useState(false)
  const [indicesFallados, setIndicesFallados]        = useState(() => new Set())
  const [errorAnteriorVisible, setErrorAnteriorVisible] = useState(false)
  const [resumen, setResumen]                        = useState(null)
  const inicializadoRef = useRef(false)
  const autoLecturaInicializadaRef = useRef(false)
  // Guarda qué unidad se acaba de completar, en el momento exacto en que se
  // sabe (justo cuando "cola" se vacía, dentro de siguiente()): para cuando
  // celebrarYNavegar() muestra el minijuego, el estado "unidad" ya pudo
  // haber avanzado de forma optimista (ver guardarProgreso) y mostraría la
  // unidad siguiente, no la que en realidad se acaba de terminar.
  const unidadCompletadaRef = useRef(null)

  // Detiene cualquier lectura en curso al salir de la lección.
  useEffect(() => {
    return () => detenerLectura()
  }, [])

  // Se lee una sola vez por materia (se activa/desactiva desde MateriaCard
  // en Home, no hay control para cambiarlo aquí dentro de la lección).
  useEffect(() => {
    setModoDificil(leerModoDificil(materiaId))
  }, [materiaId])

  useEffect(() => {
    // Espera tanto a que cargue la lección como a que useProgreso termine de
    // leer la unidad/elemento reales (Supabase o localStorage); si no, este
    // efecto corre primero con los valores por defecto (unidad 1, elemento 0)
    // y se alcanza a ver un parpadeo de la unidad 1 antes de corregirse.
    if (cargando || cargandoProgreso || elemento === undefined || !materia || inicializadoRef.current) return

    const total = getPreguntasDeUnidad(preguntasPool, unidad, tamanoUnidad).length
    if (total === 0) return

    const yaCorrectas = Math.min(elemento, total)
    const restantes = Array.from({ length: total - yaCorrectas }, (_, i) => i + yaCorrectas)

    setCorrectasIniciales(yaCorrectas)
    setCorrectasNuevas(0)
    setCola(restantes.length > 0 ? restantes : Array.from({ length: total }, (_, i) => i))

    inicializadoRef.current = true
  }, [cargando, cargandoProgreso, elemento, materia, unidad, modoDificil])

  useEffect(() => {
    // Se inicializa una sola vez, ya con la unidad real cargada (no la 1 por
    // defecto mientras useProgreso todavía no resuelve): si el alumno ya
    // tiene una preferencia guardada, se respeta; si no, arranca activada
    // solo en la unidad 1 de Español (el tutorial) y apagada en cualquier
    // otro caso.
    if (autoLecturaInicializadaRef.current) return
    if (cargando || cargandoProgreso || !materia) return

    const guardada = leerPreferenciaAutoLectura()
    setLecturaAutomatica(guardada !== null ? guardada : (materiaId === 'espanol' && unidad === 1))
    autoLecturaInicializadaRef.current = true
  }, [cargando, cargandoProgreso, materia, materiaId, unidad])

  useEffect(() => {
    inicializadoRef.current = false
    setEnRepaso(false)
    setColaRepaso([])
    setIndicesFallados(new Set())
    setErrorAnteriorVisible(false)
    // OJO: "resumen" NO se limpia aquí a propósito. Este efecto corre cada
    // vez que cambia "unidad" -y avanzar de unidad es EXACTAMENTE lo que
    // pasa al terminarla y mostrar el resumen (ver celebrarYNavegar)-, así
    // que limpiarlo aquí borraba el resumen apenas se mostraba, en el mismo
    // instante. Se limpia solo al salir de él, en continuarDesdeResumen().
  }, [materiaId, unidad])

  // Congela el aviso "Error anterior" en el momento en que cambia la
  // pregunta que se está mostrando (la cabeza de "cola"), en vez de leer
  // "indicesFallados" en cada render. Si se leyera en vivo, el aviso
  // aparecería de inmediato al fallar la pregunta actual (responder() la
  // agrega a indicesFallados en el momento), cuando debe aparecer solo la
  // próxima vez que esa pregunta se vuelva a mostrar tras haber fallado.
  useEffect(() => {
    const idx = cola && cola.length > 0 ? cola[0] : null
    setErrorAnteriorVisible(!enRepaso && idx !== null && indicesFallados.has(idx))
    // "indicesFallados" se omite a propósito: solo debe tomarse en cuenta la
    // instantánea vigente cuando cambia la pregunta mostrada (cola/enRepaso),
    // no cada vez que se marca un fallo mientras se sigue viendo la misma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cola, enRepaso])

  // Con lectura automática activada, lee en voz alta cada pregunta nueva
  // (normal o de repaso) apenas se muestra, sin esperar a que el alumno
  // toque el botón de TTS. Recalcula la pregunta actual con los mismos
  // datos que el render usa para "pregunta" más abajo, porque ese valor
  // todavía no existe en este punto del componente (se calcula después del
  // primer return condicional, y los hooks no pueden depender de él).
  useEffect(() => {
    if (!lecturaAutomatica || cargando || cargandoProgreso || !materia || cola === null) return

    const preguntaActual = enRepaso
      ? (colaRepaso[0] || null)
      : (cola.length > 0 ? getPreguntasDeUnidad(materia.preguntas, unidad)[cola[0]] : null)

    if (!preguntaActual || typeof preguntaActual.pregunta !== 'string' || !preguntaActual.pregunta.trim()) return

    const iniciado = hablarTexto(preguntaActual.pregunta, { onEnd: () => setLeyendo(false) })
    if (iniciado) setLeyendo(true)
  }, [lecturaAutomatica, cargando, cargandoProgreso, materia, unidad, cola, enRepaso, colaRepaso])

  // ── Cronómetro por pregunta (Modo difícil) ────────────────────────────────
  // Mismo problema que el efecto de lectura automática de arriba: en este
  // punto del componente "pregunta"/"tieneCorrecta" (más abajo, después del
  // primer return condicional) todavía no existen, así que este efecto solo
  // cuenta décimas de segundo — no necesita saber nada de la pregunta en sí,
  // solo cuándo cambia (cola/colaRepaso/enRepaso) y si ya se respondió.
  useEffect(() => {
    if (!modoDificil || cargando || cargandoProgreso || !materia || cola === null) return
    if (respondido) return

    setTiempoRestante(220)

    const id = setInterval(() => {
      setTiempoRestante(prev => (prev <= 1 ? 0 : prev - 1))
    }, 100)

    return () => clearInterval(id)
  }, [modoDificil, cargando, cargandoProgreso, materia, cola, colaRepaso, enRepaso, respondido])

  // Al llegar a 0 sin responder: revela la opción correcta y marca la
  // pregunta como fallada, igual que el camino de "incorrecto" de
  // responder() más abajo — recalculando la pregunta actual con los mismos
  // ingredientes crudos que el efecto de arriba, por la misma razón.
  useEffect(() => {
    if (!modoDificil || respondido || tiempoRestante > 0) return
    if (cargando || cargandoProgreso || !materia || cola === null) return

    const preguntaActual = enRepaso
      ? (colaRepaso[0] || null)
      : (cola.length > 0 ? getPreguntasDeUnidad(preguntasPool, unidad, tamanoUnidad)[cola[0]] : null)
    if (!preguntaActual || !Array.isArray(preguntaActual.opciones)) return

    const correctaIdx = preguntaActual.correcta
    const tieneCorrectaActual = typeof correctaIdx === 'number'
    const nuevosEstados = preguntaActual.opciones.map((_, j) => (tieneCorrectaActual && j === correctaIdx) ? 'correcto' : 'normal')

    setEstados(nuevosEstados)
    setRespondido(true)
    setFeedback('⏰ Tiempo agotado. Corrigela al final.')
    triggerVibration('error')

    if (!enRepaso) {
      setIndicesFallados(prev => new Set(prev).add(cola[0]))
    }
    if (!preguntaActual.intro) {
      const unidadClave = enRepaso ? unidad - 1 : unidad
      guardarFalloEnUnidad(materiaId, unidadClave, preguntaActual)
    }
  }, [modoDificil, respondido, tiempoRestante, cargando, cargandoProgreso, materia, cola, colaRepaso, enRepaso, preguntasPool, unidad, tamanoUnidad, materiaId])

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

  // Antes también redirigía a Home cuando "!materia && !cargando", pero esa
  // combinación SIEMPRE ocurre junto con errorCarga (cargarLeccion solo deja
  // materia en null vía el catch, que también lo pone) — el redirect ganaba
  // la carrera y el alumno nunca alcanzaba a leer por qué falló su lección,
  // solo se veía devuelto a Home sin explicación.
  if (!materia && !errorCarga) return null

  if (resumen) {
    return (
      <EscaneoRecompensa
        materiaId={materiaId}
        unidad={resumen.unidad}
        colorAcento={materia.color}
        modoDificil={modoDificil}
        onContinuar={continuarDesdeResumen}
      />
    )
  }

  const preguntas = (cargando || cargandoProgreso || !materia)
    ? []
    : getPreguntasDeUnidad(preguntasPool, unidad, tamanoUnidad)
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
          <>
            <p style={{ color: 'var(--wrong)', fontSize: '0.9rem', margin: 0 }}>{errorCarga}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                minHeight: 44, padding: '0 20px', borderRadius: 12, border: 'none',
                background: 'var(--surface2)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Volver al inicio
            </button>
          </>
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
  const esErrorAnterior    = errorAnteriorVisible

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

    if (!esCorrecta && !enRepaso) {
      // Marca esta pregunta como "ya fallada" en la sesión: al fallar vuelve
      // a encolarse (ver siguiente()), y la próxima vez que aparezca se le
      // mostrará el aviso "Error anterior" junto al contador de Correctas.
      setIndicesFallados(prev => new Set(prev).add(idxActual))
    }

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
    setTimeout(() => {
      // La unidad 1 de Español es el tutorial de la app y arranca con
      // lectura automática por default (ver el efecto de inicialización más
      // arriba); al terminarla, se apaga para que el resto de las lecciones
      // vuelvan al comportamiento normal (leer solo al tocar el botón de TTS).
      if (materiaId === 'espanol' && unidad === 1) {
        setLecturaAutomatica(false)
        guardarPreferenciaAutoLectura(false)
      }

      // Guarda el progreso en segundo plano (sin esperarlo) y, en vez de
      // navegar de inmediato como antes, muestra el minijuego del radar
      // (RadarMinijuego) — así no importa que guardarProgreso actualice
      // "unidad" de forma optimista mientras esa pantalla sigue montada
      // (unidadCompletadaRef ya tiene la unidad correcta congelada).
      guardarProgreso(unidad + 1, 0)
      setResumen({ unidad: unidadCompletadaRef.current })
    }, 550)
  }

  function continuarDesdeResumen() {
    navigate('/')
  }

  function alternarLectura(texto) {
    if (leyendo) {
      detenerLectura()
      setLeyendo(false)
      return
    }
    const iniciado = hablarTexto(texto, { onEnd: () => setLeyendo(false) })
    if (iniciado) setLeyendo(true)
  }

  function alternarLecturaAutomatica() {
    setLecturaAutomatica(prev => {
      const nuevo = !prev
      guardarPreferenciaAutoLectura(nuevo)
      return nuevo
    })
  }

  async function siguiente({ saltada = false } = {}) {
    // Guarda una foto del estado actual (a qué pregunta se llegó) para que
    // el botón "pregunta anterior" del menú del ícono pueda deshacerlo.
    setHistorial(h => [...h, { cola, colaRepaso, enRepaso, correctasNuevas }])
    detenerLectura()
    setLeyendo(false)

    // "saltada" es el atajo "siguiente pregunta" del menú del ícono cuando
    // se usa sobre una pregunta sin responder: se trata igual que una
    // respuesta incorrecta (vuelve más adelante en la cola) en vez de
    // darla por buena.
    const respondioMal = saltada || estados.includes('incorrecto')

    if (enRepaso) {
      let nuevaColaRepaso = colaRepaso.slice(1)
      // Solo se reencola si queda algo más primero: si era la última tarjeta
      // de repaso, reencolarla la dejaría como única tarjeta otra vez y
      // "saltar" parecería no hacer nada (la misma tarjeta reaparece sin
      // avanzar). En ese caso se deja vacía y el repaso se da por terminado.
      if (respondioMal && nuevaColaRepaso.length > 0) {
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
      // Igual que en el repaso: solo se reencola si queda algo más primero.
      // Si era la última pregunta de la unidad, reencolarla la dejaría como
      // única pregunta otra vez, y saltar/omitir se sentiría como que no
      // hace nada (la misma pregunta vuelve a aparecer sin avanzar). En ese
      // caso se deja la cola vacía y la unidad se da por terminada.
      if (nuevaCola.length > 0) {
        nuevaCola = [...nuevaCola, idxActual]
      }
    } else {
      nuevasCorrectas = correctasNuevas + 1
      setCorrectasNuevas(nuevasCorrectas)
    }

    if (nuevaCola.length === 0) {
      // Unidad terminada: si en la unidad anterior hubo preguntas falladas,
      // se hace un repaso de refuerzo antes de avanzar de verdad.
      const fallosPrevios = unidad > 1 ? tomarFallosDeUnidad(materiaId, unidad - 1, 3) : []

      // Congela qué unidad se completó ahora mismo — celebrarYNavegar() lo
      // lee de aquí, pase o no por el repaso de abajo primero.
      unidadCompletadaRef.current = unidad

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

  function retrocederUnidad() {
    const unidadDestino = Math.max(1, unidad - 1)
    const mensaje = unidadDestino === unidad
      ? 'Esto reiniciará tu progreso en la unidad actual.'
      : `Esto te regresará a la unidad ${unidadDestino} y perderás el progreso de la unidad actual.`

    setConfirmacion({
      titulo: 'Regresar de unidad',
      mensaje,
      textoConfirmar: 'Regresar',
      colorConfirmar: 'var(--wrong)',
      accion: async () => {
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
      },
    })
  }

  // Deshace el último avance registrado en el historial (ver siguiente()),
  // devolviendo la cola/colaRepaso a como estaban en la pregunta previa.
  function preguntaAnterior() {
    if (historial.length === 0) return
    const anterior = historial[historial.length - 1]
    setHistorial(h => h.slice(0, -1))
    detenerLectura()
    setLeyendo(false)
    setCola(anterior.cola)
    setColaRepaso(anterior.colaRepaso)
    setEnRepaso(anterior.enRepaso)
    setCorrectasNuevas(anterior.correctasNuevas)
    setRespondido(false)
    setFeedback('')
    setCelebrando(false)
    const opcionesPrevias = anterior.enRepaso
      ? anterior.colaRepaso[0]?.opciones
      : preguntas[anterior.cola?.[0]]?.opciones
    setEstados(Array(Array.isArray(opcionesPrevias) ? opcionesPrevias.length : 0).fill('normal'))
  }

  // Atajo del menú del ícono: a diferencia del botón "Siguiente/Continuar"
  // del pie de página, permite saltar la pregunta aunque todavía no se haya
  // respondido (o se haya respondido mal); una pregunta saltada sin
  // responder se trata como incorrecta y vuelve más adelante en la cola.
  function avanzarPregunta() {
    const saltada = tieneOpciones && !respondido
    siguiente({ saltada })
  }

  function omitirUnidad() {
    setConfirmacion({
      titulo: 'Omitir unidad',
      mensaje: `Esto te adelantará a la unidad ${unidad + 1} sin terminar la unidad actual.`,
      textoConfirmar: 'Omitir',
      colorConfirmar: 'var(--wrong)',
      accion: async () => {
        await guardarProgreso(unidad + 1, 0, { avanceValido: false })
        setCola(null)
        setCorrectasIniciales(0)
        setCorrectasNuevas(0)
        setEnRepaso(false)
        setColaRepaso([])
        setEstados(['normal', 'normal', 'normal'])
        setRespondido(false)
        setFeedback('')
        setHistorial([])
        navigate('/')
      },
    })
  }

  function construirTextoPregunta() {
    const partes = []
    if (tienePreguntaTexto) partes.push(pregunta.pregunta)
    if (tieneOpciones) {
      partes.push(pregunta.opciones.map((op, i) => `${i + 1}. ${op}`).join('\n'))
      if (tieneCorrecta) partes.push(`Respuesta correcta: ${pregunta.opciones[pregunta.correcta]}`)
    }
    return partes.join('\n\n')
  }

  function copiarPregunta() {
    navigator.clipboard.writeText(construirTextoPregunta())
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  // Arma un prompt con la pregunta actual (y sus opciones/respuesta si las
  // tiene) y abre una búsqueda de Google con él, para que el usuario reciba
  // ahí mismo el resumen con IA de Google sobre el tema.
  function explicarConIA() {
    const contexto = construirTextoPregunta()
    if (!contexto) return
    const prompt = `Explícame esto de forma clara y sencilla:\n\n${contexto}`
    navigator.clipboard?.writeText(prompt)?.catch(() => {})
    window.open(`https://www.google.com/search?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer')
  }

  // Toma el texto de la pregunta actual y busca, dentro del temario de
  // Lecturas (misma materiaId), el subtema cuyo título/conceptos comparten
  // más palabras con ella. Si lo encuentra, abre Lectura ya ubicado ahí.
  function buscarEnTemario() {
    const lectura = getLectura(materiaId)
    if (!lectura) return

    const resultado = buscarConceptoSimilar(lectura, construirTextoPregunta())
    if (!resultado) {
      navigate(`/lectura/${materiaId}`)
      return
    }

    const concepto = resultado.conceptoIdx !== null ? `&concepto=${resultado.conceptoIdx}` : ''
    navigate(`/lectura/${materiaId}?tema=${resultado.temaId}&subtema=${resultado.subtemaId}${concepto}`)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      <MascotaCompanera />

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

        {/* 2. Icono de la Materia: abre un menú rápido de navegación */}
        <div style={{ position: 'relative', display: 'flex' }}>
          <button
            onClick={() => setMenuAbierto(v => !v)}
            title="Navegación rápida"
            className="page-topbar-btn"
            data-gamificacion="bajo"
            style={{ fontSize: '1.35rem', background: 'transparent', border: 'none' }}
          >
            {renderIconoMateria(materia.icono)}
          </button>

          {menuAbierto && (
            <>
              <div
                onClick={() => setMenuAbierto(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                display: 'flex',
                gap: 6,
                padding: 6,
                background: 'var(--surface2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                boxShadow: '0 14px 30px -10px rgba(0,0,0,0.6)',
                zIndex: 45,
              }}>
                <button
                  onClick={preguntaAnterior}
                  disabled={historial.length === 0}
                  title="Pregunta anterior"
                  className="util-btn"
                  style={{
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10,
                    background: 'var(--surface)',
                    color: historial.length === 0 ? 'var(--text-muted)' : 'var(--text)',
                    opacity: historial.length === 0 ? 0.4 : 1,
                    fontSize: '1.1rem',
                  }}
                >
                  <IoIosArrowBack />
                </button>
                <button
                  onClick={() => { setMenuAbierto(false); retrocederUnidad() }}
                  title="Regresar unidad"
                  className="util-btn"
                  style={{
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10,
                    background: 'var(--surface)',
                    color: 'var(--wrong)',
                    fontSize: '1.1rem',
                  }}
                >
                  <MdRestartAlt />
                </button>
                <button
                  onClick={() => { setMenuAbierto(false); omitirUnidad() }}
                  title="Omitir unidad"
                  className="util-btn"
                  style={{
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10,
                    background: 'var(--surface)',
                    color: 'var(--wrong)',
                    fontSize: '1.1rem',
                  }}
                >
                  <MdSkipNext />
                </button>
                <button
                  onClick={avanzarPregunta}
                  title="Saltar a la siguiente pregunta"
                  className="util-btn"
                  style={{
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '1.1rem',
                  }}
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </>
          )}
        </div>

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

        {modoDificil && (
          <span
            className="reloj-minimal"
            style={{
              color: tiempoRestante <= 50 ? 'var(--wrong)' : tiempoRestante <= 100 ? '#f59e0b' : materia.color,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            <MdTimer />
            {(tiempoRestante / 10).toFixed(1)}s
          </span>
        )}

        {/* 4. Contenedor de Botones de Utilidad (Alineado a la derecha) */}
        <div className="page-topbar-actions" style={{ gap: '4px' }}>
          {[
            { label: <FiSearch />, title: 'Buscar en la lectura', action: buscarEnTemario, deshabilitado: !getLectura(materiaId) },
            { label: copiado ? <PiCheckBold /> : <PiCopy />, title: 'Copiar pregunta', action: copiarPregunta },
            // Oculto por completo donde la Fullscreen API no existe (Safari en iPhone),
            // en vez de mostrar un botón que ahí nunca podría funcionar.
            fullscreenSoportado
              ? { label: esFullscreen ? <MdFullscreenExit /> : <MdFullscreen />, title: 'Pantalla completa', action: toggleFullscreen }
              : null,
          ].filter(Boolean).map(({ label, title, action, deshabilitado }) => (
            <div key={title} style={{ position: 'relative', display: 'flex' }}>
              <button
                onClick={action}
                disabled={deshabilitado}
                title={deshabilitado ? 'No hay lectura disponible para esta materia' : title}
                className="util-btn"
                data-gamificacion="bajo"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: title === 'Copiar pregunta' && copiado ? 'var(--correct)' : 'var(--text-muted)',
                  fontSize: '1.2rem',
                  cursor: deshabilitado ? 'default' : 'pointer',
                  opacity: deshabilitado ? 0.4 : 1,
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

        {esErrorAnterior && (
          <span style={{
            color: 'var(--wrong)',
            fontWeight: 700,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            Error anterior
          </span>
        )}
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

          <div data-mascota-evitar="true">
            <TarjetaRepaso
              pregunta={pregunta}
              estados={estados}
              respondido={respondido}
              color={COLOR_REFUERZO}
              onResponder={responder}
              leyendo={leyendo}
              onLeer={() => alternarLectura(pregunta.pregunta)}
              onExplicar={explicarConIA}
              pista={pistaActiva && tieneCorrecta && !respondido}
            />
          </div>
        </>
      ) : (
        <div key={idxActual} className="gm-entrada" data-mascota-evitar="true" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.65,
                fontWeight: 500,
                color: 'var(--text)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}>
                <Latex texto={pregunta.pregunta} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  onClick={explicarConIA}
                  title="Explicar con IA (Google)"
                  className="util-btn fondo-sutil"
                  data-gamificacion="bajo"
                  style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--text-muted)',
                    fontSize: '0.92rem',
                    transition: 'background 0.2s ease, color 0.2s ease',
                  }}
                >
                  <FaGoogle />
                </button>
                <button
                  onClick={() => alternarLectura(pregunta.pregunta)}
                  title={leyendo ? 'Detener lectura' : 'Leer en voz alta'}
                  className={`util-btn${leyendo ? '' : ' fondo-sutil'}`}
                  data-gamificacion="bajo"
                  style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    background: leyendo ? materia.color : undefined,
                    color: leyendo ? '#fff' : 'var(--text-muted)',
                    fontSize: '1rem',
                    transition: 'background 0.2s ease, color 0.2s ease',
                  }}
                >
                  <FaVolumeUp />
                </button>
                <button
                  onClick={alternarLecturaAutomatica}
                  title={lecturaAutomatica ? 'Lectura automática activada' : 'Activar lectura automática'}
                  aria-pressed={lecturaAutomatica}
                  className="util-btn"
                  data-gamificacion="bajo"
                  style={{
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    width: 34, height: 20,
                    borderRadius: 999,
                    background: lecturaAutomatica ? materia.color : 'var(--surface2)',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background 0.2s ease',
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: 2,
                      left: lecturaAutomatica ? 16 : 2,
                      width: 16, height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      transition: 'left 0.2s ease',
                    }} />
                  </span>
                </button>
              </div>
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
                <OpcionBtn
                  key={i}
                  texto={op}
                  estado={estados[i]}
                  onClick={() => responder(i)}
                  pista={pistaActiva && tieneCorrecta && !respondido && i === pregunta.correcta}
                />
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
                color: '#fff',
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

      <ConfirmDialog
        abierto={!!confirmacion}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.textoConfirmar}
        colorConfirmar={confirmacion?.colorConfirmar}
        onCancelar={() => setConfirmacion(null)}
        onConfirmar={async () => {
          const accion = confirmacion?.accion
          setConfirmacion(null)
          if (accion) await accion()
        }}
      />

    </div>
  )
}