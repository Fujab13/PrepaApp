import { createContext, useContext, useEffect, useRef, useState } from 'react'

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
const VOLUMEN_OBJETIVO = 0.077 // bajo a propósito: es música DE FONDO, no debe competir con el contenido
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

  filtro.connect(secoGain)
  filtro.connect(reverb)
  reverb.connect(reverbGain)
  secoGain.connect(limitador)
  reverbGain.connect(limitador)
  limitador.connect(masterGain)

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
    osciladoresDrone.forEach((o) => {
      try { o.stop() } catch { /* ya pudo haber terminado sola */ }
    })
    vocesActivas.forEach((o) => {
      try { o.stop() } catch { /* ya pudo haber terminado sola */ }
    })
  }
}

export function MusicProvider({ children }) {
  const [muted, setMuted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')
  const masterGainRef = useRef(null)

  useEffect(() => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return // navegador sin Web Audio API: sin música, sin romper nada

    const ctx = new AudioContextCtor()
    const masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : VOLUMEN_OBJETIVO
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    const detenerMotor = iniciarMotorGenerativo(ctx, masterGain)

    // Los navegadores (sobre todo móviles) arrancan el AudioContext
    // "suspended" hasta la primera interacción del usuario.
    function reanudarConInteraccion() {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    }
    document.addEventListener('click', reanudarConInteraccion)
    reanudarConInteraccion()

    return () => {
      document.removeEventListener('click', reanudarConInteraccion)
      detenerMotor()
      masterGainRef.current = null
      ctx.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      gain.linearRampToValueAtTime(muted ? 0 : VOLUMEN_OBJETIVO, ahora + RAMPA_VOLUMEN_SEG)
    }
    localStorage.setItem(STORAGE_KEY, String(muted))
  }, [muted])

  function toggleMuted() {
    setMuted(m => !m)
  }

  return (
    <MusicContext.Provider value={{ muted, toggleMuted, hayMusica: true }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
