// LecturaSkeleton.jsx
// Silueta de pages/Lectura.jsx para el fallback de <Suspense> de su ruta
// (la lectura no espera datos: sus temas son estáticos, solo se espera a
// que baje el código de la página). Barra superior con buscador, fila de
// pestañas de temas, UNA tarjeta (pages/Tarjeta.jsx: título + % + barra de
// progreso y la lista de subtemas con su casilla) y el pie fijo con
// Anterior / puntos / Siguiente. Mismas clases y medidas que la real.

import { Skeleton, SkeletonPantalla } from '../Skeleton'

// Anchos variados para que no parezca rejilla.
const PESTANAS = [96, 74, 118, 82]
const SUBTEMAS = ['58%', '72%', '46%', '66%', '52%', '78%']
const PUNTOS = 4

export default function LecturaSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando lectura…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}
    >
      <div className="page-topbar-compact" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <Skeleton circle height={36} />
        <Skeleton circle height={28} style={{ margin: '0 4px' }} />
        <Skeleton height={38} radius={10} style={{ flex: 1 }} />
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, overflow: 'hidden' }}>
        {PESTANAS.map((ancho, i) => (
          <Skeleton key={i} width={ancho} height={28} radius={20} />
        ))}
      </div>

      <div className="page-content-compact" style={{ flex: 1, paddingBottom: 90 }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Skeleton width="55%" height={16} sutil />
              <Skeleton width={28} height={10} sutil />
            </div>
            <Skeleton height={5} radius={999} sutil />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SUBTEMAS.map((ancho, i) => (
              <div
                key={i}
                className="skeleton-entrada"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', animationDelay: `${0.2 + i * 0.05}s` }}
              >
                <Skeleton circle height={20} sutil />
                <Skeleton width={ancho} height={12} sutil />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-footer-fixed">
        <Skeleton height={38} radius={10} style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {Array.from({ length: PUNTOS }, (_, i) => (
            <Skeleton key={i} width={i === 0 ? 16 : 6} height={6} radius={999} />
          ))}
        </div>
        <Skeleton height={38} radius={10} style={{ flex: 1 }} />
      </div>
    </SkeletonPantalla>
  )
}
