// latexAHabla.js
// Convierte texto que mezcla prosa con fórmulas LaTeX ($...$ / $$...$$, la
// misma convención que usa components/Latex.jsx) a una versión "hablada":
// reemplaza cada fórmula por su lectura en español natural, en vez de dejar
// que el lector de voz (utils/tts.js) lea literalmente los símbolos LaTeX
// ("\frac", llaves, "^", etc.), que para un humano no significan nada.
//
// Es un traductor basado en reglas (sin IA ni proveedor externo, 100% local
// y síncrono): reconoce los comandos LaTeX más comunes en matemáticas de
// bachillerato (fracciones, raíces, exponentes, subíndices, valor absoluto,
// vectores, letras griegas, funciones trigonométricas, símbolos de
// conjuntos/lógica, sumatorias, integrales, límites...) y los traduce a la
// frase en español que un profesor diría en voz alta. Lo que no reconoce lo
// deja pasar tal cual (mejor leer un símbolo raro de más que fallar).
//
// Es recursivo: dentro de un \frac{...}{...} puede haber a su vez raíces,
// exponentes u otra fracción anidada, y cada parte se traduce por separado
// antes de armar la frase completa (ver aplicarComando/convertirFormula).

const REGEX_MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

// --- Utilidades para leer argumentos LaTeX con llaves balanceadas --------

// Dado el índice de una '{' de apertura, devuelve su contenido y el índice
// justo después de la '}' de cierre correspondiente (soporta llaves
// anidadas dentro, como en \frac{1}{1+\frac{1}{2}}).
function extraerLlaves(texto, inicio) {
  if (texto[inicio] !== '{') return null
  let profundidad = 0
  for (let i = inicio; i < texto.length; i++) {
    if (texto[i] === '{') profundidad++
    else if (texto[i] === '}') {
      profundidad--
      if (profundidad === 0) {
        return { valor: texto.slice(inicio + 1, i), siguienteIndice: i + 1 }
      }
    }
  }
  return null // llaves sin cerrar: texto malformado, se deja tal cual
}

// Un "argumento" LaTeX de una sola unidad: '{...}' con llaves balanceadas,
// o si no hay llaves, un solo carácter (como en x^2 o x_1).
function extraerArgumento(texto, inicio) {
  if (texto[inicio] === '{') return extraerLlaves(texto, inicio)
  if (inicio < texto.length) return { valor: texto[inicio], siguienteIndice: inicio + 1 }
  return null
}

// Busca todas las apariciones de "\comando" seguido de `numArgumentos`
// argumentos consecutivos, reemplazando cada una por construir(...args).
// Cada argumento se convierte recursivamente antes de pasarlo a construir,
// así que las fórmulas anidadas dentro de otras se resuelven solas.
function aplicarComando(texto, comando, numArgumentos, construir) {
  const patron = `\\${comando}`
  let resultado = ''
  let resto = texto
  let i = resto.indexOf(patron)

  while (i !== -1) {
    let cursor = i + patron.length
    let indiceOpcional = null

    // \sqrt admite un argumento opcional entre corchetes antes de las
    // llaves, para indicar el índice de la raíz: \sqrt[3]{8}.
    if (comando === 'sqrt' && resto[cursor] === '[') {
      const cierre = resto.indexOf(']', cursor)
      if (cierre !== -1) {
        indiceOpcional = resto.slice(cursor + 1, cierre)
        cursor = cierre + 1
      }
    }

    const args = []
    let ok = true
    for (let n = 0; n < numArgumentos; n++) {
      const arg = extraerArgumento(resto, cursor)
      if (!arg) { ok = false; break }
      args.push(convertirFormula(arg.valor))
      cursor = arg.siguienteIndice
    }

    if (ok) {
      resultado += resto.slice(0, i) + construir(...args, indiceOpcional)
    } else {
      // Comando mal formado (llaves sin cerrar): se deja tal cual y se
      // sigue buscando después, para no perder el resto del texto.
      resultado += resto.slice(0, cursor)
    }
    resto = resto.slice(cursor)
    i = resto.indexOf(patron)
  }

  return resultado + resto
}

// Igual que aplicarComando, pero para sufijos sueltos (^ y _) en vez de
// comandos con backslash.
function aplicarSufijo(texto, caracter, construir) {
  let resultado = ''
  let resto = texto
  let i = resto.indexOf(caracter)

  while (i !== -1) {
    const arg = extraerArgumento(resto, i + 1)
    if (arg) {
      resultado += resto.slice(0, i) + construir(convertirFormula(arg.valor))
      resto = resto.slice(arg.siguienteIndice)
    } else {
      resultado += resto.slice(0, i + 1)
      resto = resto.slice(i + 1)
    }
    i = resto.indexOf(caracter)
  }

  return resultado + resto
}

function textoExponente(arg) {
  if (arg === '2') return ' al cuadrado'
  if (arg === '3') return ' al cubo'
  if (arg === '-1') return ' a la menos uno'
  return ` a la ${arg}`
}

function textoSubindice(arg) {
  return ` sub ${arg}`
}

function textoRaiz(radicando, indice) {
  if (indice === '3') return `raíz cúbica de ${radicando}`
  if (indice && indice !== '2') return `raíz de índice ${indice} de ${radicando}`
  return `raíz cuadrada de ${radicando}`
}

// Comandos con letras griegas, operadores y funciones que no llevan
// argumento entre llaves: se reemplazan directamente por su nombre hablado.
// El ORDEN IMPORTA: un comando que es prefijo literal de otro (ej. "\in" es
// prefijo de "\infty" e "\int") debe ir DESPUÉS del más largo, o el más
// largo nunca se reconocería completo.
const SIMBOLOS = [
  ['\\ldots', ' etcétera '],
  ['\\dots', ' etcétera '],
  ['\\rightarrow', ' produce '],
  ['\\Rightarrow', ' implica '],
  ['\\leftrightarrow', ' equivale a '],
  ['\\approx', ' aproximadamente igual a '],
  ['\\neq', ' distinto de '],
  ['\\leq', ' menor o igual que '],
  ['\\geq', ' mayor o igual que '],
  ['\\iint', ' integral doble de '],
  ['\\infty', ' infinito '],
  ['\\int', ' integral de '],
  ['\\notin', ' no pertenece a '],
  ['\\in', ' pertenece a '],
  ['\\times', ' por '],
  ['\\cdot', ' por '],
  ['\\div', ' entre '],
  ['\\pm', ' más menos '],
  ['\\mp', ' menos más '],
  ['\\partial', ' derivada parcial '],
  ['\\nabla', ' nabla '],
  ['\\subset', ' subconjunto de '],
  ['\\cup', ' unión '],
  ['\\cap', ' intersección '],
  ['\\forall', ' para todo '],
  ['\\exists', ' existe '],
  ['\\sum', ' sumatoria '],
  ['\\prod', ' productoria '],
  ['\\lim', ' límite '],
  ['\\det', ' determinante de '],
  ['\\mathbb{N}', ' los números naturales '],
  ['\\mathbb{Z}', ' los números enteros '],
  ['\\mathbb{Q}', ' los números racionales '],
  ['\\mathbb{R}', ' los números reales '],
  ['\\mathbb{C}', ' los números complejos '],
  ['\\to', ' tiende a '],
  ['\\alpha', ' alfa '], ['\\beta', ' beta '], ['\\gamma', ' gamma '], ['\\delta', ' delta '],
  ['\\epsilon', ' épsilon '], ['\\zeta', ' zeta '], ['\\eta', ' eta '], ['\\theta', ' theta '],
  ['\\iota', ' iota '], ['\\kappa', ' kappa '], ['\\lambda', ' lambda '], ['\\mu', ' mu '],
  ['\\nu', ' nu '], ['\\xi', ' xi '], ['\\sigma', ' sigma '], ['\\tau', ' tau '],
  ['\\phi', ' fi '], ['\\chi', ' chi '], ['\\psi', ' psi '], ['\\omega', ' omega '],
  ['\\pi', ' pi '], ['\\rho', ' ro '],
  ['\\Delta', ' Delta '], ['\\Sigma', ' Sigma '], ['\\Omega', ' Omega '], ['\\Gamma', ' Gamma '],
  ['\\Phi', ' Fi '], ['\\Psi', ' Psi '], ['\\Lambda', ' Lambda '], ['\\Theta', ' Theta '],
]

function resolverSimbolos(texto) {
  let resultado = texto
  for (const [comando, hablado] of SIMBOLOS) {
    resultado = resultado.split(comando).join(hablado)
  }
  return resultado
}

// Funciones trigonométricas y logarítmicas: se tratan aparte de SIMBOLOS
// porque en LaTeX un exponente pegado justo después de la función (como en
// \sin^2\theta) se aplica al RESULTADO de la función, no a la función en
// sí. Leído de forma genérica ("seno" + "al cuadrado" insertado donde
// apareció el "^") sonaría "seno de al cuadrado theta", en el orden
// equivocado; aquí se arma directamente como "seno al cuadrado de theta".
const NOMBRE_FUNCION = {
  sin: 'seno', cos: 'coseno', tan: 'tangente',
  sec: 'secante', csc: 'cosecante', cot: 'cotangente',
  ln: 'logaritmo natural', log: 'logaritmo',
}

// Consume el argumento de una función tipo \sin, que a diferencia de \frac
// o \sqrt casi nunca viene entre llaves: puede ser otro comando (\theta),
// una sola letra/número (x, 2) o quedar vacío si sigue algo que esta
// función no reconoce (por ejemplo un paréntesis "(\alpha+\beta)"), en cuyo
// caso ese resto simplemente se deja intacto para que el resto del
// pipeline lo procese como texto normal.
function extraerArgumentoFuncion(texto, inicio) {
  if (texto[inicio] === '{') {
    const g = extraerLlaves(texto, inicio)
    return g ? { valor: convertirFormula(g.valor), siguienteIndice: g.siguienteIndice } : null
  }
  if (texto[inicio] === '\\') {
    const m = texto.slice(inicio).match(/^\\[a-zA-Z]+/)
    if (m) return { valor: convertirFormula(m[0]), siguienteIndice: inicio + m[0].length }
  }
  const m = texto.slice(inicio).match(/^[a-zA-Z0-9]+/)
  if (m) return { valor: m[0], siguienteIndice: inicio + m[0].length }
  return null
}

function resolverFuncionesTrig(texto) {
  let resultado = texto
  for (const [comando, nombre] of Object.entries(NOMBRE_FUNCION)) {
    const patron = `\\${comando}`
    let out = ''
    let resto = resultado
    let i = resto.indexOf(patron)

    while (i !== -1) {
      let cursor = i + patron.length
      let potencia = null

      if (resto[cursor] === '^') {
        const arg = extraerArgumento(resto, cursor + 1)
        if (arg) { potencia = arg.valor; cursor = arg.siguienteIndice }
      }

      const arg = extraerArgumentoFuncion(resto, cursor)
      const frase = potencia
        ? `${nombre}${textoExponente(potencia)} de ${arg ? arg.valor : ''}`
        : `${nombre} de ${arg ? arg.valor : ''}`

      out += resto.slice(0, i) + ` ${frase} `
      resto = resto.slice(arg ? arg.siguienteIndice : cursor)
      i = resto.indexOf(patron)
    }

    resultado = out + resto
  }
  return resultado
}

// Convierte UNA fórmula (el contenido que va entre $...$ o $$...$$, sin los
// delimitadores) a su lectura en español. Es la función central: cada
// comando con argumentos se resuelve llamándose a sí misma sobre ese
// argumento, así que las fórmulas anidadas se resuelven de adentro hacia
// afuera de forma natural.
function convertirFormula(latex) {
  let texto = latex

  // Comandos de espaciado sin significado propio (\, \; \! \quad \qquad):
  // se descartan antes que nada para que no queden como texto suelto.
  texto = texto.replace(/\\[,;!]|\\quad|\\qquad/g, ' ')

  // \dfrac y \tfrac son variantes de \frac (fuerzan tamaño de displaystyle o
  // textstyle respectivamente; ver components/Latex.jsx), y \cfrac se usa
  // para fracciones continuas: las tres se leen igual que \frac. Van antes
  // que "frac" a propósito: aunque "\dfrac"/"\tfrac"/"\cfrac" no contienen a
  // "\frac" como subcadena (por la letra intermedia), procesarlas primero
  // evita depender de ese detalle si en el futuro cambia el patrón de busca.
  texto = aplicarComando(texto, 'dfrac', 2, (num, den) => `${num} entre ${den}`)
  texto = aplicarComando(texto, 'tfrac', 2, (num, den) => `${num} entre ${den}`)
  texto = aplicarComando(texto, 'cfrac', 2, (num, den) => `${num} entre ${den}`)
  texto = aplicarComando(texto, 'frac', 2, (num, den) => `${num} entre ${den}`)
  texto = aplicarComando(texto, 'sqrt', 1, (radicando, indice) => textoRaiz(radicando, indice))
  texto = aplicarComando(texto, 'vec', 1, (v) => `vector ${v}`)
  texto = aplicarComando(texto, 'overline', 1, (v) => `${v} periódico`)
  // \text{...} es prosa normal metida en modo matemático (p. ej. "casos
  // favorables" dentro de una fracción de probabilidad): se lee tal cual.
  texto = aplicarComando(texto, 'text', 1, (contenido) => contenido)

  // \left y \right son solo pistas de tamaño para KaTeX; el paréntesis o
  // corchete que acompañan se deja tal cual (la mayoría de los lectores de
  // voz ya hacen una pausa natural con ( ) sin necesidad de anunciarlos).
  texto = texto.split('\\left').join('').split('\\right').join('')

  // Va antes del sufijo genérico de "^" para poder reconocer el caso
  // especial \sin^2\theta (ver comentario en resolverFuncionesTrig).
  texto = resolverFuncionesTrig(texto)

  texto = aplicarSufijo(texto, '^', textoExponente)
  texto = aplicarSufijo(texto, '_', textoSubindice)

  // Valor absoluto: |x| -> "valor absoluto de x". No anida en el contenido
  // real de la app, así que un regex simple es suficiente y más legible que
  // un escaneo de llaves.
  texto = texto.replace(/\|([^|]+)\|/g, (_, contenido) => ` valor absoluto de ${convertirFormula(contenido)} `)

  texto = resolverSimbolos(texto)

  // Operadores y relaciones sueltos ("+", "-"/"−", ">", "<", "="): igual que
  // el signo menos, muchos motores de voz los leen mal, los omiten en
  // silencio o los pronuncian en inglés (así "2x+3 > 11" puede sonar
  // "dos equis tres once", sin el "más" ni el "mayor que"). Se hacen
  // explícitos en vez de confiar en que el lector los interprete solo.
  texto = texto.replace(/\+/g, ' más ')
  texto = texto.replace(/[-−]/g, ' menos ')
  texto = texto.replace(/>/g, ' mayor que ')
  texto = texto.replace(/</g, ' menor que ')
  texto = texto.replace(/=/g, ' igual a ')

  // Limpieza final: llaves sueltas que hayan quedado de un comando no
  // reconocido, y espacios repetidos.
  texto = texto.replace(/[{}]/g, ' ').replace(/\s+/g, ' ').trim()

  return texto
}

// Punto de entrada: recibe el texto completo de una pregunta (prosa mezclada
// con fórmulas entre $...$ / $$...$$) y devuelve la versión lista para
// pasarle a la síntesis de voz, con cada fórmula ya traducida.
export function convertirTextoParaVoz(texto) {
  if (typeof texto !== 'string' || !texto.includes('$')) return texto

  return texto.replace(REGEX_MATH, (_coincidencia, bloque, enLinea) => {
    const formula = bloque !== undefined ? bloque : enLinea
    return ` ${convertirFormula(formula.trim())} `
  }).replace(/\s+/g, ' ').trim()
}
