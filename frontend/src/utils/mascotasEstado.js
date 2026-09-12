// Estado de "cuidado" de cada mascota (ver pages/Mascota.jsx) — separado de
// StoreContext.jsx a propósito: esto es la simulación de la mascota en sí
// (cuánto la cuidaste), no el saldo/inventario de la Tienda. Local al
// dispositivo, sin firma (mismo criterio que la comida — no hay nada real
// que proteger aquí, ver comprarComida en StoreContext.jsx).
//
// Modelo: alimentar a una mascota le da VENTANA_MS de "cuerda" (un reloj
// que vence). El temporizador que se ve sobre su cabeza es literalmente esa
// cuenta regresiva — no un cálculo aparte de la felicidad, es la MISMA
// fuente: felicidad = qué tan llena está esa cuerda todavía.

const CLAVE = 'mascotas_estado'
const VENTANA_MS = 24 * 60 * 60 * 1000 // 24h de "cuerda" por cada vez que se le da de comer

function leerTodo() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

function guardarTodo(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // Sin localStorage disponible, el estado no persiste entre sesiones,
    // pero la mascota sigue "viva" dentro de esta.
  }
}

// Milisegundos que le quedan antes de llegar a 0 (hambrienta). Una mascota
// sin registro previo (recién adoptada) arranca con la cuerda completa —
// no tendría sentido que se sintiera abandonada desde el primer segundo —
// así que ese primer registro se crea aquí mismo, perezosamente.
function msRestantes(mascotaId) {
  const todo = leerTodo()
  if (!todo[mascotaId]) {
    todo[mascotaId] = { vence: Date.now() + VENTANA_MS }
    guardarTodo(todo)
  }
  return Math.max(0, todo[mascotaId].vence - Date.now())
}

/** Alimenta una mascota: le vuelve a dar VENTANA_MS completos de cuerda. */
export function alimentarMascota(mascotaId) {
  const todo = leerTodo()
  todo[mascotaId] = { vence: Date.now() + VENTANA_MS }
  guardarTodo(todo)
}

/** Felicidad 0-100 según cuánta cuerda le queda. */
export function felicidadDe(mascotaId) {
  return Math.round((msRestantes(mascotaId) / VENTANA_MS) * 100)
}

/** true cuando la cuerda llegó a 0 — necesita comer YA. */
export function estaHambrienta(mascotaId) {
  return msRestantes(mascotaId) <= 0
}

// Texto del temporizador que se muestra sobre su cabeza: en horas mientras
// quede una hora o más, en minutos de ahí para abajo (pedido explícito:
// "que se reduzca a horas y luego a minutos").
export function textoTemporizador(mascotaId) {
  const ms = msRestantes(mascotaId)
  if (ms <= 0) return '¡Hambre!'

  const horas = ms / (1000 * 60 * 60)
  if (horas >= 1) return `${Math.ceil(horas)}h`

  const minutos = Math.max(1, Math.ceil(ms / (1000 * 60)))
  return `${minutos}min`
}
