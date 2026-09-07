// utils/bots.js
// Genera estudiantes falsos ("bots") para rellenar el Ranking Semanal
// (Tutorias.jsx) mientras la actividad real todavía es poca. Es puramente
// de presentación: no escribe nada en Supabase, no crea usuarios reales ni
// filas en `puntos_actividad` — solo produce datos con la misma forma que
// devuelve `obtener_ranking_semanal()` para mezclarlos en el cliente.
//
// El PRNG está sembrado con el año+semana ISO actual (ver `semillaSemanal`)
// en vez de `Math.random()` sin más: así todos los visitantes ven el MISMO
// tablero falso durante la misma semana (no se reordena en cada refresh de
// cada quien, lo cual se vería roto/obviamente falso), y cambia solo cuando
// cambia la semana — a tono con que el ranking real también es "semanal".
//
// Reglas de diseño (pedidas explícitamente):
//   1-2. La mayoría de los nombres se generan (nombre+apellido al azar);
//        solo una fracción chica sale de NOMBRES_PERSONALIZADOS, sin
//        importar cuántos bots se pidan (ver PROPORCION_MAX_PERSONALIZADOS).
//   3. Ningún bot pasa de PUNTAJE_MAX_BOT puntos.
//   4. El ranking es "global": se simula una población grande de bots (ver
//      CANTIDAD_BOTS_POBLACION_GLOBAL) para que la posición de un alumno
//      real pueda ser un número grande (p. ej. #2,143) sin que eso implique
//      mostrar a miles de bots en pantalla. Los bots NUNCA deben sacar a un
//      alumno real del tablero visible — construirTableroConBots() lo
//      garantiza quitando bots (nunca alumnos reales) si hiciera falta
//      espacio.
//   5. El tablero visible se amplió a 100 lugares (antes 25) y es el mismo
//      para todos (misma semilla semanal).
//   6. calcularPosicionGlobal() deja mostrarle a un alumno su lugar real
//      aunque quede muy por debajo del tablero visible.

const NOMBRES = [
  'ana', 'maria', 'jose', 'luis', 'carlos', 'juan', 'miguel', 'diego',
  'fernanda', 'valeria', 'daniela', 'andrea', 'paola', 'sofia', 'ximena',
  'alejandro', 'ricardo', 'javier', 'roberto', 'eduardo', 'gerardo',
  'monica', 'karla', 'brenda', 'itzel', 'jimena', 'renata', 'camila',
  'oscar', 'raul', 'sergio', 'francisco', 'arturo', 'emilio', 'santiago',
  'natalia', 'gabriela', 'alejandra', 'lorena', 'rocio', 'yolanda',
  'jesus', 'angel', 'fernando', 'isabel', 'guadalupe', 'leonardo',
  'victor', 'adrian', 'brandon', 'kevin', 'jonathan', 'estefania',
  'melissa', 'jacqueline', 'cesar', 'ivan', 'mariana', 'perla',
  'abigail', 'daniel', 'omar', 'erick', 'yesenia', 'liliana',
]

// ─────────────────────────────────────────────────────────────────────────
// PEGA AQUÍ tus propios nombres de correo si prefieres una lista propia en
// vez de que se combinen nombre+apellido automáticamente. Uno por línea (o
// separados por coma), en minúsculas, tal como se verían antes de la
// arroba — por ejemplo:
//
//   const NOMBRES_PERSONALIZADOS = `
//     carlosmendoza04
//     ana.rod98
//     luisfer_23
//   `.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
//
// Si se deja vacío (como está por defecto), se usa el generador
// nombre+apellido de abajo. Si pegas menos nombres que los que pide
// `cantidad`, el resto de las filas se completa con el generador
// automático para no quedarse corto; el orden y a quién le toca qué
// puntaje siempre se decide al azar (con semilla semanal, ver arriba).
const NOMBRES_PERSONALIZADOS = `
fujab14
xtu
elpelons3001
akiraNakamura
rmtz_89
pablo1992m
gggx12
mariaceleste_99
jko092
insanopvppvpmx
elena.rdz21
wxt33
luis_fer88
osopanda123
ana.perez.mty
juancarlos1985
qwe_asd1
tomas_shelby
cxz90
diana_laura_7
roberto.c.99
felipe_mza
sr_gato22
bnjm1990
sofsofiaghioqeth
ximena.gtz
yoshi_k33
mikinator90
alberto_ruiz_2018
kyle.broflov
juanperez1992
asdfg_qwe
miguel.angel.23
tq_m123
suleymangc
elgato_volador
mariobros_88
jessica.mendez1
lucia_fer1995
juanillo_99
ana_pau_89
beto.rmz
camila.septo
dani.ela.99
eduardovilla99
ferchoMio
gaby_gomez
hugosanchez9
rodrigo_mty
valeria_cruz01
`.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
// ─────────────────────────────────────────────────────────────────────────

const APELLIDOS = [
  'garcia', 'hernandez', 'martinez', 'lopez', 'gonzalez', 'perez',
  'rodriguez', 'sanchez', 'ramirez', 'flores', 'torres', 'diaz',
  'morales', 'ortiz', 'gutierrez', 'mendoza', 'ruiz', 'castillo',
  'jimenez', 'romero', 'vazquez', 'reyes', 'aguilar', 'cruz', 'medina',
]

// PRNG determinista chico (mulberry32): con la misma semilla siempre da la
// misma secuencia — es lo que permite que el tablero sea estable entre
// visitantes y recargas dentro de la misma semana.
function crearGenerador(semilla) {
  let a = semilla >>> 0
  return function siguiente() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Año + semana ISO actual como entero (p. ej. 202637): cambia una vez por
// semana, que es exactamente el mismo ciclo que usa el ranking real
// (últimos 7 días).
function semillaSemanal() {
  const ahora = new Date()
  const copia = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
  const diaISO = copia.getUTCDay() || 7
  copia.setUTCDate(copia.getUTCDate() + 4 - diaISO)
  const inicioAno = new Date(Date.UTC(copia.getUTCFullYear(), 0, 1))
  const semanaISO = Math.ceil(((copia - inicioAno) / 86400000 + 1) / 7)
  return copia.getUTCFullYear() * 100 + semanaISO
}

// Cuántos bots se generan CON nombre para el tablero visible (se combinan
// con el ranking real y de ahí sale el top LIMITE_TABLERO). Más que
// suficiente para llenar 100 lugares aunque haya varios alumnos reales.
const CANTIDAD_BOTS_VITRINA = 120

// Cuántos lugares se muestran en el tablero (antes 25).
const LIMITE_TABLERO = 100

// Tamaño de la población total de bots "simulada" (con nombre + sin
// nombre) que se usa SOLO para calcular en qué posición global quedaría un
// alumno real — nunca se muestran los 3,000 en pantalla, es lo que permite
// que alguien pueda estar en, por ejemplo, el lugar #2,143 sin renderizar
// miles de filas.
const CANTIDAD_BOTS_POBLACION_GLOBAL = 3000

// Como mucho esta fracción de los bots CON NOMBRE sale de
// NOMBRES_PERSONALIZADOS — el resto siempre se genera (nombre+apellido al
// azar), sin importar cuántos nombres se hayan pegado en la lista de
// arriba ni cuántos bots se pidan.
const PROPORCION_MAX_PERSONALIZADOS = 0.15

// Ningún bot llega a más de esto. El sistema real da 10 pts/unidad (tope
// semanal de 1000) y 100-400 por examen (máx. ~2 por el enfriamiento de
// 12h) — un usuario MUY activo en la semana ronda los 900-1400, así que
// 1500 sigue siendo un techo creíble.
const PUNTAJE_MAX_BOT = 1500
const PUNTAJE_MIN_BOT = 15

function elegir(rand, lista) {
  return lista[Math.floor(rand() * lista.length)]
}

// Fisher-Yates con el mismo PRNG sembrado: baraja `lista` sin mutarla.
function barajar(rand, lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Imita el formato de `nombre` que devuelve el RPC real
// (`split_part(email, '@', 1)`): minúsculas, nombre y apellido pegados sin
// separador (nada de puntos), a veces con los últimos dos dígitos de un
// año de nacimiento plausible al final (así se ve como un correo real del
// tipo "carlosmendoza04", no como un apodo con un número suelto tipo
// "juanito26").
function generarNombreFalso(rand) {
  const nombre = elegir(rand, NOMBRES)
  const apellido = elegir(rand, APELLIDOS)
  const conNumero = rand() < 0.4
  // Alumnos de prepa/bachillerato hoy: nacidos aprox. 2003-2011 — dos
  // dígitos de año de nacimiento, no un número arbitrario.
  const numero = conNumero ? String(3 + Math.floor(rand() * 9)).padStart(2, '0') : ''
  return `${nombre}${apellido}${numero}`
}

// Curva sesgada (rand()^2) para que la mayoría de los bots caiga en
// puntajes modestos y solo unos pocos lleguen cerca de PUNTAJE_MAX_BOT,
// como pasaría con actividad real.
function generarPuntajeFalso(rand) {
  const sesgo = rand() * rand() // sesga hacia valores bajos
  return Math.round(PUNTAJE_MIN_BOT + sesgo * (PUNTAJE_MAX_BOT - PUNTAJE_MIN_BOT))
}

// Elige `cantidad` nombres únicos: como mucho
// `cantidad * PROPORCION_MAX_PERSONALIZADOS` salen de la lista pegada a
// mano (mayormente random), el resto siempre se genera.
function elegirNombres(rand, cantidad) {
  const maxDesdeLista = NOMBRES_PERSONALIZADOS.length === 0
    ? 0
    : Math.max(1, Math.min(NOMBRES_PERSONALIZADOS.length, Math.floor(cantidad * PROPORCION_MAX_PERSONALIZADOS)))

  const nombresUsados = new Set()
  const nombres = []

  for (const nombre of barajar(rand, NOMBRES_PERSONALIZADOS)) {
    if (nombres.length >= maxDesdeLista) break
    nombres.push(nombre)
    nombresUsados.add(nombre)
  }

  while (nombres.length < cantidad) {
    let nombre = generarNombreFalso(rand)
    // Evita duplicados exactos (con miles de combinaciones posibles y unas
    // decenas de bots mostrados, es poco probable pero no imposible).
    let intentos = 0
    while (nombresUsados.has(nombre) && intentos < 5) {
      nombre = generarNombreFalso(rand)
      intentos += 1
    }
    nombresUsados.add(nombre)
    nombres.push(nombre)
  }

  return nombres
}

/**
 * Genera `cantidad` estudiantes falsos CON nombre — los que sí se ven en el
 * tablero —, con la misma forma que las filas de `obtener_ranking_semanal()`
 * (menos `posicion`, que se recalcula al mezclarlos con el ranking real).
 *
 * @param {number} cantidad
 * @returns {{ user_id: string, nombre: string, puntos: number, esBot: true }[]}
 */
export function generarEstudiantesFalsos(cantidad = CANTIDAD_BOTS_VITRINA) {
  const rand = crearGenerador(semillaSemanal())
  const nombres = elegirNombres(rand, cantidad)

  return nombres.map((nombre, i) => ({
    user_id: `bot-${semillaSemanal()}-${i}`,
    nombre,
    puntos: generarPuntajeFalso(rand),
    esBot: true,
  }))
}

// Puntajes de una población de bots SIN nombre (nunca se muestran) — sirve
// solo para contar cuántos "alumnos simulados" superarían a alguien y así
// calcular una posición global grande sin tener que renderizar miles de
// filas. Semilla desplazada respecto a la de generarEstudiantesFalsos para
// que no sea exactamente la misma secuencia de números.
function generarPuntosPoblacionBots(cantidad = CANTIDAD_BOTS_POBLACION_GLOBAL) {
  const rand = crearGenerador(semillaSemanal() + 500_000)
  const puntos = []
  for (let i = 0; i < cantidad; i++) puntos.push(generarPuntajeFalso(rand))
  return puntos
}

/**
 * Combina el ranking real con estudiantes falsos y arma el tablero visible
 * (top `LIMITE_TABLERO`). Importante: los bots jamás sacan a un alumno REAL
 * del tablero — si al recortar a `LIMITE_TABLERO` algún alumno real quedó
 * fuera, se le hace espacio quitando bots (los de menos puntos primero),
 * nunca a otro alumno real. Los bots solo están para dar sensación de
 * movimiento/tráfico, no para desplazar usuarios.
 *
 * @param {{ user_id: string, nombre: string, puntos: number }[]} rankingReal
 * @param {number} cantidadBotsVitrina
 */
export function construirTableroConBots(rankingReal, cantidadBotsVitrina = CANTIDAD_BOTS_VITRINA) {
  const reales = rankingReal ?? []
  const bots = generarEstudiantesFalsos(cantidadBotsVitrina)

  let tablero = [...reales, ...bots]
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, LIMITE_TABLERO)

  const idsEnTablero = new Set(tablero.map((f) => f.user_id))
  const realesFuera = reales.filter((f) => !idsEnTablero.has(f.user_id))

  if (realesFuera.length > 0) {
    let porQuitar = realesFuera.length
    for (let i = tablero.length - 1; i >= 0 && porQuitar > 0; i--) {
      if (tablero[i].esBot) {
        tablero.splice(i, 1)
        porQuitar -= 1
      }
    }
    tablero = [...tablero, ...realesFuera].sort((a, b) => b.puntos - a.puntos)
  }

  return tablero.slice(0, LIMITE_TABLERO).map((fila, i) => ({ ...fila, posicion: i + 1 }))
}

/**
 * Calcula la posición GLOBAL de un alumno (real + bots), aunque quede muy
 * por debajo del tablero visible de 100 — para mostrarle "estás en el
 * lugar #2,143" sin tener que renderizar toda la población simulada.
 *
 * @param {{ puntos: number, posicionEntreReales: number }} miDato viene de
 *   `obtener_mi_posicion_semanal()` (posicionEntreReales = posición entre
 *   SOLO alumnos reales, sin límite de 100).
 * @param {number} cantidadBotsGlobal
 * @returns {number}
 */
export function calcularPosicionGlobal({ puntos, posicionEntreReales }, cantidadBotsGlobal = CANTIDAD_BOTS_POBLACION_GLOBAL) {
  const botsConMasPuntos = generarPuntosPoblacionBots(cantidadBotsGlobal)
    .filter((p) => p > puntos).length
  return posicionEntreReales + botsConMasPuntos
}
