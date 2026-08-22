// Buscador de conceptos para el botón de lupa en Lección.
//
// Recorre el temario de Lecturas (temas -> subtemas -> conceptos, tal como
// están definidos en /src/data/lecturas/*.js) y encuentra el subtema, y
// dentro de él el concepto puntual, más parecido al texto de la pregunta
// actual. Usa TF-IDF + similitud coseno en vez de un simple conteo de
// palabras repetidas: así una palabra que aparece en casi todos los
// subtemas (poco informativa) pesa menos que una palabra rara y distintiva
// de un solo tema (ej. "subjuntivo", "irracionales").
//
// El índice TF-IDF de cada lectura se calcula una sola vez y se cachea en
// memoria (las lecturas son objetos estáticos importados, siempre la misma
// referencia), para que cada búsqueda solo tenga que tokenizar la pregunta
// y recorrer subtemas, no reconstruir el temario completo.

const STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del', 'las', 'un', 'por', 'con', 'no', 'una',
  'su', 'para', 'es', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'si', 'porque',
  'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde', 'quien',
  'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante',
  'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'unos', 'yo', 'otro', 'otras', 'otra', 'tanto',
  'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas',
  'algo', 'nosotros', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'son', 'fue', 'ser', 'sido',
  'siendo', 'estan', 'estoy', 'estamos', 'estais', 'tiene', 'tienen', 'cuales',
  'sera', 'siguiente', 'siguientes', 'ejemplo', 'cual', 'cuales', 'cada', 'ser',
])

function normalizar(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
}

// Stemming ligero: solo cubre los patrones de plural/adverbio más comunes
// del español, lo suficiente para emparejar "sustantivos" con "sustantivo"
// o "oraciones" con "oración" sin necesitar una librería de NLP.
function raiz(palabra) {
  if (palabra.length > 6 && palabra.endsWith('mente')) return palabra.slice(0, -5)
  if (palabra.length > 6 && palabra.endsWith('ciones')) return palabra.slice(0, -6) + 'cion'
  if (palabra.length > 3 && palabra.endsWith('s')) return palabra.slice(0, -1)
  return palabra
}

function tokenizar(texto) {
  return normalizar(texto)
    .split(/\s+/)
    .filter(palabra => palabra.length > 2 && !STOPWORDS.has(palabra))
    .map(raiz)
}

function sumar(mapa, clave, cantidad) {
  mapa.set(clave, (mapa.get(clave) || 0) + cantidad)
}

// Cachea el índice TF-IDF por objeto de lectura (misma referencia siempre,
// al venir de un import estático), para no reconstruirlo en cada búsqueda.
const cacheIndices = new WeakMap()

function construirIndice(lectura) {
  if (cacheIndices.has(lectura)) return cacheIndices.get(lectura)

  const subtemas = []
  const df = new Map() // en cuántos subtemas aparece cada palabra

  for (const tema of lectura.temas || []) {
    for (const subtema of tema.subtemas || []) {
      const tf = new Map()
      // El título representa mejor el tema del subtema que una sola línea
      // de concepto, así que cuenta doble en la frecuencia de término.
      tokenizar(subtema.titulo).forEach(palabra => sumar(tf, palabra, 2))
      ;(subtema.conceptos || []).forEach(concepto => {
        tokenizar(concepto).forEach(palabra => sumar(tf, palabra, 1))
      })

      for (const palabra of tf.keys()) {
        df.set(palabra, (df.get(palabra) || 0) + 1)
      }

      subtemas.push({ temaId: tema.id, subtemaId: subtema.id, conceptos: subtema.conceptos || [], tf })
    }
  }

  const N = subtemas.length
  const idf = new Map()
  for (const [palabra, frecuencia] of df) {
    // idf suavizado (+1): nunca llega a 0, incluso si una palabra aparece
    // en todos los subtemas, así sigue aportando algo mínimo de señal.
    idf.set(palabra, Math.log((N + 1) / (frecuencia + 1)) + 1)
  }

  for (const s of subtemas) {
    let sumaCuadrados = 0
    for (const [palabra, cuenta] of s.tf) {
      const peso = cuenta * idf.get(palabra)
      sumaCuadrados += peso * peso
    }
    s.norma = Math.sqrt(sumaCuadrados) || 1
  }

  const indice = { subtemas, idf }
  cacheIndices.set(lectura, indice)
  return indice
}

// Dentro del subtema ganador, identifica cuál de sus conceptos puntuales
// comparte más palabras con la consulta (para señalar la línea exacta, no
// solo el subtema completo).
function mejorConcepto(conceptos, palabrasConsulta) {
  if (!conceptos || conceptos.length === 0) return null
  const setConsulta = new Set(palabrasConsulta)

  let mejorIdx = null
  let mejorCuenta = 0
  conceptos.forEach((concepto, idx) => {
    let cuenta = 0
    for (const palabra of tokenizar(concepto)) {
      if (setConsulta.has(palabra)) cuenta++
    }
    if (cuenta > mejorCuenta) {
      mejorCuenta = cuenta
      mejorIdx = idx
    }
  })

  return mejorIdx
}

// Devuelve { temaId, subtemaId, conceptoIdx, score } del subtema (y
// concepto puntual dentro de él) más parecido al texto dado, según
// similitud coseno sobre vectores TF-IDF. null si no hay ninguna
// coincidencia real de vocabulario.
export function buscarConceptoSimilar(lectura, textoConsulta) {
  if (!lectura) return null
  const indice = construirIndice(lectura)
  if (indice.subtemas.length === 0) return null

  const palabrasConsulta = tokenizar(textoConsulta)
  if (palabrasConsulta.length === 0) return null

  const tfConsulta = new Map()
  palabrasConsulta.forEach(palabra => sumar(tfConsulta, palabra, 1))

  // Solo interesan palabras que el temario conoce (tienen idf); el resto
  // (nombres propios, ruido de la pregunta) no aporta señal de búsqueda.
  const pesoConsulta = new Map()
  let normaConsulta = 0
  for (const [palabra, cuenta] of tfConsulta) {
    const idf = indice.idf.get(palabra)
    if (!idf) continue
    const peso = cuenta * idf
    pesoConsulta.set(palabra, peso)
    normaConsulta += peso * peso
  }
  normaConsulta = Math.sqrt(normaConsulta)
  if (normaConsulta === 0 || pesoConsulta.size === 0) return null

  let mejor = null
  let mejorPuntaje = 0

  for (const subtema of indice.subtemas) {
    let producto = 0
    for (const [palabra, pesoQ] of pesoConsulta) {
      const cuenta = subtema.tf.get(palabra)
      if (!cuenta) continue
      producto += pesoQ * (cuenta * indice.idf.get(palabra))
    }
    if (producto === 0) continue

    const similitud = producto / (normaConsulta * subtema.norma)
    if (similitud > mejorPuntaje) {
      mejorPuntaje = similitud
      mejor = subtema
    }
  }

  if (!mejor) return null

  return {
    temaId: mejor.temaId,
    subtemaId: mejor.subtemaId,
    conceptoIdx: mejorConcepto(mejor.conceptos, palabrasConsulta),
    score: mejorPuntaje,
  }
}
