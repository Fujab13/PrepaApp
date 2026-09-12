import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiOutlineClose } from 'react-icons/ai'
import { FaHamburger, FaTrash, FaStar, FaRegStar } from 'react-icons/fa'
import { useStore } from '../context/StoreContext'
import { MASCOTAS, paletaSilueta } from '../data/mascotas'
import PixelArt from '../components/PixelArt'
import ConfirmDialog from '../components/ConfirmDialog'
import { felicidadDe, textoEdad, estaHambrienta, alimentarMascota, olvidarMascota, activarImpulso } from '../utils/mascotasEstado'
import { triggerVibration } from '../utils/haptics'

// Tamaño de sprite fijo (antes elegible entre Micro/Diminuto vía botones,
// ahora siempre "micro" — ver historial si hace falta recuperar el toggle).
// 25% más chico que el "micro" original (era 3).
const TAMANO_PX = 2.25
// Recalcula felicidad/temporizador de todas las mascotas cada 30s — de
// sobra para que el reloj sobre su cabeza se sienta "vivo" sin recalcular
// en cada frame (cuenta en minutos/horas, no tiene sentido más seguido).
const INTERVALO_RELOJ_MS = 30000
// Referencia estable (ver PixelArt.jsx: memo) — un objeto literal inline en
// el JSX de abajo se recrearía en cada render y anularía la memoización.
const ESTILO_SPRITE_COLECCION = { maxWidth: '100%', height: 'auto', color: 'var(--text-muted)' }
// Toques rápidos seguidos: puramente un chiste visual (mismo temblor que ya
// existe para "hambrienta" — ver `danioActivo` en MascotaViva), no afecta
// felicidad/hambre ni nada real. VENTANA_TOQUES_MS es cuánto se le da al
// usuario entre un toque y el siguiente para que sigan contando como parte
// de la misma racha.
const TOQUES_PARA_DANIO = 3
const VENTANA_TOQUES_MS = 600
const DURACION_DANIO_TOQUES_MS = 500

// ── Profundidad ──────────────────────────────────────────────────────────
// El sandbox no es una sola línea horizontal: cada mascota también tiene
// una posición Y que representa "qué tan lejos" está (0 = al fondo, cerca
// del horizonte; 100 = al frente, cerca de quien mira). Esa misma Y decide
// su escala (más lejos = más chica) y su z-index (más cerca tapa a lo que
// está más lejos).
const X_MIN = 6
const X_MAX = 94
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

function clamp(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor))
}

// ── Física del sandbox ──────────────────────────────────────────────────
// Cada mascota es un cuerpo con posición y velocidad continuas (en píxeles
// reales del contenedor, no en el % que se usa para pintarla) que un único
// loop de animación en Mascota.jsx actualiza en cada frame: avanza según su
// velocidad, rebota al tocar los bordes del sandbox y, contra las demás
// mascotas, resuelve una colisión elástica de masas iguales (círculo contra
// círculo, radio según el tamaño real del sprite ya escalado por
// profundidad) — se separan sin pisarse y salen despedidas en direcciones
// opuestas, en vez de solo "detectarse cerca" cada tanto.
const VELOCIDAD_MIN = 10.5 // px/s (25% más lento que antes, era 14)
const VELOCIDAD_MAX = 22.5 // px/s (25% más lento que antes, era 30)
const GIRO_MAX = 1.4 // rad/s de deriva aleatoria del rumbo, para que el paseo no sea una línea recta perfecta
const FACTOR_COLISION = 0.55 // fracción del tamaño del sprite que cuenta como "cuerpo" sólido (deja algo de aire libre entre el dibujo y el borde real del hitbox)
const COOLDOWN_PELEA_MS = 8000 // por pareja: evita que un roce sostenido dispare mensaje/vibración una y otra vez
const DURACION_PELEA_MS = 900
const PROBABILIDAD_PELEA = 0.008 // la enorme mayoría de los choques son solo un rebote — menos del 1% termina en pelea de verdad

// ── Botón "Alimentar" ────────────────────────────────────────────────────
// Un solo bocado cae del cielo y toda la manada corre hacia el punto donde
// cayó — la comida en sí se otorga al caer (no hace falta esperar a que
// cada una llegue: una tortuga lenta igual pagó su ración), esto solo hace
// que la física las dirija hacia ahí un rato en vez de dejarlas deambular.
const DURACION_CAIDA_MS = 650
const DURACION_CORRER_MS = 6000 // se tardan en comer — antes eran 2400ms y desaparecía la comida casi al instante
const FACTOR_CORRIENDO = 1.25 // apenas más rápido que su paso normal, ya no un sprint (antes 1.8)
const GIRO_CORRIENDO_MAX = 3.4 // rad/s — gira mucho más decidido que la deriva normal (GIRO_MAX) para enfilar derecho

function nuevoCuerpo(mascota, anchoPx, altoPx) {
  // `ritmo` (ver data/mascotas.js: atributos.ritmo) escala el rango de
  // velocidad de esta especie en particular — así una tortuga pasea mucho
  // más lento que un caballo sin que la física deje de ser la misma para
  // todas (mismo modelo, solo un multiplicador distinto por cuerpo).
  const ritmo = mascota.atributos?.ritmo ?? 1
  return {
    id: mascota.id,
    ritmo,
    xPx: (X_MIN + Math.random() * (X_MAX - X_MIN)) / 100 * anchoPx,
    yPx: (Y_MIN + Math.random() * (Y_MAX - Y_MIN)) / 100 * altoPx,
    angulo: Math.random() * Math.PI * 2,
    velocidad: (VELOCIDAD_MIN + Math.random() * (VELOCIDAD_MAX - VELOCIDAD_MIN)) * ritmo,
    radioPx: 0,
  }
}

export default function Mascota() {
  const navigate = useNavigate()
  const { ownsItem, comida, consumirComida, removeInventoryItem, mascotaSeleccionada, seleccionarMascota } = useStore()

  const [mensaje, setMensaje] = useState(null)
  const ocultarMensajeRef = useRef(null)
  const mostrarMensaje = useCallback(texto => {
    setMensaje(texto)
    clearTimeout(ocultarMensajeRef.current)
    ocultarMensajeRef.current = setTimeout(() => setMensaje(null), 2400)
  }, [])

  // Fuerza a recalcular felicidad/temporizador de cada mascota cada
  // INTERVALO_RELOJ_MS (ver más abajo, donde se leen fresco en cada render).
  const [, setReloj] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setReloj(n => n + 1), INTERVALO_RELOJ_MS)
    return () => clearInterval(id)
  }, [])

  const propias = MASCOTAS.filter(m => ownsItem(`mascota-${m.id}`))

  // Devuelve si de verdad la alimentó (false = no había comida) — MascotaViva
  // lo usa para decidir si dispara su flash verde (ver más abajo, `alimentando`).
  function alimentar(mascotaId) {
    if (!consumirComida()) {
      mostrarMensaje('No te queda comida — cómprala en la Tienda 🍔')
      return false
    }
    alimentarMascota(mascotaId)
    activarImpulso(mascotaId)
    setReloj(n => n + 1) // refresca felicidad/temporizador de inmediato, sin esperar el próximo tick
    triggerVibration('success')
    return true
  }

  // Eliminar una mascota de la colección: pide confirmación primero (no
  // devuelve las monedas si se compró, así que un toque accidental no debe
  // poder borrarla sin más) — `mascotaAEliminar` guarda cuál mientras el
  // diálogo está abierto.
  const [mascotaAEliminar, setMascotaAEliminar] = useState(null)

  function confirmarEliminar() {
    if (!mascotaAEliminar) return
    removeInventoryItem(`mascota-${mascotaAEliminar.id}`)
    olvidarMascota(mascotaAEliminar.id)
    // Si era la compañera activa, no puede seguir siéndolo.
    if (mascotaSeleccionada === mascotaAEliminar.id) seleccionarMascota(mascotaAEliminar.id)
    mostrarMensaje(`${mascotaAEliminar.nombre} salió de tu colección.`)
    setMascotaAEliminar(null)
  }

  // Comida que cae del cielo para toda la manada (botón "Alimentar" del
  // sandbox) — `comidaCayendo` solo controla el dibujo (posición + fase
  // caída/aterrizada), `comidaObjetivoRef` es lo que de verdad lee el loop
  // de física en cada frame para dirigir a las mascotas hacia ahí (ver más
  // abajo). Separados porque el loop no puede depender de React state sin
  // reiniciarse en cada cambio.
  const [comidaCayendo, setComidaCayendo] = useState(null)
  const comidaObjetivoRef = useRef(null)

  function alimentarATodos() {
    if (propias.length === 0) return
    if (!consumirComida(propias.length)) {
      mostrarMensaje(`Te falta comida para toda la manada — necesitas ${propias.length} 🍔`)
      return
    }

    const xPercent = X_MIN + 18 + Math.random() * (X_MAX - X_MIN - 36)
    const yPercent = Y_MIN + 22 + Math.random() * (Y_MAX - Y_MIN - 34)
    setComidaCayendo({ xPercent, yPercent })

    setTimeout(() => {
      propias.forEach(m => { alimentarMascota(m.id); activarImpulso(m.id) })
      setReloj(n => n + 1)
      triggerVibration('celebracion')
      mostrarMensaje('¡Toda la manada corrió a comer!')
      comidaObjetivoRef.current = { xPercent, yPercent, hasta: Date.now() + DURACION_CORRER_MS }
      setTimeout(() => setComidaCayendo(null), DURACION_CORRER_MS)
    }, DURACION_CAIDA_MS)
  }

  const sandboxRef = useRef(null)
  // Una entrada por mascota propia, puesta por el callback ref de abajo —
  // el loop de física llama a `actualizarPosicion` en cada frame en vez de
  // pasar por React state, así decenas de actualizaciones por segundo no
  // disparan un re-render de toda la lista.
  const refsMascotasRef = useRef({})
  // Un callback ref por id, cacheado — pasarle a `ref` una función nueva en
  // cada render (`el => {...}`) hace que React la trate como "cambió" y
  // llame primero con null y luego con el elemento de nuevo en cada
  // re-render del padre (reloj de felicidad, mensajes, peleas...), aunque
  // el valor que termina guardando sea el mismo.
  const refCallbacksRef = useRef({})
  function obtenerRefCallback(id) {
    if (!refCallbacksRef.current[id]) {
      refCallbacksRef.current[id] = el => { refsMascotasRef.current[id] = el }
    }
    return refCallbacksRef.current[id]
  }
  const cooldownPeleaRef = useRef({})
  const [peleando, setPeleando] = useState(() => new Set())

  function marcarPelea(idA, idB, nombreA, nombreB) {
    setPeleando(previo => {
      const siguiente = new Set(previo)
      siguiente.add(idA)
      siguiente.add(idB)
      return siguiente
    })
    triggerVibration('error')
    mostrarMensaje(`¡${nombreA} y ${nombreB} chocaron y se pusieron a pelear!`)
    setTimeout(() => {
      setPeleando(previo => {
        const siguiente = new Set(previo)
        siguiente.delete(idA)
        siguiente.delete(idB)
        return siguiente
      })
    }, DURACION_PELEA_MS)
  }

  // Clave estable: solo cambia cuando de verdad cambia el conjunto de
  // mascotas propias (comprar una nueva), no en cada render — así el efecto
  // de abajo no reinicia el loop de física por cosas que no le importan
  // (mensaje, tamaño, reloj de felicidad, etc.).
  const clavePropias = propias.map(m => m.id).join(',')

  useEffect(() => {
    const contenedor = sandboxRef.current
    if (!contenedor || propias.length === 0) return

    const rectInicial = contenedor.getBoundingClientRect()
    const dim = { w: rectInicial.width || 320, h: rectInicial.height || 380 }
    const ro = new ResizeObserver(entradas => {
      const rect = entradas[0].contentRect
      dim.w = rect.width
      dim.h = rect.height
    })
    ro.observe(contenedor)

    const cuerpos = propias.map(m => nuevoCuerpo(m, dim.w, dim.h))
    const porId = new Map(propias.map(m => [m.id, m]))

    let ultimoTs = null
    let rafId = requestAnimationFrame(paso)

    function paso(ts) {
      const dt = ultimoTs == null ? 0 : Math.min((ts - ultimoTs) / 1000, 0.05)
      ultimoTs = ts
      const ahora = Date.now()

      const xMinPx = (X_MIN / 100) * dim.w
      const xMaxPx = (X_MAX / 100) * dim.w
      const yMinPx = (Y_MIN / 100) * dim.h
      const yMaxPx = (Y_MAX / 100) * dim.h

      // Límites dinámicos por cuerpo: parten de los bordes generales del
      // sandbox pero se recortan por su propio medio-ancho/alto en pantalla
      // — así su silueta completa, no solo su punto central, se queda
      // siempre dentro del marco visible (mobile-first de verdad: en una
      // pantalla angosta o con una mascota grande cerca de cámara, el
      // margen fijo en % no alcanza y la mitad del sprite queda cortada por
      // el overflow:hidden). Si el sprite es más grande que el propio
      // sandbox, converge al centro en vez de dar límites invertidos.
      function limiteX(medioAncho) {
        return [Math.min(xMinPx + medioAncho, dim.w / 2), Math.max(xMaxPx - medioAncho, dim.w / 2)]
      }
      function limiteY(medioAlto) {
        return [Math.min(yMinPx + medioAlto, dim.h / 2), Math.max(yMaxPx - medioAlto, dim.h / 2)]
      }

      // Objetivo activo del botón "Alimentar" (ver alimentarATodos): mientras
      // dure, todas dejan de deambular al azar y enfilan derecho hacia el
      // punto donde cayó la comida — se limpia solo al vencer.
      let objetivo = comidaObjetivoRef.current
      if (objetivo && ahora >= objetivo.hasta) {
        comidaObjetivoRef.current = null
        objetivo = null
      }
      const metaXpx = objetivo ? (objetivo.xPercent / 100) * dim.w : 0
      const metaYpx = objetivo ? (objetivo.yPercent / 100) * dim.h : 0

      // 1) Avanza a cada una según su rumbo/velocidad y rebota en los bordes.
      for (const cuerpo of cuerpos) {
        const mascota = porId.get(cuerpo.id)
        const columnas = mascota.grid[0]?.length || 1
        const filas = mascota.grid.length
        // Escala del frame anterior (un frame de retraso, imperceptible) —
        // la necesitamos ANTES de mover para saber cuánto mide de verdad
        // esta mascota en pantalla ahora mismo y reservarle margen dinámico
        // (ver medioAncho/medioAlto abajo): un móvil angosto o una mascota
        // grande (vaca, caballo) cerca de cámara (escala grande) necesitan
        // más aire que uno chico, si no la mitad del sprite queda cortada
        // por el overflow:hidden del sandbox — mobile-first de verdad
        // significa que ningún contenedor de mascota se salga del marco.
        const escalaPrevia = escalaPorProfundidad((cuerpo.yPx / dim.h) * 100)
        cuerpo.medioAncho = (columnas * TAMANO_PX * escalaPrevia) / 2
        cuerpo.medioAlto = (filas * TAMANO_PX * escalaPrevia) / 2

        let velocidadEfectiva = cuerpo.velocidad

        if (objetivo) {
          const anguloDeseado = Math.atan2(metaYpx - cuerpo.yPx, metaXpx - cuerpo.xPx)
          let diff = anguloDeseado - cuerpo.angulo
          diff = Math.atan2(Math.sin(diff), Math.cos(diff)) // normaliza a [-π, π]
          cuerpo.angulo += clamp(diff, -GIRO_CORRIENDO_MAX * dt, GIRO_CORRIENDO_MAX * dt)
          velocidadEfectiva = cuerpo.velocidad * FACTOR_CORRIENDO
        }

        let vx = Math.cos(cuerpo.angulo) * velocidadEfectiva
        let vy = Math.sin(cuerpo.angulo) * velocidadEfectiva

        let nx = cuerpo.xPx + vx * dt
        let ny = cuerpo.yPx + vy * dt

        const [xMinBody, xMaxBody] = limiteX(cuerpo.medioAncho)
        const [yMinBody, yMaxBody] = limiteY(cuerpo.medioAlto)

        if (nx < xMinBody) { nx = xMinBody; vx = Math.abs(vx) }
        else if (nx > xMaxBody) { nx = xMaxBody; vx = -Math.abs(vx) }
        if (ny < yMinBody) { ny = yMinBody; vy = Math.abs(vy) }
        else if (ny > yMaxBody) { ny = yMaxBody; vy = -Math.abs(vy) }

        cuerpo.xPx = nx
        cuerpo.yPx = ny
        if (!objetivo) {
          // Deriva aleatoria del rumbo: mantiene el paseo orgánico en vez de
          // que cada rebote deje una trayectoria perfectamente recta. Se
          // omite mientras corren a comer — ahí el rumbo ya lo decide el
          // giro hacia la meta de arriba, no hace falta desviarlo más.
          cuerpo.angulo = Math.atan2(vy, vx) + (Math.random() - 0.5) * GIRO_MAX * dt
        }

        const yPercent = (cuerpo.yPx / dim.h) * 100
        cuerpo.radioPx = Math.max(columnas, filas) * TAMANO_PX * escalaPorProfundidad(yPercent) * FACTOR_COLISION
      }

      // 2) Colisiones entre parejas: separa y refleja velocidades (elástico,
      // masas iguales → se intercambia la componente normal de velocidad).
      // El rebote físico pasa SIEMPRE que se tocan — eso es lo realista.
      // El aviso de "pelea" (tinte rojo, vibración, mensaje) es aparte y
      // deliberadamente raro (PROBABILIDAD_PELEA, <1% de los choques): la
      // inmensa mayoría de los encontronazos son solo tráfico, no un pleito.
      for (let i = 0; i < cuerpos.length; i++) {
        for (let j = i + 1; j < cuerpos.length; j++) {
          const a = cuerpos[i]
          const b = cuerpos[j]
          const dx = b.xPx - a.xPx
          const dy = b.yPx - a.yPx
          const dist = Math.hypot(dx, dy) || 0.0001
          const minDist = a.radioPx + b.radioPx
          if (dist >= minDist) continue

          const nx = dx / dist
          const ny = dy / dist
          const overlap = minDist - dist
          const [aXMin, aXMax] = limiteX(a.medioAncho)
          const [aYMin, aYMax] = limiteY(a.medioAlto)
          const [bXMin, bXMax] = limiteX(b.medioAncho)
          const [bYMin, bYMax] = limiteY(b.medioAlto)
          a.xPx = clamp(a.xPx - nx * overlap / 2, aXMin, aXMax)
          a.yPx = clamp(a.yPx - ny * overlap / 2, aYMin, aYMax)
          b.xPx = clamp(b.xPx + nx * overlap / 2, bXMin, bXMax)
          b.yPx = clamp(b.yPx + ny * overlap / 2, bYMin, bYMax)

          let avx = Math.cos(a.angulo) * a.velocidad
          let avy = Math.sin(a.angulo) * a.velocidad
          let bvx = Math.cos(b.angulo) * b.velocidad
          let bvy = Math.sin(b.angulo) * b.velocidad
          const an = avx * nx + avy * ny
          const bn = bvx * nx + bvy * ny
          avx += (bn - an) * nx
          avy += (bn - an) * ny
          bvx += (an - bn) * nx
          bvy += (an - bn) * ny

          a.angulo = Math.atan2(avy, avx)
          a.velocidad = clamp(Math.hypot(avx, avy), VELOCIDAD_MIN * a.ritmo, VELOCIDAD_MAX * a.ritmo)
          b.angulo = Math.atan2(bvy, bvx)
          b.velocidad = clamp(Math.hypot(bvx, bvy), VELOCIDAD_MIN * b.ritmo, VELOCIDAD_MAX * b.ritmo)

          const claveCooldown = [a.id, b.id].sort().join('|')
          const fueraDeCooldown = ahora - (cooldownPeleaRef.current[claveCooldown] || 0) >= COOLDOWN_PELEA_MS
          if (fueraDeCooldown && Math.random() < PROBABILIDAD_PELEA) {
            cooldownPeleaRef.current[claveCooldown] = ahora
            marcarPelea(a.id, b.id, porId.get(a.id).nombre, porId.get(b.id).nombre)
          }
        }
      }

      // 3) Pinta: cada mascota escribe su propio DOM vía el ref imperativo.
      for (const cuerpo of cuerpos) {
        const xPercent = (cuerpo.xPx / dim.w) * 100
        const yPercent = (cuerpo.yPx / dim.h) * 100
        const vx = Math.cos(cuerpo.angulo) * cuerpo.velocidad
        refsMascotasRef.current[cuerpo.id]?.actualizarPosicion(
          xPercent, yPercent, escalaPorProfundidad(yPercent), vx < 0
        )
      }

      rafId = requestAnimationFrame(paso)
    }

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clavePropias])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="page-topbar-compact" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate(-1)} className="page-topbar-btn" title="Salir">
          <AiOutlineClose />
        </button>
        <h1 className="page-topbar-title">Mi Mascota</h1>
        <div className="fondo-sutil" style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)',
        }}>
          <FaHamburger style={{ color: '#caa46b' }} /> {comida}
        </div>
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* El sandbox: un "entorno virtual" fijo (no las variables de tema —
            es la ambientación propia de este minijuego, como el "neón" de
            Inventario.jsx) — un campo verde con un lago, bajo un cielo azul.
            Sigue siendo el mismo truco simple de "grid floor" retro que
            antes (rotateX + perspective sobre un plano de cuadrícula), solo
            que ahora la cuadrícula es pasto en vez de neón, y el lago es
            una elipse hija de ese mismo plano rotado — al heredar la
            perspectiva se ve como un charco visto en ángulo, no como un
            círculo pegado encima. La línea de horizonte sigue marcando
            justo donde arranca la banda de profundidad de las mascotas
            (Y_MIN). Envuelto en un marco con degradado + sombra (mismo
            lenguaje que .sp-card/las tarjetas primarias del resto de la
            app) para que se sienta una pieza de UI, no una imagen suelta. */}
        <div style={{
          borderRadius: 24, padding: 4,
          background: 'linear-gradient(145deg, var(--surface2), var(--surface))',
          boxShadow: '0 10px 24px -12px rgba(0, 0, 0, 0.35)',
        }}>
          <div ref={sandboxRef} style={{
            position: 'relative',
            height: 380,
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: '#bfe3f7',
          }}>
            {/* Cielo */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: `${Y_MIN}%`,
              background: 'linear-gradient(180deg, #4f9fe0 0%, #cdecfb 100%)',
            }} />

            {/* Horizonte: una bruma suave justo donde el cielo se convierte en pasto */}
            <div style={{
              position: 'absolute', top: `${Y_MIN}%`, left: 0, right: 0, height: 3,
              background: 'rgba(255, 255, 255, 0.45)',
            }} />

            {/* Piso: plano cartesiano con perspectiva real (rotateX), no una
                cuadrícula plana — así sí se ve "en 3D" y no solo dibujado. */}
            <div style={{
              position: 'absolute', top: `${Y_MIN}%`, left: 0, right: 0, bottom: 0,
              overflow: 'hidden', perspective: '340px', perspectiveOrigin: '50% 0%',
            }}>
              <div className="mascota-piso" style={{
                position: 'absolute', top: 0, left: '-50%', width: '200%', height: '340%',
                backgroundColor: '#4f9e4f',
                backgroundImage:
                  'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
                transform: 'rotateX(62deg)',
                transformOrigin: 'top',
              }}>
                {/* Lago: hijo del mismo plano rotado, para heredar su
                    perspectiva sin cálculos aparte. */}
                <div style={{
                  position: 'absolute', top: '36%', left: '52%', width: '30%', height: '20%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 35% 30%, #d6f4ff 0%, #6fc0e8 35%, #2f83b5 72%, #1f5f8a 100%)',
                  boxShadow: 'inset 0 0 14px rgba(255, 255, 255, 0.35)',
                }} />
              </div>
            </div>

            {propias.length === 0 ? (
              <p style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '0 32px', color: 'rgba(20, 40, 15, 0.75)', fontSize: 13, fontWeight: 600, margin: 0, zIndex: 999,
              }}>
                Aún no tienes mascotas. Consíguelas aquí abajo.
              </p>
            ) : (
              propias.map(m => (
                <MascotaViva
                  key={m.id}
                  ref={obtenerRefCallback(m.id)}
                  mascota={m}
                  tamanoPx={TAMANO_PX}
                  felicidad={felicidadDe(m.id)}
                  textoEdad={textoEdad(m.id)}
                  hambrienta={estaHambrienta(m.id)}
                  enPelea={peleando.has(m.id)}
                  onTap={alimentar}
                />
              ))
            )}

            {comidaCayendo && (
              <div style={{
                position: 'absolute',
                left: `${comidaCayendo.xPercent}%`,
                top: `${comidaCayendo.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: zIndexPorProfundidad(comidaCayendo.yPercent) + 1,
                pointerEvents: 'none',
              }}>
                <span className="mascota-comida-cae" style={{ display: 'inline-block' }}>
                  <FaHamburger style={{ fontSize: 22, color: '#caa46b', filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.4))' }} />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fuera del sandbox a propósito: adentro, cuando la manada se
            amontonaba encima, tapaba el botón. Aquí siempre es alcanzable,
            con el mismo morado de los CTA primarios del resto de la app. */}
        {propias.length > 0 && (
          <button
            type="button"
            onClick={alimentarATodos}
            disabled={comida < propias.length}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              minHeight: 48, borderRadius: 14, border: 'none',
              background: comida < propias.length ? 'var(--surface2)' : '#7c5cbf',
              color: comida < propias.length ? 'var(--text-muted)' : '#fff',
              fontWeight: 700, fontSize: 14,
              cursor: comida < propias.length ? 'not-allowed' : 'pointer',
              boxShadow: comida < propias.length ? 'none' : '0 6px 18px -6px #7c5cbf80',
            }}
          >
            <FaHamburger /> Alimentar a todos
            <span className="fondo-sutil" style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 12,
              background: comida < propias.length ? undefined : 'rgba(255, 255, 255, 0.22)',
            }}>
              {comida}
            </span>
          </button>
        )}

        <p style={{
          textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', margin: 0,
          minHeight: 16, opacity: mensaje ? 1 : 0, transition: 'opacity 0.2s ease',
        }}>
          {mensaje || '.'}
        </p>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
          }}>
            Tu colección
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {MASCOTAS.map(m => {
              const tuya = ownsItem(`mascota-${m.id}`)
              const paletaMostrada = tuya ? m.paleta : paletaSilueta(m.id)
              const felicidad = tuya ? felicidadDe(m.id) : 0

              return (
                <div key={m.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 8px',
                  opacity: tuya ? 1 : 0.55,
                  // Sin esto, el ancho fijo del PixelArt de abajo (columnas
                  // × size en px) obliga a esta columna del grid a no
                  // encogerse nunca por debajo de ese tamaño — aunque el
                  // contenedor "Tu colección" sí se ajuste, cada tarjeta se
                  // quedaría fija y podía desbordar en pantallas angostas.
                  minWidth: 0,
                }}>
                  {tuya && (
                    // Estrella: elige a esta como la mascota "compañera" que
                    // te sigue fuera de Mi Mascota (ver MascotaCompanera.jsx,
                    // en Home/Leccion) — una y solo una a la vez, tocar la ya
                    // activa la quita (seleccionarMascota hace el toggle).
                    <button
                      type="button"
                      onClick={() => seleccionarMascota(m.id)}
                      title={mascotaSeleccionada === m.id ? 'Quitar de compañera' : 'Hacer mi compañera'}
                      style={{
                        minHeight: 36, minWidth: 36, padding: 4, marginTop: -6,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: mascotaSeleccionada === m.id ? '#facc15' : 'var(--text-muted)',
                        fontSize: 15,
                      }}
                    >
                      {mascotaSeleccionada === m.id ? <FaStar /> : <FaRegStar />}
                    </button>
                  )}
                  <PixelArt grid={m.grid} paleta={paletaMostrada} size={4} style={ESTILO_SPRITE_COLECCION} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)' }}>{m.nombre}</span>
                  {tuya ? (
                    <>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div className="fondo-sutil" style={{ height: 4, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${felicidad}%`, borderRadius: 999,
                            background: 'linear-gradient(90deg, var(--correct), #86efac)',
                            transition: 'width 300ms ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                          Felicidad {felicidad}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMascotaAEliminar(m)}
                        style={{
                          width: '100%', minHeight: 44, borderRadius: 8, border: 'none',
                          background: 'transparent', color: 'var(--wrong)',
                          fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                      >
                        <FaTrash size={10} /> Eliminar
                      </button>
                    </>
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

      <ConfirmDialog
        abierto={Boolean(mascotaAEliminar)}
        titulo="Eliminar mascota"
        mensaje={mascotaAEliminar
          ? `¿Eliminar a ${mascotaAEliminar.nombre} de tu colección? No se te devolverán las monedas si la compraste.`
          : ''}
        textoConfirmar="Eliminar"
        colorConfirmar="var(--wrong)"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setMascotaAEliminar(null)}
      />
    </div>
  )
}

// Una mascota "viva" dentro del sandbox. Ya no decide su propio rumbo: el
// loop de física de Mascota.jsx la mueve llamando a `actualizarPosicion` en
// cada frame vía este ref imperativo, escribiendo top/left/transform
// directo en su <button> — nada de eso pasa por React state (a 60fps
// dispararía un re-render de toda la lista). Lo único que sí es React state
// aquí es el volteo del sprite (mirandoIzq, cambia poco), el temblor de
// hambre, `alimentando` (flash verde de medio segundo al tocarla y que sí
// haya comida — ver manejarTap/onTap), y los dos rasgos de carácter de esta
// mascota en particular (ver data/mascotas.js): `vocalizar` (sonidos de
// texto propios, ver `sonidos`) y `saltar` (solo si `atributos.salta`) —
// ambos corren en temporizadores propios e independientes entre mascotas,
// igual que el paseo lo era antes de moverse al loop de física. Sin
// emojis: la única señal sobre su cabeza es su edad en texto (ver
// textoEdad en utils/mascotasEstado.js — cuánto lleva desbloqueada, no un
// reloj de hambre), reemplazada por su sonido característico al vocalizar.
// `enPelea`/`alimentando` no tienen texto propio — se ven como un tinte de
// color sobre el sprite (PixelArt `tinte`, estilo el flash de daño de
// Minecraft: rojo en pelea, verde al comer), no como un mensaje.
const MascotaViva = forwardRef(function MascotaViva(
  { mascota, tamanoPx, felicidad, textoEdad, hambrienta, enPelea, onTap }, ref
) {
  const elRef = useRef(null)
  const [mirandoIzq, setMirandoIzq] = useState(false)
  const mirandoRef = useRef(false)
  const [danioActivo, setDanioActivo] = useState(false)
  const [sonidoActivo, setSonidoActivo] = useState(null)
  const [saltando, setSaltando] = useState(false)
  const [alimentando, setAlimentando] = useState(false)
  // Desincroniza el balanceo entre mascotas (si no, se mecen exactamente
  // igual y se ve artificial) — un valor fijo por instancia.
  const retrasoBalanceoRef = useRef(Math.random() * -3.6)
  // Marca de tiempo de cada toque reciente, para detectar una racha de
  // TOQUES_PARA_DANIO toques seguidos dentro de VENTANA_TOQUES_MS (ver
  // manejarTap) — no necesita ser React state, nada de esto se pinta.
  const toquesRecientesRef = useRef([])

  useImperativeHandle(ref, () => ({
    actualizarPosicion(xPercent, yPercent, escala, mirando) {
      const el = elRef.current
      if (!el) return
      el.style.left = `${xPercent}%`
      el.style.top = `${yPercent}%`
      el.style.transform = `translate(-50%, -50%) scale(${escala})`
      el.style.zIndex = String(zIndexPorProfundidad(yPercent))
      if (mirando !== mirandoRef.current) {
        mirandoRef.current = mirando
        setMirandoIzq(mirando)
      }
    },
  }), [])

  // "Recibir daño": mientras esté hambrienta, un temblor corto cada 5s.
  useEffect(() => {
    if (!hambrienta) return
    const id = setInterval(() => {
      setDanioActivo(true)
      setTimeout(() => setDanioActivo(false), 500)
    }, 5000)
    return () => clearInterval(id)
  }, [hambrienta])

  // Vocalización: cada tanto "dice" uno de sus sonidos característicos
  // (data/mascotas.js) sobre su cabeza, en vez del reloj — un array vacío
  // (la tortuga) simplemente nunca dispara este efecto.
  useEffect(() => {
    const sonidos = mascota.sonidos
    if (!sonidos || sonidos.length === 0) return
    let cancelado = false
    let ocultarId = null
    let timeoutId = null

    function programar() {
      const espera = 6000 + Math.random() * 8000
      timeoutId = setTimeout(() => {
        if (cancelado) return
        setSonidoActivo(sonidos[Math.floor(Math.random() * sonidos.length)])
        ocultarId = setTimeout(() => { if (!cancelado) setSonidoActivo(null) }, 1800)
        programar()
      }, espera)
    }

    programar()
    return () => { cancelado = true; clearTimeout(timeoutId); clearTimeout(ocultarId) }
  }, [mascota.sonidos])

  // Salto: rasgo exclusivo de las especies con atributos.salta (los
  // conejos) — puramente visual (mascota-salto, ver global.css), no mueve
  // su posición real en el sandbox, solo la hace brincar en el sitio cada
  // tanto para que se note su carácter.
  useEffect(() => {
    if (!mascota.atributos?.salta) return
    let cancelado = false
    let timeoutId = null
    let ocultarId = null

    function programar() {
      const espera = 3200 + Math.random() * 4200
      timeoutId = setTimeout(() => {
        if (cancelado) return
        setSaltando(true)
        ocultarId = setTimeout(() => { if (!cancelado) setSaltando(false) }, 550)
        programar()
      }, espera)
    }

    programar()
    return () => { cancelado = true; clearTimeout(timeoutId); clearTimeout(ocultarId) }
  }, [mascota.atributos?.salta])

  const duracionRebote = felicidad >= 60 ? '0.8s' : felicidad >= 30 ? '1.3s' : '2s'
  const claseTemblor = danioActivo ? 'mascota-danio' : 'mascota-balanceo'
  const etiqueta = sonidoActivo ?? textoEdad
  // Las mascotas siempre están sobre el pasto (Y_MIN..Y_MAX cae entero
  // dentro del piso, nunca en el cielo) — blanco + sombra en vez del cian
  // de antes, para que se lea bien sobre el verde.
  const colorEtiqueta = sonidoActivo
    ? '#fff6b8'
    : hambrienta ? 'var(--wrong)' : 'rgba(255, 255, 255, 0.95)'
  // Rojo en pelea, verde al alimentarla (mismo verde que --correct, para
  // que se lea como "bien hecho") — mismo mecanismo de tinte (PixelArt
  // `tinte`), la pelea manda porque es la señal más urgente de las dos.
  const tinte = enPelea ? '#ff2e2e' : alimentando ? '#4ade80' : null

  function manejarTap() {
    // Toques rápidos seguidos "molestan" a la mascota — solo visual (el
    // mismo temblor de "hambrienta"), no le baja felicidad ni nada real.
    const ahora = Date.now()
    const recientes = toquesRecientesRef.current.filter(t => ahora - t <= VENTANA_TOQUES_MS)
    recientes.push(ahora)
    if (recientes.length >= TOQUES_PARA_DANIO) {
      toquesRecientesRef.current = []
      setDanioActivo(true)
      setTimeout(() => setDanioActivo(false), DURACION_DANIO_TOQUES_MS)
    } else {
      toquesRecientesRef.current = recientes
    }

    if (onTap(mascota.id)) {
      setAlimentando(true)
      setTimeout(() => setAlimentando(false), 500)
    }
  }

  return (
    <button
      ref={elRef}
      type="button"
      onClick={manejarTap}
      title={mascota.frase}
      style={{
        position: 'absolute',
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
        fontSize: 10, fontWeight: 700, lineHeight: 1.2, color: colorEtiqueta,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.55)',
      }}>
        {etiqueta}
      </span>
      <span
        className={claseTemblor}
        style={claseTemblor === 'mascota-balanceo' ? { animationDelay: `${retrasoBalanceoRef.current}s` } : undefined}
      >
        <span className={saltando ? 'mascota-salto' : undefined}>
          <span style={{ display: 'inline-block', animation: `mascota-rebote ${duracionRebote} ease-in-out infinite` }}>
            <PixelArt grid={mascota.grid} paleta={mascota.paleta} size={tamanoPx} flip={mirandoIzq} tinte={tinte} />
          </span>
        </span>
      </span>
    </button>
  )
})
