import { createContext, useContext, useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────
// EXPERIMENTO TEMPORAL: música ambiente generada en vivo con Web Audio API
// en vez de la pista .mp3 de ~41MB/1h en public/music. La idea es que un
// .mp3 de esa duración se tiene que descargar/bufferear por completo (o en
// buena parte) en algunos navegadores móviles, lo que presiona memoria; un
// sintetizador nunca carga un archivo — genera tonos con osciladores en
// tiempo real, así que no hay nada que descargar ni "duración" que
// bufferear (suena indefinidamente sin repetirse literal).
//
// El archivo .mp3 y MUSIC_TRACKS (data/musicTracks.js) siguen intactos a
// propósito — este es un intercambio de A/B, no un reemplazo definitivo.
// Para volver a la pista real, se revierte este archivo nada más.
//
// Diseño del generador: unas "voces" (osciladores) van entrando y saliendo
// con envolventes lentas (varios segundos de fade in/out) tocando notas de
// una escala pentatónica mayor (ningún intervalo sale disonante sin
// importar qué combinación de notas suene a la vez — por eso se eligió esa
// escala), pasadas por un filtro paso-bajas con una LFO lenta para que el
// timbre respire un poco, más una reverberación corta generada con ruido
// (sin archivo de impulso externo) para darle sensación de espacio.
// ─────────────────────────────────────────────────────────────────────────

const MusicContext = createContext(null)

const STORAGE_KEY = 'musica_silenciada'
const VOLUMEN_OBJETIVO = 0.22 // varias voces sonando a la vez suman más que 1 pista sola

// Escala pentatónica mayor de Do, dos octavas (Hz) — cualquier subconjunto
// de estas notas suena bien junto, que es lo que hace posible generar
// música "al azar" sin que nunca choque.
const ESCALA_HZ = [
  130.81, 146.83, 164.81, 196.0, 220.0,      // Do3 Re3 Mi3 Sol3 La3
  261.63, 293.66, 329.63, 392.0, 440.0,      // Do4 Re4 Mi4 Sol4 La4
]

function crearImpulsoReverb(ctx, duracionSeg = 2.2) {
  const muestras = Math.floor(ctx.sampleRate * duracionSeg)
  const buffer = ctx.createBuffer(2, muestras, ctx.sampleRate)
  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal)
    for (let i = 0; i < muestras; i++) {
      // Ruido blanco con caída exponencial: un impulso de reverb "de
      // sala" simple, sin necesitar un archivo .wav de impulso real.
      datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / muestras, 2.5)
    }
  }
  return buffer
}

// Une los nodos compartidos (filtro + reverb + master) y arranca el ciclo
// de voces. Regresa una función para detener todo y liberar el contexto.
function iniciarMotorGenerativo(ctx, masterGain) {
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 1800
  filtro.Q.value = 0.3

  // LFO lenta sobre el corte del filtro: le da un "respiro" al timbre en
  // vez de sonar como un tono estático todo el tiempo.
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.03 // un ciclo completo cada ~33s
  lfoGain.gain.value = 500
  lfo.connect(lfoGain)
  lfoGain.connect(filtro.frequency)
  lfo.start()

  const reverb = ctx.createConvolver()
  reverb.buffer = crearImpulsoReverb(ctx)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.35
  const secoGain = ctx.createGain()
  secoGain.gain.value = 0.8

  filtro.connect(secoGain)
  filtro.connect(reverb)
  reverb.connect(reverbGain)
  secoGain.connect(masterGain)
  reverbGain.connect(masterGain)

  let activo = true
  const timeouts = []
  const vocesActivas = []

  function tocarVoz() {
    if (!activo) return

    const frecuenciaBase = ESCALA_HZ[Math.floor(Math.random() * ESCALA_HZ.length)]
    const ahora = ctx.currentTime
    const attack = 4 + Math.random() * 4   // 4-8s
    const sostenido = 6 + Math.random() * 6 // 6-12s
    const release = 5 + Math.random() * 5   // 5-10s
    const duracionTotal = attack + sostenido + release
    const picoGanancia = 0.09 + Math.random() * 0.05

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ahora)
    gain.gain.linearRampToValueAtTime(picoGanancia, ahora + attack)
    gain.gain.setValueAtTime(picoGanancia, ahora + attack + sostenido)
    gain.gain.linearRampToValueAtTime(0, ahora + duracionTotal)
    gain.connect(filtro)

    // Dos osciladores muy ligeramente desafinados entre sí: el "batido"
    // resultante es lo que le da ese carácter cálido de pad ambiental en
    // vez de sonar como un tono de prueba.
    const osciladores = [0, 4].map((detuneCents) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = frecuenciaBase
      osc.detune.value = detuneCents
      osc.connect(gain)
      osc.start(ahora)
      osc.stop(ahora + duracionTotal + 0.5)
      return osc
    })

    vocesActivas.push(...osciladores)
    osciladores[0].addEventListener('ended', () => {
      gain.disconnect()
      osciladores.forEach((o) => o.disconnect())
    })

    // La siguiente voz entra mientras esta todavía está sonando (se
    // traslapan), para que nunca haya un silencio total entre notas.
    const proximaEn = attack + sostenido * (0.3 + Math.random() * 0.5)
    timeouts.push(setTimeout(tocarVoz, proximaEn * 1000))
  }

  tocarVoz()
  // Una segunda voz arrancando poco después para que desde el inicio ya
  // se sienta como un acorde y no como una nota sola.
  timeouts.push(setTimeout(tocarVoz, 3000))

  return function detener() {
    activo = false
    timeouts.forEach(clearTimeout)
    lfo.stop()
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
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = muted ? 0 : VOLUMEN_OBJETIVO
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
