import { memo, useId } from 'react'

// Sombra + brillo aplicados a TODAS las mascotas por defecto — lo que antes
// eran <rect> planos ahora se leen como una pieza con algo de peso y
// volumen en vez de un ícono plano: una sombra ajustada (da nitidez, la
// "apoya" sobre lo que tenga detrás), una más difusa debajo (profundidad),
// y un brillo suave alrededor (el "pop" pulido). Son varios drop-shadow en
// cadena (CSS los compone, no se pisan entre sí) — a diferencia de un
// box-shadow, drop-shadow respeta el alfa real del SVG (la silueta exacta
// del sprite), no un rectángulo. Se puede pisar pasando `style.filter`.
const SOMBRA_BRILLO =
  'drop-shadow(0 1px 0 rgba(0, 0, 0, 0.4)) ' +
  'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.28)) ' +
  'drop-shadow(0 0 3px rgba(255, 255, 255, 0.16))'

// Renderiza un sprite de pixel art a partir de una rejilla de texto (ver
// data/mascotas.js): cada fila es un string, cada carácter es una celda —
// '.' es transparente, cualquier otro carácter se busca en `paleta` para
// saber de qué color pintar esa celda. Un <rect> de 1x1 unidad de viewBox
// por celda + shapeRendering="crispEdges" mantiene los bordes nítidos sin
// importar el tamaño final (nada de imágenes/assets externos).
//
// `tinte`: un color (o null/undefined para ninguno) que se compone sobre el
// sprite mediante un <filter> — SOLO donde ya hay píxeles pintados
// (feComposite con SourceAlpha como máscara), así respeta la silueta exacta
// del dibujo en vez de ser un rectángulo de color por encima. Lo usa
// Mascota.jsx para dos señales de color, estilo flash de Minecraft: rojo
// cuando una mascota está en pelea, verde cuando la acaban de alimentar.
// memo: grid/paleta/style suelen ser referencias estables (datos estáticos
// de data/mascotas.js, o cacheadas — ver paletaSilueta) entre un render y
// el siguiente de quien la usa (Mascota.jsx, Store.jsx, MascotaCompanera.jsx)
// — sin esto, cada re-render de esas páginas reconstruía el SVG completo
// (un <rect> por celda, hasta ~256) de cada mascota mostrada, aunque nada
// de lo que se ve hubiera cambiado.
const PixelArt = memo(function PixelArt({ grid, paleta, size = 8, flip = false, tinte = null, style }) {
  const filas = grid.length
  const columnas = grid[0]?.length || 0
  const idFiltro = `pixel-art-tinte-${useId()}`

  return (
    <svg
      width={columnas * size}
      height={filas * size}
      viewBox={`0 0 ${columnas} ${filas}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, filter: SOMBRA_BRILLO, ...style }}
    >
      {tinte && (
        <defs>
          <filter id={idFiltro} x="-20%" y="-20%" width="140%" height="140%">
            <feFlood floodColor={tinte} floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="SourceAlpha" operator="in" result="colorRecortado" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="colorRecortado" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={tinte ? `url(#${idFiltro})` : undefined}>
        {grid.map((fila, y) => (
          [...fila].map((celda, x) => {
            const color = paleta[celda]
            if (celda === '.' || !color) return null
            return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          })
        ))}
      </g>
    </svg>
  )
})

export default PixelArt
