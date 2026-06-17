export default function Hexagono({ progreso = 0, color = '#ff00ae', onClick, size = 200 }) {
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

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 200 200"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {triangulos.map((t, i) => (
        <polygon
          key={i}
          points={t.points}
          fill={t.activo ? color : '#22223b'}
          stroke="#444466"
          strokeWidth="2"
        />
      ))}
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