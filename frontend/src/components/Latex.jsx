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

import { Component } from 'react'
import { InlineMath, BlockMath } from 'react-katex'

// Reconoce $$...$$ (bloque) antes que $...$ (línea) para que un bloque no se
// interprete por error como dos fórmulas en línea consecutivas. La fórmula en
// línea no puede cruzar saltos de línea ni contener un "$" suelto.
const REGEX_MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

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
      partes.push(
        <InlineMath
          key={clave++}
          math={enLinea.trim()}
          renderError={() => <FormulaConError textoOriginal={coincidencia} />}
        />
      )
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
