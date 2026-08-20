import { useId } from 'react'
import { triggerVibration } from '../utils/haptics'

export default function Hexagono({ progreso = 0, color = '#ff00ae', onClick, size = 200 }) {
  const uid = useId().replace(/:/g, '')
  const cx = size / 2, cy = size / 2, r = (size / 2) * 0.8

  const triangulos = Array.from({ length: 6 }, (_, i) => {
    const ang1 = (Math.PI / 180) * (60 * i - 90)
    const ang2 = (Math.PI / 180) * (60 * (i + 1) - 90)
    const x1 = cx + r * Math.cos(ang1)
    const y1 = cy + r * Math.sin(ang1)
    const x2 = cx + r * Math.cos(ang2)
    const y2 = cy + r * Math.sin(ang2)
    return { points: `${cx},${cy} ${x1},${y1} ${x2},${y2}`, activo: i < progreso }
  })

  const puntosHexagono = triangulos.map((t) => t.points.split(' ')[1]).join(' ')

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 200 200"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerDown={e => onClick && (e.currentTarget.style.transform = 'scale(0.94)')}
      onPointerUp={e => {
        if (!onClick) return
        e.currentTarget.style.transform = 'scale(1)'
        triggerVibration('success')
      }}
      onPointerCancel={e => onClick && (e.currentTarget.style.transform = 'scale(1)')}
    >
      <defs>
        <clipPath id={`hg-clip-${uid}`}>
          <polygon points={puntosHexagono} />
        </clipPath>

        {/* Luz direccional fija, como si el hexágono fuera una gema facetada:
            cada triángulo comparte el mismo gradiente (coordenadas fijas en
            el lienzo, no por-forma), así que todas las facetas leen la luz
            desde el mismo ángulo. */}
        <linearGradient id={`hg-faceta-${uid}`} gradientUnits="userSpaceOnUse" x1={cx - r * 0.6} y1={cy - r} x2={cx + r * 0.4} y2={cy + r}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>

        {/* Mismo efecto que el botón "Empezar lección" de Home.jsx
            (background: linear-gradient(355deg, color, #ffffffbe)):
            del color de la materia a un blanco translúcido, casi vertical
            con una leve inclinación. userSpaceOnUse + coordenadas fijas del
            hexágono completo (no por-triángulo) para que las 6 facetas
            compartan un único degradado continuo, en vez de uno repetido
            por cada triángulo. */}
        <linearGradient id={`hg-activo-${uid}`} gradientUnits="userSpaceOnUse" x1={cx + r * 0.09} y1={cy + r} x2={cx - r * 0.09} y2={cy - r}>
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#ffffffbe" />
        </linearGradient>

        {/* Barra de brillo metálico: un degradado diagonal angosto (glint),
            definido en su propio bounding box para que su ancho escale con
            el tamaño del rect que lo porta, no con el hexágono. */}
        <linearGradient id={`hg-brillo-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
          <stop offset="40%"  stopColor="#ffffff" stopOpacity="0" />
          <stop offset="47%"  stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="1" />
          <stop offset="53%"  stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%"  stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

      </defs>

      {triangulos.map((t, i) => (
        <polygon
          key={i}
          points={t.points}
          fill={t.activo ? `url(#hg-activo-${uid})` : '#22223b'}
          stroke="#444466"
          strokeWidth="2"
        />
      ))}

      <polygon
        points={puntosHexagono}
        fill={`url(#hg-faceta-${uid})`}
        clipPath={`url(#hg-clip-${uid})`}
        style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
      />
      {/* Brillo metálico: una barra diagonal angosta que recorre el
          hexágono cada 7s (ver .hg-brillo-barra en global.css) y luego
          queda oculta fuera del hexágono el resto del ciclo. El hexágono
          (clipPath) se queda fijo; solo el rect interior se traslada. */}
      <g clipPath={`url(#hg-clip-${uid})`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
        <rect
          className="hg-brillo-barra"
          x={cx - r * 1.5} y={cy - r * 1.5}
          width={r * 3} height={r * 3}
          fill={`url(#hg-brillo-${uid})`}
        />
      </g>

      <text
        x={cx} y={cy + 6}
        textAnchor="middle"
        fill="#fff"
        fontSize="16"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {progreso}/6
      </text>
    </svg>
  )
}