// Estado de "cuidado" de cada mascota (ver pages/Mascota.jsx) — separado de
// StoreContext.jsx a propósito: esto es la simulación de la mascota en sí
// (cuánto la cuidaste), no el saldo/inventario de la Tienda. Local al
// dispositivo, sin firma (mismo criterio que la comida — no hay nada real
// que proteger aquí, ver comprarComida en StoreContext.jsx).
//
// Modelo: alimentar a una mascota le da VENTANA_MS de "cuerda" (un reloj
// que vence) — felicidad = qué tan llena está esa cuerda todavía, y
// `estaHambrienta` cuándo llegó a 0. Ya no se muestra como texto sobre su
// cabeza (eso ahora es su edad, ver textoEdad más abajo); la cuerda sigue
// gobernando la felicidad y el temblor de hambre en el sandbox.

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

// Borra el registro de cuidado de una mascota — se usa al eliminarla de la
// colección (ver Mascota.jsx), así si se vuelve a desbloquear más adelante
// arranca con la cuerda completa en vez de heredar un temporizador viejo.
export function olvidarMascota(mascotaId) {
  const todo = leerTodo()
  if (mascotaId in todo) { delete todo[mascotaId]; guardarTodo(todo) }

  const edades = leerEdades()
  if (mascotaId in edades) { delete edades[mascotaId]; guardarEdades(edades) }
}

// ── Edad ────────────────────────────────────────────────────────────────
// Lo que se ve sobre su cabeza en el sandbox ya no es la cuenta regresiva
// de hambre (esa sigue existiendo para felicidad/hambrienta arriba, solo
// dejó de mostrarse en texto) sino su edad — cuánto lleva desbloqueada,
// contado desde la primera vez que se consulta (igual que msRestantes con
// la cuerda: perezoso, no hace falta engancharlo a la compra en
// StoreContext). Envejece con el tiempo real, no con el uso.
const CLAVE_EDAD = 'mascotas_edad'

function leerEdades() {
  try {
    const crudo = localStorage.getItem(CLAVE_EDAD)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

function guardarEdades(estado) {
  try {
    localStorage.setItem(CLAVE_EDAD, JSON.stringify(estado))
  } catch {
    // Sin localStorage, la edad no persiste entre sesiones — vuelve a
    // contar desde "Nueva" la próxima vez, sin romper nada.
  }
}

function fechaAdopcion(mascotaId) {
  const todo = leerEdades()
  if (!todo[mascotaId]) {
    todo[mascotaId] = { desde: Date.now() }
    guardarEdades(todo)
  }
  return todo[mascotaId].desde
}

// Texto de edad sobre su cabeza: "Nueva" el día que se desbloquea, después
// en días, semanas, meses y años según cuánto haya pasado — cada unidad
// entra en cuanto la anterior deja de ser la más clara de leer.
export function textoEdad(mascotaId) {
  const dias = Math.floor((Date.now() - fechaAdopcion(mascotaId)) / (1000 * 60 * 60 * 24))

  if (dias < 1) return 'Nueva'
  if (dias < 7) return `${dias} ${dias === 1 ? 'día' : 'días'}`

  const semanas = Math.floor(dias / 7)
  if (semanas < 4) return `${semanas} sem`

  const meses = Math.floor(dias / 30)
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`

  const anios = Math.floor(dias / 365)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

// ── Impulso ─────────────────────────────────────────────────────────────
// Un power-up corto y aparte de la "cuerda" de 24h de arriba: al alimentar
// a una mascota (ver Mascota.jsx: alimentar/alimentarATodos), se activa por
// IMPULSO_MS — mientras dura, si esa mascota es la "compañera" seleccionada
// (ver StoreContext.jsx: mascotaSeleccionada, y la estrella en Tu
// colección), te ayuda a encontrar la respuesta correcta en Lección y en
// el Examen de admisión (ver MascotaCompanera.jsx, que la para encima de
// `[data-pista-mascota="true"]` en vez de pasear). A propósito NO es la
// misma felicidad de arriba: esa decae en 24h (cuidado general), esto en
// minutos (un empujón puntual) — mezclarlas habría hecho que alimentar
// para "no tenga hambre" también le diera pistas de examen todo el día,
// que no es la idea.
const CLAVE_IMPULSO = 'mascotas_impulso'
const IMPULSO_MS = 3 * 60 * 1000 // 3 minutos

function leerImpulsos() {
  try {
    const crudo = localStorage.getItem(CLAVE_IMPULSO)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

function guardarImpulsos(estado) {
  try {
    localStorage.setItem(CLAVE_IMPULSO, JSON.stringify(estado))
  } catch {
    // Sin localStorage, el impulso no persiste entre pestañas/recargas.
  }
}

/** Activa el impulso de 3 minutos para esta mascota (al alimentarla). */
export function activarImpulso(mascotaId) {
  const todo = leerImpulsos()
  todo[mascotaId] = { hasta: Date.now() + IMPULSO_MS }
  guardarImpulsos(todo)
}

/** true mientras el impulso de esta mascota siga vigente. */
export function impulsoActivo(mascotaId) {
  if (!mascotaId) return false
  const registro = leerImpulsos()[mascotaId]
  return Boolean(registro) && Date.now() < registro.hasta
}
