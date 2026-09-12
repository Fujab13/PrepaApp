import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineClose } from 'react-icons/ai'
import { FaBone } from 'react-icons/fa'
import { useStore } from '../context/StoreContext'
import { MASCOTAS } from '../data/mascotas'
import PixelArt from '../components/PixelArt'
import { felicidadDe, textoTemporizador, estaHambrienta, alimentarMascota } from '../utils/mascotasEstado'
import { triggerVibration } from '../utils/haptics'

const TAMANOS = { pequeno: 5, normal: 7 }
const CLAVE_TAMANO = 'mascotas_tamano'
// Recalcula felicidad/temporizador de todas las mascotas cada 30s — de
// sobra para que el reloj sobre su cabeza se sienta "vivo" sin recalcular
// en cada frame (cuenta en minutos/horas, no tiene sentido más seguido).
const INTERVALO_RELOJ_MS = 30000

// ── Profundidad ──────────────────────────────────────────────────────────
// El sandbox no es una sola línea horizontal: cada mascota también tiene
// una posición Y que representa "qué tan lejos" está (0 = al fondo, cerca
// del horizonte; 100 = al frente, cerca de quien mira). Esa misma Y decide
// su escala (más lejos = más chica) y su z-index (más cerca tapa a lo que
// está más lejos).
const Y_MIN = 22
const Y_MAX = 92
const ESCALA_MIN = 0.5
const ESCALA_MAX = 1.35

function escalaPorProfundidad(y) {
  const t = (y - Y_MIN) / (Y_MAX - Y_MIN)
  return ESCALA_MIN + t * (ESCALA_MAX - ESCALA_MIN)
}

function zIndexPorProfundidad(y) {
  return Math.round(y * 10)
}

export default function Mascota() {
  const navigate = useNavigate()
  const { ownsItem, comida, consumirComida } = useStore()

  const [tamano, setTamano] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_TAMANO)
      return guardado === 'pequeno' || guardado === 'normal' ? guardado : 'normal'
    } catch {
      return 'normal'
    }
  })

  useEffect(() => {
    try { localStorage.setItem(CLAVE_TAMANO, tamano) } catch { /* sin localStorage, la preferencia no persiste */ }
  }, [tamano])

  const [mensaje, setMensaje] = useState(null)

  // Fuerza a recalcular felicidad/temporizador de cada mascota cada
  // INTERVALO_RELOJ_MS (ver más abajo, donde se leen fresco en cada render).
  const [, setReloj] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setReloj(n => n + 1), INTERVALO_RELOJ_MS)
    return () => clearInterval(id)
  }, [])

  const propias = MASCOTAS.filter(m => ownsItem(`mascota-${m.id}`))

  function mostrarMensaje(texto) {
    setMensaje(texto)
    setTimeout(() => setMensaje(null), 2400)
  }

  function alimentar(mascotaId) {
    if (!consumirComida()) {
      mostrarMensaje('No te queda comida — cómprala en la Tienda 🦴')
      return
    }
    alimentarMascota(mascotaId)
    setReloj(n => n + 1) // refresca felicidad/temporizador de inmediato, sin esperar el próximo tick
    triggerVibration('success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="page-topbar-compact" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate(-1)} className="page-topbar-btn" title="Salir">
          <AiOutlineClose />
        </button>
        <h1 className="page-topbar-title">Mi Mascota</h1>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)',
        }}>
          <FaBone /> {comida}
        </div>
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Tamaño: puramente de presentación, para quien prefiera mascotas
            más discretas — se combina con (no reemplaza a) el efecto de
            profundidad del sandbox. */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {Object.keys(TAMANOS).map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setTamano(id)}
              style={{
                minHeight: 30, padding: '5px 12px', borderRadius: 8, border: 'none',
                background: tamano === id ? 'var(--surface2)' : 'transparent',
                color: tamano === id ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {id === 'pequeno' ? 'Pequeño' : 'Normal'}
            </button>
          ))}
        </div>

        {/* El sandbox: un "entorno virtual" fijo (no las variables de tema —
            es la ambientación propia de este minijuego, como el "neón" de
            Inventario.jsx) — un plano cartesiano en 3D: cielo plano arriba,
            piso de cuadrícula con perspectiva abajo (rotateX + perspective,
            el mismo truco de los "grid floor" retro), con la línea de
            horizonte justo donde arranca la banda de profundidad de las
            mascotas (Y_MIN). Bastante más alto que antes para que quepa el
            efecto de profundidad (Y_MIN..Y_MAX). */}
        <div style={{
          position: 'relative',
          height: 380,
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(94, 234, 212, 0.35)',
          backgroundColor: '#0b0f1a',
        }}>
          {/* Cielo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: `${Y_MIN}%`,
            background: 'linear-gradient(180deg, #0b0f1a 0%, #101a2c 100%)',
          }} />

          {/* Horizonte: línea + resplandor, justo donde el cielo se convierte en piso */}
          <div style={{
            position: 'absolute', top: `${Y_MIN}%`, left: 0, right: 0, height: 2,
            background: 'rgba(94, 234, 212, 0.6)', boxShadow: '0 0 18px 3px rgba(94, 234, 212, 0.45)',
          }} />

          {/* Piso: plano cartesiano con perspectiva real (rotateX), no una
              cuadrícula plana — así sí se ve "en 3D" y no solo dibujada. */}
          <div style={{
            position: 'absolute', top: `${Y_MIN}%`, left: 0, right: 0, bottom: 0,
            overflow: 'hidden', perspective: '340px', perspectiveOrigin: '50% 0%',
          }}>
            <div className="mascota-piso" style={{
              position: 'absolute', top: 0, left: '-50%', width: '200%', height: '340%',
              backgroundImage:
                'linear-gradient(rgba(94, 234, 212, 0.4) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(94, 234, 212, 0.4) 1px, transparent 1px)',
              backgroundSize: '34px 34px',
              transform: 'rotateX(62deg)',
              transformOrigin: 'top',
            }} />
          </div>

          {propias.length === 0 ? (
            <p style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '0 32px', color: 'rgba(197, 240, 232, 0.7)', fontSize: 13, margin: 0, zIndex: 999,
            }}>
              Aún no tienes mascotas. Consíguelas aquí abajo.
            </p>
          ) : (
            propias.map(m => (
              <MascotaViva
                key={m.id}
                mascota={m}
                tamanoPx={TAMANOS[tamano]}
                felicidad={felicidadDe(m.id)}
                textoReloj={textoTemporizador(m.id)}
                hambrienta={estaHambrienta(m.id)}
                onTap={alimentar}
              />
            ))
          )}
        </div>

        <p style={{
          textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', margin: 0,
          minHeight: 16, opacity: mensaje ? 1 : 0, transition: 'opacity 0.2s ease',
        }}>
          {mensaje || '.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
          }}>
            Tu colección
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {MASCOTAS.map(m => {
              const tuya = ownsItem(`mascota-${m.id}`)
              const paletaMostrada = tuya
                ? m.paleta
                : Object.fromEntries(Object.keys(m.paleta).map(c => [c, 'currentColor']))

              return (
                <div key={m.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: 'var(--surface2)', borderRadius: 14, padding: '12px 6px',
                  opacity: tuya ? 1 : 0.55,
                }}>
                  <PixelArt grid={m.grid} paleta={paletaMostrada} size={4} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)' }}>{m.nombre}</span>
                  {tuya ? (
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      Felicidad {felicidadDe(m.id)}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/tienda')}
                      className="btn-footer-scroll"
                      style={{ fontSize: 10.5, padding: '8px 6px', minHeight: 36, width: '100%' }}
                    >
                      {m.precioCoins === 0 ? 'Gratis' : `${m.precioCoins} monedas`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Una mascota "viva" dentro del sandbox: deambula sola en X e Y (Y = qué
// tan lejos está — decide su escala y su z-index, ver escalaPorProfundidad/
// zIndexPorProfundidad) y se balancea sin parar — nada de esto depende de
// que la toquen, es puro ambiente. Sin emojis: la única señal sobre su
// cabeza es el temporizador en texto (ver textoReloj). Tocarla la alimenta
// (ver onTap). Si `hambrienta`, tiembla cada tanto (mascota-danio) para que
// el descuido se note de verdad, no solo en un número.
function MascotaViva({ mascota, tamanoPx, felicidad, textoReloj, hambrienta, onTap }) {
  const [x, setX] = useState(() => 15 + Math.random() * 70)
  const [y, setY] = useState(() => Y_MIN + Math.random() * (Y_MAX - Y_MIN))
  const [mirandoIzq, setMirandoIzq] = useState(false)
  const [danioActivo, setDanioActivo] = useState(false)

  const montadoRef = useRef(true)
  const timeoutRef = useRef(null)
  // Desincroniza el balanceo entre mascotas (si no, se mecen exactamente
  // igual y se ve artificial) — un valor fijo por instancia.
  const retrasoBalanceoRef = useRef(Math.random() * -3.6)

  useEffect(() => {
    montadoRef.current = true

    function programarSiguientePaso() {
      const espera = 2800 + Math.random() * 3200
      timeoutRef.current = setTimeout(() => {
        if (!montadoRef.current) return

        setX(previo => {
          const destino = Math.max(6, Math.min(94, previo + (Math.random() * 36 - 18)))
          setMirandoIzq(destino < previo)
          return destino
        })
        setY(Y_MIN + Math.random() * (Y_MAX - Y_MIN))

        programarSiguientePaso()
      }, espera)
    }

    programarSiguientePaso()
    return () => { montadoRef.current = false; clearTimeout(timeoutRef.current) }
  }, [])

  // "Recibir daño": mientras esté hambrienta, un temblor corto cada 5s.
  useEffect(() => {
    if (!hambrienta) return
    const id = setInterval(() => {
      setDanioActivo(true)
      setTimeout(() => setDanioActivo(false), 500)
    }, 5000)
    return () => clearInterval(id)
  }, [hambrienta])

  const duracionRebote = felicidad >= 60 ? '0.8s' : felicidad >= 30 ? '1.3s' : '2s'

  return (
    <button
      type="button"
      onClick={() => onTap(mascota.id)}
      title={mascota.frase}
      style={{
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        transform: `translate(-50%, -50%) scale(${escalaPorProfundidad(y)})`,
        transition: 'left 2.4s ease-in-out, top 2.4s ease-in-out, transform 2.4s ease-in-out',
        zIndex: zIndexPorProfundidad(y),
        background: 'transparent',
        border: 'none',
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 700, lineHeight: 1.2,
        color: hambrienta ? 'var(--wrong)' : 'rgba(197, 240, 232, 0.85)',
      }}>
        {textoReloj}
      </span>
      <span
        className={danioActivo ? 'mascota-danio' : 'mascota-balanceo'}
        style={!danioActivo ? { animationDelay: `${retrasoBalanceoRef.current}s` } : undefined}
      >
        <span style={{ display: 'inline-block', animation: `mascota-rebote ${duracionRebote} ease-in-out infinite` }}>
          <PixelArt grid={mascota.grid} paleta={mascota.paleta} size={tamanoPx} flip={mirandoIzq} />
        </span>
      </span>
    </button>
  )
}
