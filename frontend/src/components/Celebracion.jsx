const PUNTOS = Array.from({ length: 8 }, (_, i) => i)

// Overlay de puntos que estallan y se desvanecen (CSS puro). Se coloca
// dentro de un contenedor con position:relative y se monta solo mientras
// `activo` es true; quien lo usa decide cuánto tiempo mantenerlo montado.
export default function Celebracion({ activo, color = '#7c5cbf' }) {
  if (!activo) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 40,
      }}
    >
      {PUNTOS.map(i => (
        <span
          key={i}
          className="gm-punto"
          style={{ background: color, '--a': `${(360 / PUNTOS.length) * i}deg` }}
        />
      ))}
    </div>
  )
}
