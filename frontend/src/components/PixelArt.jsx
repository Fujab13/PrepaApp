// Renderiza un sprite de pixel art a partir de una rejilla de texto (ver
// data/mascotas.js): cada fila es un string, cada carácter es una celda —
// '.' es transparente, cualquier otro carácter se busca en `paleta` para
// saber de qué color pintar esa celda. Un <rect> de 1x1 unidad de viewBox
// por celda + shapeRendering="crispEdges" mantiene los bordes nítidos sin
// importar el tamaño final (nada de imágenes/assets externos).
export default function PixelArt({ grid, paleta, size = 8, flip = false, style }) {
  const filas = grid.length
  const columnas = grid[0]?.length || 0

  return (
    <svg
      width={columnas * size}
      height={filas * size}
      viewBox={`0 0 ${columnas} ${filas}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    >
      {grid.map((fila, y) => (
        [...fila].map((celda, x) => {
          const color = paleta[celda]
          if (celda === '.' || !color) return null
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
        })
      ))}
    </svg>
  )
}
