// Latex.jsx
// Renderiza texto que puede mezclar prosa normal con fórmulas matemáticas,
// usado por Leccion.jsx (pregunta, opciones) y TarjetaRepaso.jsx para que las
// materias con ecuaciones (Matemáticas) se vean tan bien como Español.
//
// Convención de las materias en /data/lecciones/*.json:
//   $...$    -> fórmula en línea, dentro del flujo del texto (ej. "el área es $A = \pi r^2$")
//   $$...$$  -> fórmula en bloque, centrada y en su propia línea (para ecuaciones largas)
//
// Robustez, por diseño:
// - Cada fórmula se renderiza con KaTeX de forma SÍNCRONA (ya viene empaquetado
//   en el build, no depende de red ni de una API externa), así que no hay
//   parpadeo de "cargando" ni fallas por conexión lenta.
// - Un error de sintaxis en UNA fórmula (ej. un LaTeX mal escrito en el JSON)
//   se atrapa y se muestra en su lugar el texto original, sin tumbar el resto
//   de la pregunta ni de la lección (ver renderError más abajo).
// - Un error inesperado de cualquier tipo en el render (no solo de KaTeX) lo
//   atrapa además un ErrorBoundary de última instancia: en el peor caso se ve
//   el texto plano con los signos $, nunca una pantalla en blanco.
// - Las fórmulas en bloque van envueltas en un contenedor con scroll
//   horizontal propio (overflowX: auto): una ecuación o matriz ancha se
//   desliza dentro de su caja en vez de romper el layout de la página o
//   obligar a hacer scroll horizontal en toda la pantalla.
//
// IMPORTANTE al usar <Latex texto={...} />: el contenedor donde se coloca
// debe ser un <div> (o similar), nunca un <p>. Si el texto trae "$$...$$",
// Latex termina generando un <div> internamente (así renderiza BlockMath en
// react-katex) y un <div> dentro de un <p> es HTML inválido.
//
// Fracciones en línea:
// Dentro de una fórmula $...$, KaTeX usa por defecto "textstyle" (el mismo
// estilo compacto que usaría un \frac dentro de una ecuación en línea de un
// artículo en LaTeX): el numerador y denominador se ven chicos, y si hay una
// fracción de fracción, la interior queda casi ilegible. En vez de simular
// una fracción como texto plano "a/b" (lo que se ve peor y dificulta anidar),
// promoverFraccionesDeNivelSuperior() reescribe cada \frac de nivel superior
// de la fórmula a \dfrac -equivalente estándar de LaTeX/amsmath para forzar
// tamaño de displaystyle en una fracción puntual-, dejando intactas las
// fracciones que ya vienen anidadas dentro de otra (numerador/denominador,
// exponente, etc.), que siguen viéndose proporcionalmente más chicas, tal
// como se vería una fracción de fracciones tipeada a mano en un documento.

import { Component } from 'react'
import { InlineMath, BlockMath } from 'react-katex'

// Reconoce $$...$$ (bloque) antes que $...$ (línea) para que un bloque no se
// interprete por error como dos fórmulas en línea consecutivas. La fórmula en
// línea no puede cruzar saltos de línea ni contener un "$" suelto.
const REGEX_MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

// Solo promueve el \frac que está al nivel superior de la fórmula (fuera de
// cualquier {...}); un \frac que ya está dentro de otro grupo -el
// numerador/denominador de otra fracción, un exponente, una raíz- se deja
// como está, para que KaTeX lo siga dibujando más chico según el contexto,
// igual que en LaTeX real.
function promoverFraccionesDeNivelSuperior(formula) {
  if (!formula.includes('\\frac')) return formula

  let resultado = ''
  let profundidad = 0

  for (let i = 0; i < formula.length; i++) {
    const c = formula[i]

    // "\{" y "\}" son llaves literales (p. ej. notación de conjuntos), no
    // delimitadores de grupo: se copian tal cual y no afectan la profundidad.
    if (c === '\\' && (formula[i + 1] === '{' || formula[i + 1] === '}')) {
      resultado += c + formula[i + 1]
      i += 1
      continue
    }

    if (profundidad === 0 && c === '\\' && formula.startsWith('\\frac', i)) {
      resultado += '\\dfrac'
      i += 4 // el for ya suma 1: en total salta las 5 letras de "\frac"
      continue
    }

    if (c === '{') profundidad++
    else if (c === '}') profundidad--
    resultado += c
  }

  return resultado
}

function FormulaConError({ textoOriginal }) {
  return (
    <span
      style={{ color: 'var(--wrong)', fontFamily: 'monospace', fontSize: '0.85em' }}
      title="Esta fórmula tiene un error de sintaxis LaTeX"
    >
      {textoOriginal}
    </span>
  )
}

// BlockMath renderiza internamente un <div>, así que este contenedor también
// debe serlo (un <div> dentro de un <span> es HTML inválido). Por eso Latex
// solo debe usarse dentro de contenedores de bloque (<div>), nunca dentro de
// un <p>, en cualquier lugar donde el texto pueda llegar a traer "$$...$$".
function ContenedorBloque({ children }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '8px 2px',
        margin: '6px 0',
      }}
    >
      {children}
    </div>
  )
}

function LatexContenido({ texto }) {
  const partes = []
  let ultimoIndice = 0
  let clave = 0

  REGEX_MATH.lastIndex = 0
  let match
  while ((match = REGEX_MATH.exec(texto)) !== null) {
    const [coincidencia, bloque, enLinea] = match

    if (match.index > ultimoIndice) {
      partes.push(
        <span key={clave++} style={{ whiteSpace: 'pre-line' }}>
          {texto.slice(ultimoIndice, match.index)}
        </span>
      )
    }

    if (bloque !== undefined) {
      partes.push(
        <ContenedorBloque key={clave++}>
          <BlockMath math={bloque.trim()} renderError={() => <FormulaConError textoOriginal={coincidencia} />} />
        </ContenedorBloque>
      )
    } else {
      const formula = enLinea.trim()
      const tieneFraccion = /\\d?c?frac/.test(formula)
      const math = (
        <InlineMath
          math={promoverFraccionesDeNivelSuperior(formula)}
          renderError={() => <FormulaConError textoOriginal={coincidencia} />}
        />
      )

      if (tieneFraccion) {
        // Una fracción en displaystyle es más alta que una línea de texto
        // normal; envolverla en inline-block con un pequeño margen vertical
        // le da aire respecto al renglón de arriba y de abajo, en vez de
        // quedar apretada contra el texto como si fuera un carácter más.
        partes.push(
          <span key={clave++} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0.18em 0.05em' }}>
            {math}
          </span>
        )
      } else {
        partes.push(<span key={clave++}>{math}</span>)
      }
    }

    ultimoIndice = match.index + coincidencia.length
  }

  if (ultimoIndice < texto.length) {
    partes.push(
      <span key={clave++} style={{ whiteSpace: 'pre-line' }}>
        {texto.slice(ultimoIndice)}
      </span>
    )
  }

  return <>{partes}</>
}

class LatexErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { fallo: false }
  }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error) {
    console.error('Error al renderizar una fórmula LaTeX, se muestra el texto plano:', error)
  }

  render() {
    if (this.state.fallo) {
      return <span style={{ whiteSpace: 'pre-line' }}>{this.props.textoOriginal}</span>
    }
    return this.props.children
  }
}

export default function Latex({ texto }) {
  if (typeof texto !== 'string' || texto === '') return null
  if (!texto.includes('$')) {
    // Atajo para el caso más común (texto sin fórmulas): evita el costo del
    // regex y del render de KaTeX cuando no hace ninguna falta.
    return <span style={{ whiteSpace: 'pre-line' }}>{texto}</span>
  }

  return (
    <LatexErrorBoundary textoOriginal={texto}>
      <LatexContenido texto={texto} />
    </LatexErrorBoundary>
  )
}
