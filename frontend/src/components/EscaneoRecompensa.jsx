import { useEffect, useRef, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { triggerVibration } from '../utils/haptics'
import { HiOutlineArrowRight, HiMagnifyingGlass, HiOutlineGift } from 'react-icons/hi2'

// Minijuego de cierre de unidad: la mecánica de "barrido" del radar
// anterior (RadarMinijuego, ya borrado), pero sin puertas — en vez de
// vigilar una entidad que se acerca, cada clic en "Escanear" hace que la
// misma línea vertical cruce la pantalla UNA vez, revelando de golpe varios
// puntos de recompensa (cada uno con su propio color de rareza) que estaban
// ahí, invisibles, esperando el barrido.
//
// Reglas:
//   1. Cada punto tiene un color de rareza (gris → verde → morado → dorado
//      → rojo, cada vez más raro), y el color determina su rango de valor
//      (ver COLORES_NORMAL/COLORES_DIFICIL abajo: el color se sortea
//      primero, el valor se sortea después DENTRO del rango de ese color)
//      — ya no son sorteos independientes como en la primera versión. En
//      modo difícil se usa una tabla de pesos distinta, con dorado/rojo
//      más probables.
//   2. Hay 3 intentos de escaneo; cada uno reemplaza el resultado anterior
//      por uno nuevo (no se acumulan). El alumno reclama la suma de lo que
//      tenga revelado en pantalla, cuando guste, con "Reclamar" — si nunca
//      reclama, no se otorga nada.

const ANCHO = 300
const ALTO = 170
const INTENTOS_MAX = 3
const PUNTOS_POR_ESCANEO = 4
const DURACION_BARRIDO_MS = 1300
const RADIO_BASE = 9
const MARGEN = 26
const FONDO_MONITOR = '#062b18' // verde oscuro tipo pantalla de radar/sonar, fijo siempre (no cambia con el resultado)

// Colores de rareza: el peso se normaliza para sumar 100% (la probabilidad
// real de cada uno es la del comentario). `valorMin`/`valorMax` son el
// rango de puntos que da ese color (rojo es fijo: min = max = 40).
// Calibrados para que el promedio por escaneo sea ~mitad del de la primera
// versión (que daba ≈19.3 pts/escaneo en promedio).
const COLORES_NORMAL = [
  { id: 'gris', nombre: 'Gris', peso: 900, color: '#9ca3af', valorMin: 1, valorMax: 3 }, // 90%
  { id: 'verde', nombre: 'Verde', peso: 80, color: '#22c55e', valorMin: 3, valorMax: 5 }, // 8%
  { id: 'morado', nombre: 'Morado', peso: 15, color: '#a855f7', valorMin: 5, valorMax: 10 }, // 1.5%
  { id: 'dorado', nombre: 'Dorado', peso: 4, color: '#facc15', valorMin: 11, valorMax: 25 }, // 0.4%
  { id: 'rojo', nombre: 'Rojo', peso: 1, color: '#ef4444', valorMin: 40, valorMax: 40 }, // 0.1%
]

// Modo difícil (el rayo en MateriaCard/Leccion.jsx): mismos colores y
// mismos rangos de valor, pero con dorado/rojo varias veces más probables
// que en modo normal (4x cada uno) — el incentivo para usarlo.
const COLORES_DIFICIL = [
  { id: 'gris', nombre: 'Gris', peso: 750, color: '#9ca3af', valorMin: 1, valorMax: 3 }, // 75%
  { id: 'verde', nombre: 'Verde', peso: 180, color: '#22c55e', valorMin: 3, valorMax: 5 }, // 18%
  { id: 'morado', nombre: 'Morado', peso: 50, color: '#a855f7', valorMin: 5, valorMax: 10 }, // 5%
  { id: 'dorado', nombre: 'Dorado', peso: 16, color: '#facc15', valorMin: 11, valorMax: 25 }, // 1.6%
  { id: 'rojo', nombre: 'Rojo', peso: 4, color: '#ef4444', valorMin: 40, valorMax: 40 }, // 0.4%
]

function generarColor(colores) {
  const totalPesos = colores.reduce((a, c) => a + c.peso, 0)
  let r = Math.random() * totalPesos
  for (const c of colores) {
    r -= c.peso
    if (r < 0) return c
  }
  return colores[0]
}

function generarValorParaColor(color) {
  const rango = color.valorMax - color.valorMin + 1
  return color.valorMin + Math.floor(Math.random() * rango)
}

function generarPunto(colores) {
  const color = generarColor(colores)
  return {
    x: MARGEN + Math.random() * (ANCHO - MARGEN * 2),
    y: MARGEN + Math.random() * (ALTO - MARGEN * 2),
    puntos: generarValorParaColor(color),
    color,
    revelado: false,
    reveladoEn: null,
  }
}

export default function EscaneoRecompensa({ materiaId, unidad, colorAcento = '#7c5cbf', modoDificil = false, onContinuar }) {
  const colores = modoDificil ? COLORES_DIFICIL : COLORES_NORMAL
  const { reclamarRecompensaUnidad } = useStore()
  const canvasRef = useRef(null)
  const puntosRef = useRef([])
  const sweepXRef = useRef(0)
  const inicioBarridoRef = useRef(null)
  const rafRef = useRef(null)
  // dibujar() se invoca desde dentro de frame(), un closure creado en el
  // momento del clic en "Escanear" — si leyera el estado "fase" de React
  // directamente, se quedaría con el valor de ANTES del clic ('inactivo')
  // durante toda la animación, porque setFase('escaneando') no cambia ese
  // closure ya capturado. Un ref sí se lee "en vivo" en cada frame.
  const enBarridoRef = useRef(false)

  const [intentosUsados, setIntentosUsados] = useState(0)
  const [fase, setFase] = useState('inactivo') // 'inactivo' | 'escaneando' | 'revelado'
  const [resultado, setResultado] = useState([]) // copia final una vez revelado, para los chips + total
  const [reclamado, setReclamado] = useState(false)

  const intentosRestantes = INTENTOS_MAX - intentosUsados
  const puedeEscanear = intentosRestantes > 0 && fase !== 'escaneando' && !reclamado
  const puedeReclamar = fase === 'revelado' && !reclamado
  // "Continuar" queda bloqueado hasta reclamar de verdad: no hay forma de
  // saltarse el minijuego sin llevarse las monedas. Rehacer una unidad ya
  // completada antes sí vuelve a pagar (a pedido, se quitó ese anti-farm —
  // ver reclamarRecompensaUnidad en StoreContext.jsx).
  const puedeContinuar = reclamado
  const total = resultado.reduce((a, p) => a + p.puntos, 0)

  function dibujar(ctx, t) {
    ctx.clearRect(0, 0, ANCHO, ALTO)
    // Fondo siempre verde (pantalla de radar/sonar clásica) — fijo, no
    // cambia según lo que se revele ni según el color del punto más raro.
    ctx.fillStyle = FONDO_MONITOR
    ctx.fillRect(0, 0, ANCHO, ALTO)

    // Rejilla sutil, en un verde más claro que el fondo para que combine.
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.12)'
    ctx.lineWidth = 1
    for (let x = 0; x <= ANCHO; x += 20) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, ALTO); ctx.stroke() }
    for (let y = 0; y <= ALTO; y += 20) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(ANCHO, y + 0.5); ctx.stroke() }

    // Puntos ya revelados: aparecen con un "pop" que decae en ~300ms.
    for (const p of puntosRef.current) {
      if (!p.revelado) continue
      const edad = p.reveladoEn != null ? t - p.reveladoEn : 999
      const bump = Math.max(0, 1 - edad / 300) * 0.7
      const radio = RADIO_BASE * (1 + bump)
      ctx.beginPath()
      ctx.arc(p.x, p.y, radio, 0, Math.PI * 2)
      ctx.fillStyle = p.color.color
      ctx.shadowColor = p.color.color
      ctx.shadowBlur = 8 + bump * 14
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#04120c'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(p.puntos), p.x, p.y + 0.5)
    }

    // Línea de barrido, solo mientras está activa.
    if (enBarridoRef.current) {
      ctx.strokeStyle = colorAcento
      ctx.shadowColor = colorAcento
      ctx.shadowBlur = 8
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sweepXRef.current, 0)
      ctx.lineTo(sweepXRef.current, ALTO)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Primer escaneo automático: `escanear` de este render ve el estado
  // recién montado (fase 'inactivo', 0 intentos usados) — solo hace falta
  // una vez, por eso el array de dependencias vacío.
  useEffect(() => {
    escanear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function escanear() {
    if (!puedeEscanear) return

    puntosRef.current = Array.from({ length: PUNTOS_POR_ESCANEO }, () => generarPunto(colores))
    sweepXRef.current = 0
    inicioBarridoRef.current = null
    enBarridoRef.current = true
    setFase('escaneando')
    setReclamado(false)
    setResultado([])
    setIntentosUsados((n) => n + 1)

    const ctx = canvasRef.current.getContext('2d')

    function frame(t) {
      if (inicioBarridoRef.current == null) inicioBarridoRef.current = t
      const progreso = Math.min(1, (t - inicioBarridoRef.current) / DURACION_BARRIDO_MS)
      sweepXRef.current = progreso * ANCHO

      let huboRevelacionNueva = false
      for (const p of puntosRef.current) {
        if (!p.revelado && sweepXRef.current >= p.x) {
          p.revelado = true
          p.reveladoEn = t
          huboRevelacionNueva = true
        }
      }
      if (huboRevelacionNueva) triggerVibration('success')

      dibujar(ctx, t)

      if (progreso < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Por si algún punto quedó justo en el borde y el redondeo lo dejó
        // sin marcar, se fuerza a que termine el barrido con todo revelado.
        puntosRef.current.forEach((p) => { if (!p.revelado) { p.revelado = true; p.reveladoEn = t } })
        enBarridoRef.current = false
        dibujar(ctx, t)
        setResultado(puntosRef.current.map((p) => ({ puntos: p.puntos, color: p.color })))
        setFase('revelado')
      }
    }

    rafRef.current = requestAnimationFrame(frame)
  }

  function reclamar() {
    if (!puedeReclamar) return
    reclamarRecompensaUnidad(materiaId, unidad, total)
    setReclamado(true)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%',
      boxSizing: 'border-box', padding: '28px 20px 24px', alignItems: 'center',
      justifyContent: 'center', gap: 14, textAlign: 'center',
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
          Unidad {unidad} completada
        </p>
        <h1 style={{ margin: '4px 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>
          Escanea tu recompensa
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          {`Te quedan ${intentosRestantes} de ${INTENTOS_MAX} escaneos. Reclama cuando te guste lo que salió.`}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={ANCHO}
        height={ALTO}
        style={{ width: '100%', maxWidth: 340, borderRadius: 10, border: '2px solid var(--surface2)' }}
      />

      <div style={{ minHeight: 22, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {fase === 'revelado' && resultado.map((p, i) => (
          <span key={i} style={{
            fontSize: 11.5, fontWeight: 700, color: p.color.color,
            background: `${p.color.color}22`, padding: '3px 8px', borderRadius: 8,
          }}>
            +{p.puntos}
          </span>
        ))}
        {fase === 'revelado' && (
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>= {total} total</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 340 }}>
        <button
          type="button"
          onClick={escanear}
          disabled={!puedeEscanear}
          style={{
            flex: 1, minHeight: 52, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: puedeEscanear ? 'pointer' : 'default',
            border: '1px solid var(--surface2)',
            background: puedeEscanear ? 'var(--surface2)' : 'var(--surface)',
            color: puedeEscanear ? 'var(--text)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: puedeEscanear ? 1 : 0.6,
          }}
        >
          <HiMagnifyingGlass /> Escanear
        </button>
        <button
          type="button"
          onClick={reclamar}
          disabled={!puedeReclamar}
          style={{
            flex: 1, minHeight: 52, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: puedeReclamar ? 'pointer' : 'default',
            border: 'none',
            background: puedeReclamar ? '#22c55e' : 'var(--surface2)',
            color: puedeReclamar ? '#04140c' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: puedeReclamar ? 1 : 0.6,
            boxShadow: puedeReclamar ? '0 8px 20px -8px rgba(34,197,94,0.6)' : 'none',
          }}
        >
          <HiOutlineGift /> Reclamar
        </button>
      </div>

      {!puedeContinuar && (
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)' }}>
          Reclama tu recompensa para continuar.
        </p>
      )}

      <button
        type="button"
        onClick={onContinuar}
        disabled={!puedeContinuar}
        className="gm-cta"
        style={{
          minHeight: 44, width: '100%', maxWidth: 340, marginTop: 6, borderRadius: 14, border: 'none',
          background: puedeContinuar ? colorAcento : 'var(--surface2)',
          color: puedeContinuar ? '#fff' : 'var(--text-muted)',
          fontWeight: 700, fontSize: 14, cursor: puedeContinuar ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: puedeContinuar ? `0 10px 24px -8px ${colorAcento}80` : 'none',
          opacity: puedeContinuar ? 1 : 0.6,
        }}
      >
        Continuar <HiOutlineArrowRight />
      </button>
    </div>
  )
}
