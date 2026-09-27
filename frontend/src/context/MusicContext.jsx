import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  COMPARTIDAS_REQUERIDAS,
  ESPERA_DESBLOQUEO_MS,
  marcarAppCompartida,
  leerProgresoCompartir,
  guardarProgresoCompartir,
  borrarProgresoCompartir,
} from '../services/compartirApp'

// ─────────────────────────────────────────────────────────────────────────
// Música ambiente generada en vivo con Web Audio API. Antes se usaba una
// pista .mp3 de ~41MB/1h en public/music, pero un archivo de esa duración
// se tiene que descargar/bufferear por completo (o en buena parte) en
// algunos navegadores móviles, lo que presiona memoria; un sintetizador
// nunca carga un archivo — genera tonos con osciladores en tiempo real,
// así que no hay nada que descargar ni "duración" que bufferear (suena
// indefinidamente sin repetirse literal). El .mp3 viejo y musicTracks.js
// ya se eliminaron.
//
// Variante "inspirada en música clásica": lo que de verdad distingue a la
// música clásica de un pad ambiental no es la escala, es tener ARMONÍA con
// movimiento real y un timbre de instrumento "atacado" (piano/cuerda
// pulsada) en vez de ondas sostenidas sin dirección. Por eso:
//   - Hay una PROGRESIÓN DE ACORDES real (I-vi-IV-V, la más clásica de
//     todas) que va cambiando cada ~25s — las voces solo tocan notas del
//     acorde ACTUAL, así que hay una dirección armónica de verdad en vez
//     de una escala fija sonando al azar para siempre.
//   - Cada nota tiene envolvente de piano: ataque casi instantáneo (como
//     el golpe del martillo) seguido de un decaimiento EXPONENCIAL natural
//     (`setTargetAtTime`, no una rampa lineal) — así decae de verdad una
//     cuerda, no con un fade parejo.
//   - Un pedal grave (bajo sostenido) en la raíz del acorde actual, que se
//     desliza con portamento suave hacia la nueva raíz cuando cambia el
//     acorde — un recurso clásico (nota pedal) para dar peso armónico.
//   - Notas más seguidas que un pad ambiental (cada 1.4-4s, como un
//     arpegio lento) en vez de esperar 8-16s por cada una.
// Sigue siendo 100% generativo/infinito — es una composición algorítmica
// propia con estructura tonal clásica, no una pieza existente reproducida.
// ─────────────────────────────────────────────────────────────────────────

const MusicContext = createContext(null)

const STORAGE_KEY = 'musica_silenciada'
// Bajos a propósito: es música DE FONDO, no debe competir con el contenido.
// Cada motor tiene su tope; el master solo se usa para silenciar (0 o 1).
const VOLUMEN_GENERATIVA = 0.06
const VOLUMEN_CANCIONES = 0.077
const MAX_VOCES_SIMULTANEAS = 6 // más que antes: las notas de piano se traslapan más seguido que un pad
const RAMPA_VOLUMEN_SEG = 0.08 // evita el "click" audible de saltar el volumen de golpe al (des)silenciar

// Progresión clásica I-vi-IV-V en Do mayor (la base de incontables piezas,
// de Pachelbel para acá) — cada acorde es un puñado de notas (tónica,
// tercera, quinta) en dos octavas. Las voces eligen SOLO entre las notas
// del acorde actual, nunca de las cuatro juntas, así que el oído sí
// percibe cuándo cambia la armonía.
const PROGRESION_ACORDES = [
  [130.81, 164.81, 196.00, 261.63, 329.63, 392.00], // I:   Do  Mi  Sol
  [110.00, 130.81, 164.81, 220.00, 261.63, 329.63], // vi:  La  Do  Mi
  [87.31, 110.00, 130.81, 174.61, 220.00, 261.63],  // IV:  Fa  La  Do
  [98.00, 123.47, 146.83, 196.00, 246.94, 293.66],  // V:   Sol Si  Re
]

// Raíz de cada acorde, una octava por debajo del bajo del acorde — para el
// pedal grave sostenido (ver iniciarMotorGenerativo).
const RAICES_BAJO_HZ = [65.41, 55.00, 43.65, 49.00] // Do2 La1 Fa1 Sol1

// Cuánto dura cada acorde antes de avanzar al siguiente de la progresión.
const DURACION_ACORDE_SEG = 26

function crearImpulsoReverb(ctx, duracionSeg = 2.6) {
  const muestras = Math.floor(ctx.sampleRate * duracionSeg)
  const buffer = ctx.createBuffer(2, muestras, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal)
    for (let i = 0; i < muestras; i++) {
      // Ruido blanco con caída exponencial: un impulso de reverb tipo
      // "sala de concierto" (ni tan corto que suene seco, ni tan largo
      // que emborrone el ataque de cada nota de piano), sin necesitar un
      // archivo .wav de impulso real.
      datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / muestras, 2.3)
    }
  }
  return buffer
}

// Une los nodos compartidos (filtro + reverb + master) y arranca el ciclo
// de voces. Regresa una función para detener todo y liberar el contexto.
function iniciarMotorGenerativo(ctx, masterGain) {
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 2600 // brillante (piano tiene mucho agudo en el ataque), no apagado como la variante triste
  filtro.Q.value = 0.4

  // LFO lenta sobre el corte del filtro: le da un "respiro" al timbre en
  // vez de sonar como un tono estático todo el tiempo.
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.015 // un ciclo completo cada ~66s
  lfoGain.gain.value = 400
  lfo.connect(lfoGain)
  lfoGain.connect(filtro.frequency)
  lfo.start()

  const reverb = ctx.createConvolver()
  reverb.buffer = crearImpulsoReverb(ctx)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.38
  const secoGain = ctx.createGain()
  secoGain.gain.value = 0.75 // favorece un poco más la señal seca: mucha reverb emborronaría el ataque de cada nota

  // Limitador de seguridad: cuando varias voces coinciden en su pico a la
  // vez (cosa que pasa "ocasionalmente" con timings aleatorios), esto evita
  // que la suma sature y se oiga un golpe/crujido en vez de comprimirlo
  // suavemente.
  const limitador = ctx.createDynamicsCompressor()
  limitador.threshold.value = -18
  limitador.knee.value = 24
  limitador.ratio.value = 12
  limitador.attack.value = 0.005
  limitador.release.value = 0.25

  // Segunda etapa, un "brickwall" real después del compresor de arriba:
  // ese primer compresor suaviza la dinámica general, pero cuando MUCHAS
  // voces coinciden en su pico a la vez (raro, pero pasa) la suma puede
  // seguir empujando la señal cerca de 0dBFS, lo que se oía como crujido
  // solo al subir el volumen físico del dispositivo (a volumen bajo el
  // recorte digital es inaudible, a volumen alto se nota). Umbral alto y
  // ratio/ataque agresivos para que esta etapa casi nunca actúe en uso
  // normal (no cambia el volumen de siempre) y solo intervenga en esos
  // picos puntuales.
  const limitadorPico = ctx.createDynamicsCompressor()
  limitadorPico.threshold.value = -6
  limitadorPico.knee.value = 3
  limitadorPico.ratio.value = 20
  limitadorPico.attack.value = 0.001
  limitadorPico.release.value = 0.1

  filtro.connect(secoGain)
  filtro.connect(reverb)
  reverb.connect(reverbGain)
  secoGain.connect(limitador)
  reverbGain.connect(limitador)
  limitador.connect(limitadorPico)
  limitadorPico.connect(masterGain)

  // Truco anti "denormal number stall": el filtro y el reverb son nodos
  // RECURSIVOS (arrastran estado interno de un frame de audio al siguiente).
  // Con las colas de decaimiento largas de las voces de piano (hasta ~15s
  // por nota, setTargetAtTime nunca llega exactamente a 0), ese estado
  // interno puede quedarse "vibrando" en el rango de números denormalizados
  // — un valor tan cercano a cero que la CPU los procesa cientos de veces
  // más lento en algunos navegadores (sobre todo móvil/Safari). Eso es justo
  // lo que se oye como crujidos/interferencia intermitente: no es un bug de
  // lógica, es que el hilo de audio se queda sin tiempo real cuando eso
  // pasa. Una señal DC constante e inaudible (muy por debajo del umbral de
  // audición humana) mantiene el estado interno lejos de cero para siempre,
  // sin que se note, así nunca cae en ese rango.
  const antiDenormal = ctx.createConstantSource()
  antiDenormal.offset.value = 0.000001
  antiDenormal.connect(filtro)
  antiDenormal.start()

  let indiceAcorde = 0

  // Pedal grave: nota sostenida en la raíz del acorde ACTUAL, un recurso
  // clásico (nota pedal) para dar peso armónico por debajo de las voces.
  // "Respira" con un swell muy lento (no un volumen fijo) para no sonar
  // como un zumbido estático de fondo.
  const gainDrone = ctx.createGain()
  gainDrone.gain.value = 0.07
  gainDrone.connect(filtro)

  const lfoSwellDrone = ctx.createOscillator()
  const lfoSwellDroneGain = ctx.createGain()
  lfoSwellDrone.frequency.value = 1 / (40 + Math.random() * 15)
  lfoSwellDroneGain.gain.value = 0.04
  lfoSwellDrone.connect(lfoSwellDroneGain)
  lfoSwellDroneGain.connect(gainDrone.gain)
  lfoSwellDrone.start()

  // Seno puro y detune mínimo: el pedal es fondo, no protagonista — no
  // necesita el mismo carácter "atacado" que las notas de piano de arriba.
  const osciladoresDrone = [0, 3].map((detuneCents) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = RAICES_BAJO_HZ[indiceAcorde]
    osc.detune.value = detuneCents
    osc.connect(gainDrone)
    osc.start()
    return osc
  })

  let activo = true
  const timeouts = []
  const vocesActivas = []
  let vocesSonando = 0

  // Crea UNA voz y ya — a diferencia de antes, no se reprograma a sí misma.
  // Regresa los tiempos de la nota para que quien la llamó decida cuándo
  // programar la siguiente, o `null` si se saltó la ronda.
  function crearVoz() {
    if (!activo) return null
    // Límite defensivo: si por drift de timers (p. ej. la pestaña estuvo
    // en segundo plano y el navegador atrasó los timeouts) ya hay
    // demasiadas voces sonando a la vez, se salta esta ronda en vez de
    // seguir apilando osciladores indefinidamente.
    if (vocesSonando >= MAX_VOCES_SIMULTANEAS) return null

    // Solo notas del acorde ACTUAL — nunca de las cuatro juntas — para que
    // haya una dirección armónica real en vez de una escala fija sin
    // rumbo.
    const notasAcorde = PROGRESION_ACORDES[indiceAcorde]
    const frecuenciaBase = notasAcorde[Math.floor(Math.random() * notasAcorde.length)]
    const ahora = ctx.currentTime

    // Envolvente de piano: ataque casi instantáneo (el golpe del martillo)
    // y decaimiento EXPONENCIAL natural con setTargetAtTime — así decae de
    // verdad una cuerda, no con una rampa lineal pareja como el pad
    // ambiental anterior.
    const ataque = 0.012 + Math.random() * 0.02       // 12-32ms
    const tauDecaimiento = 1.3 + Math.random() * 1.6  // 1.3-2.9s
    const picoGanancia = 0.15 + Math.random() * 0.08
    const duracionAudible = ataque + tauDecaimiento * 5 // a los ~5·tau ya es inaudible

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ahora)
    gain.gain.linearRampToValueAtTime(picoGanancia, ahora + ataque)
    gain.gain.setTargetAtTime(0, ahora + ataque, tauDecaimiento)
    gain.connect(filtro)

    // Dos ondas triangulares muy ligeramente desafinadas entre sí: imita
    // las 2-3 cuerdas por nota de un piano real (nunca están perfectamente
    // afinadas entre ellas) — ese leve "batido" da calidez en vez de sonar
    // a onda de prueba.
    const osciladores = [0, 3].map((detuneCents) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = frecuenciaBase
      osc.detune.value = detuneCents
      osc.connect(gain)
      osc.start(ahora)
      osc.stop(ahora + duracionAudible + 0.5)
      return osc
    })

    vocesActivas.push(...osciladores)
    vocesSonando += 1
    osciladores[0].addEventListener('ended', () => {
      gain.disconnect()
      osciladores.forEach((o) => {
        o.disconnect()
        const idx = vocesActivas.indexOf(o)
        if (idx !== -1) vocesActivas.splice(idx, 1) // si no se quita, la lista crece para siempre
      })
      vocesSonando -= 1
    })

    // Como un arpegio lento: mucho más seguido que el pad ambiental
    // anterior (que esperaba 8-16s), para que se sientan frases.
    const proximaEn = 1.4 + Math.random() * 2.6 // 1.4-4s
    return { proximaEn }
  }

  // Ciclo perpetuo: crea una voz y, con SU propio tiempo, decide cuándo
  // tocar la siguiente — para que se traslapen y nunca haya un silencio
  // total entre notas.
  function cicloVoces() {
    if (!activo) return
    const nota = crearVoz()
    // Si esta ronda se saltó (límite de voces), reintenta pronto en vez
    // de esperarse el intervalo largo de una nota completa.
    const proximaEn = nota ? nota.proximaEn : 1
    timeouts.push(setTimeout(cicloVoces, proximaEn * 1000))
  }

  cicloVoces()
  // Una nota extra al inicio para que desde el arranque ya se sienta como
  // un acorde y no una nota sola. Importante: es un llamado suelto a
  // crearVoz (que no se reprograma a sí misma), NO a cicloVoces — un
  // llamado a cicloVoces aquí arrancaría un SEGUNDO ciclo perpetuo
  // corriendo en paralelo para siempre, doblando permanentemente cuántas
  // voces suenan a la vez.
  timeouts.push(setTimeout(crearVoz, 1200))

  // Avanza la progresión de acordes cada DURACION_ACORDE_SEG segundos: el
  // pedal grave se desliza (portamento suave) hacia la nueva raíz, como el
  // pedal de resonancia de un piano pasando de un acorde al siguiente.
  function avanzarAcorde() {
    indiceAcorde = (indiceAcorde + 1) % PROGRESION_ACORDES.length
    const nuevaRaiz = RAICES_BAJO_HZ[indiceAcorde]
    const ahora = ctx.currentTime
    osciladoresDrone.forEach((o) => {
      o.frequency.cancelScheduledValues(ahora)
      o.frequency.setValueAtTime(o.frequency.value, ahora)
      o.frequency.linearRampToValueAtTime(nuevaRaiz, ahora + 3)
    })
    timeouts.push(setTimeout(avanzarAcorde, DURACION_ACORDE_SEG * 1000))
  }
  timeouts.push(setTimeout(avanzarAcorde, DURACION_ACORDE_SEG * 1000))

  return function detener() {
    activo = false
    timeouts.forEach(clearTimeout)
    lfo.stop()
    lfoSwellDrone.stop()
    antiDenormal.stop()
    osciladoresDrone.forEach((o) => {
      try { o.stop() } catch { /* ya pudo haber terminado sola */ }
    })
    vocesActivas.forEach((o) => {
      try { o.stop() } catch { /* ya pudo haber terminado sola */ }
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────
// "Música enriquecida" (opción en pages/Ajustes.jsx): lista de .mp3 en vez
// del motor generativo. El navegador no puede listar una carpeta del
// servidor, así que Vite arma la lista al compilar con import.meta.glob:
// basta soltar archivos en src/assets/musica/.
// Salen a dist/assets con hash, así que heredan el caché de 1 año de
// /assets/ y solo se descargan al reproducirse.
//
// Se reproducen con <audio> (streaming, no se decodifica la canción entera
// en memoria) pero pasando por Web Audio: en iOS `audio.volume` es de solo
// lectura, así que el volumen/silencio y los fundidos se hacen con GainNode.
// Dos reproductores alternados permiten el fundido cruzado de 1s entre
// canciones. Orden aleatorio como en un reproductor: se baraja la lista
// completa (sin repetir) y se toca en ese orden; al acabarla se vuelve a
// barajar, cuidando que la primera nueva no sea la que acaba de sonar.
// ─────────────────────────────────────────────────────────────────────────

const CANCIONES = Object.entries(
  import.meta.glob('../assets/musica/*.mp3', { eager: true, query: '?url', import: 'default' })
)
  .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
  .map(([, url]) => url)

const STORAGE_KEY_ENRIQUECIDA = 'musica_enriquecida'
const TRANSICION_SEG = 1
const PRECARGA_SEG = 15 // cuánto antes del final se empieza a bajar la siguiente canción
// Un mp3 masterizado sale mucho más fuerte que la suma de voces del motor
// generativo; esto los empareja antes de aplicar VOLUMEN_CANCIONES. Ajustar al oído.
const GANANCIA_CANCIONES = 0.25

// Índices 0..n-1 en orden aleatorio (Fisher-Yates). `evitarPrimero`: la
// canción que acaba de sonar, para no repetirla al empezar otra vuelta.
function barajar(n, evitarPrimero = null) {
  const orden = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[orden[i], orden[j]] = [orden[j], orden[i]]
  }
  if (n > 1 && orden[0] === evitarPrimero) {
    const j = 1 + Math.floor(Math.random() * (n - 1))
    ;[orden[0], orden[j]] = [orden[j], orden[0]]
  }
  return orden
}

function fundir(param, valor, seg, ctx) {
  const ahora = ctx.currentTime
  param.cancelScheduledValues(ahora)
  param.setValueAtTime(param.value, ahora)
  param.linearRampToValueAtTime(valor, ahora + seg)
}

// Regresa { detener, pausar, reanudar, reintentar }. `alFallar` se llama si
// ninguna canción de la lista se pudo reproducir.
function iniciarListaReproduccion(ctx, destino, canciones, alFallar) {
  const reproductores = [0, 1].map(() => {
    const audio = new Audio()
    audio.preload = 'none'
    const gain = ctx.createGain()
    gain.gain.value = 0
    ctx.createMediaElementSource(audio).connect(gain)
    gain.connect(destino)
    return { audio, gain, cargada: null }
  })

  let activo = 0 // cuál de los dos reproductores es el principal
  let orden = barajar(canciones.length)
  let pos = 0 // posición en `orden` de la canción actual
  // Orden de la siguiente vuelta, fijado en cuanto se necesita (la precarga
  // ya tiene que saber cuál sigue) para que precarga y cambio coincidan.
  let ordenSiguiente = null
  let transicionando = false
  let pausado = false
  let detenido = false
  let erroresSeguidos = 0
  const timeouts = []

  function cargar(r, i) {
    if (r.cargada === i) return
    r.audio.src = canciones[i]
    r.cargada = i
  }

  function siguientePosicion() {
    if (pos + 1 < orden.length) return { orden, pos: pos + 1 }
    if (!ordenSiguiente) ordenSiguiente = barajar(canciones.length, orden[pos])
    return { orden: ordenSiguiente, pos: 0 }
  }

  function cancionSiguiente() {
    const s = siguientePosicion()
    return s.orden[s.pos]
  }

  function reproducir(r) {
    if (pausado || detenido) return
    // Puede rechazarse por la política de autoplay; `reintentar` lo vuelve a
    // intentar en el siguiente toque del usuario.
    r.audio.play().catch(() => {})
  }

  function siguiente() {
    if (transicionando || detenido) return
    transicionando = true
    const anterior = reproductores[activo]
    activo = 1 - activo
    const s = siguientePosicion()
    if (s.orden !== orden) ordenSiguiente = null
    orden = s.orden
    pos = s.pos
    const nuevo = reproductores[activo]
    cargar(nuevo, orden[pos])
    nuevo.audio.currentTime = 0
    fundir(nuevo.gain.gain, 1, TRANSICION_SEG, ctx)
    reproducir(nuevo)
    fundir(anterior.gain.gain, 0, TRANSICION_SEG, ctx)
    timeouts.push(setTimeout(() => {
      anterior.audio.pause()
      transicionando = false
    }, TRANSICION_SEG * 1000 + 100))
  }

  reproductores.forEach((r) => {
    r.audio.addEventListener('timeupdate', () => {
      if (detenido || r !== reproductores[activo] || !r.audio.duration) return
      const restante = r.audio.duration - r.audio.currentTime
      if (restante <= PRECARGA_SEG) {
        const otro = reproductores[1 - activo]
        cargar(otro, cancionSiguiente())
        otro.audio.preload = 'auto'
      }
      if (restante <= TRANSICION_SEG) siguiente()
    })
    // Respaldo por si timeupdate no alcanzó a disparar el fundido.
    r.audio.addEventListener('ended', () => {
      if (!detenido && r === reproductores[activo]) siguiente()
    })
    r.audio.addEventListener('playing', () => { erroresSeguidos = 0 })
    r.audio.addEventListener('error', () => {
      if (detenido || r !== reproductores[activo]) return
      erroresSeguidos += 1
      if (erroresSeguidos >= canciones.length) {
        detenido = true
        alFallar()
        return
      }
      transicionando = false
      siguiente()
    })
  })

  cargar(reproductores[0], orden[0])
  fundir(reproductores[0].gain.gain, 1, TRANSICION_SEG, ctx)
  reproducir(reproductores[0])

  return {
    detener() {
      detenido = true
      timeouts.forEach(clearTimeout)
      reproductores.forEach((r) => {
        r.audio.pause()
        r.audio.removeAttribute('src')
        r.audio.load() // corta la descarga en curso
        r.gain.disconnect()
      })
    },
    // Al silenciar se pausa de verdad: sin esto seguiría bajando datos.
    pausar() {
      pausado = true
      reproductores.forEach((r) => r.audio.pause())
    },
    reanudar() {
      pausado = false
      reproducir(reproductores[activo])
      if (transicionando) reproducir(reproductores[1 - activo])
    },
    reintentar() {
      if (reproductores[activo].audio.paused) reproducir(reproductores[activo])
    },
  }
}

export function MusicProvider({ children }) {
  const [muted, setMuted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')
  const [enriquecida, setEnriquecida] = useState(
    () => CANCIONES.length > 0 && localStorage.getItem(STORAGE_KEY_ENRIQUECIDA) === 'true'
  )
  // Si la lista falla se cae al motor generativo sin tocar la preferencia guardada.
  const [falloLista, setFalloLista] = useState(false)
  const [ctxListo, setCtxListo] = useState(false)
  const masterGainRef = useRef(null)
  const motorRef = useRef(null)
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  // Requiere haber compartido la app (perfiles.compartio_app, ver
  // pages/Ajustes.jsx); sin sesión o sin eso, suena la música generada.
  const { user, perfil, refrescarPerfil } = useAuth()
  const desbloqueada = perfil?.compartio_app === true
  const usarLista = enriquecida && desbloqueada && !falloLista && CANCIONES.length > 0

  // Tras compartir 2 veces, espera 2 min y desbloquea. Vive aquí (no en
  // Ajustes) para que se cumpla aunque el usuario salga de esa página.
  const [esperaDesde, setEsperaDesde] = useState(null)
  useEffect(() => {
    setEsperaDesde(user ? leerProgresoCompartir(user.id).desde : null)
  }, [user])

  useEffect(() => {
    if (!user || desbloqueada || !esperaDesde) return
    const restante = Math.max(0, esperaDesde + ESPERA_DESBLOQUEO_MS - Date.now())
    const t = setTimeout(async () => {
      try {
        await marcarAppCompartida()
        await refrescarPerfil()
        borrarProgresoCompartir(user.id)
        setEsperaDesde(null)
        cambiarEnriquecida(true)
      } catch (e) {
        console.error('[Música] No se pudo desbloquear:', e?.message)
      }
    }, restante)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, desbloqueada, esperaDesde])

  function iniciarEsperaDesbloqueo() {
    if (!user) return
    const desde = Date.now()
    guardarProgresoCompartir(user.id, { compartidas: COMPARTIDAS_REQUERIDAS, desde })
    setEsperaDesde(desde)
  }

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return // navegador sin Web Audio API: sin música, sin romper nada

    const ctx = new AudioContextCtor()
    const masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : 1
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain
    setCtxListo(true)

    // Los navegadores (sobre todo móviles) arrancan el AudioContext
    // "suspended" hasta la primera interacción del usuario — y bloquean
    // audio.play() igual, por eso también se reintenta la lista.
    function reanudarConInteraccion() {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      if (!mutedRef.current) motorRef.current?.reintentar?.()
    }
    document.addEventListener('click', reanudarConInteraccion)
    reanudarConInteraccion()

    return () => {
      document.removeEventListener('click', reanudarConInteraccion)
      masterGainRef.current = null
      setCtxListo(false)
      ctx.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Arranca el motor elegido (lista o generativo) en su propia salida para
  // poder fundir 1s al cambiar de uno a otro.
  useEffect(() => {
    const masterGain = masterGainRef.current
    if (!ctxListo || !masterGain) return
    const ctx = masterGain.context

    const salida = ctx.createGain()
    salida.gain.value = 0
    salida.connect(masterGain)
    fundir(salida.gain, usarLista ? VOLUMEN_CANCIONES * GANANCIA_CANCIONES : VOLUMEN_GENERATIVA, TRANSICION_SEG, ctx)

    let motor
    if (usarLista) {
      motor = iniciarListaReproduccion(ctx, salida, CANCIONES, () => setFalloLista(true))
      if (mutedRef.current) motor.pausar()
    } else {
      motor = { detener: iniciarMotorGenerativo(ctx, salida) }
    }
    motorRef.current = motor

    return () => {
      if (motorRef.current === motor) motorRef.current = null
      fundir(salida.gain, 0, TRANSICION_SEG, ctx)
      setTimeout(() => {
        try {
          motor.detener()
          salida.disconnect()
        } catch { /* el contexto ya pudo haberse cerrado */ }
      }, TRANSICION_SEG * 1000 + 100)
    }
  }, [ctxListo, usarLista])

  useEffect(() => {
    const masterGain = masterGainRef.current
    if (masterGain) {
      // Saltar el volumen de golpe (.value = x) produce un "click" audible
      // porque genera una discontinuidad en la onda; una rampa corta lo
      // evita aunque solo dure unos milisegundos.
      const { context, gain } = masterGain
      const ahora = context.currentTime
      gain.cancelScheduledValues(ahora)
      gain.setValueAtTime(gain.value, ahora)
      gain.linearRampToValueAtTime(muted ? 0 : 1, ahora + RAMPA_VOLUMEN_SEG)
    }
    if (muted) motorRef.current?.pausar?.()
    else motorRef.current?.reanudar?.()
    localStorage.setItem(STORAGE_KEY, String(muted))
  }, [muted])

  function toggleMuted() {
    setMuted(m => !m)
  }

  function cambiarEnriquecida(valor) {
    setEnriquecida(valor)
    setFalloLista(false)
    localStorage.setItem(STORAGE_KEY_ENRIQUECIDA, String(valor))
  }

  return (
    <MusicContext.Provider value={{
      muted, toggleMuted, hayMusica: true,
      enriquecida: enriquecida && desbloqueada, cambiarEnriquecida, totalCanciones: CANCIONES.length,
      desbloqueada, esperandoDesbloqueo: !!esperaDesde && !desbloqueada, iniciarEsperaDesbloqueo,
    }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
