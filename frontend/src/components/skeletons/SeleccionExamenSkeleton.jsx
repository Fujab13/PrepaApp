// SeleccionExamenSkeleton.jsx
// Silueta de pages/SeleccionExamen.jsx para el fallback de <Suspense> de
// su ruta: barra con "Gratuitos" y la lista de tarjetas de examen
// (components/ExamenCard.jsx) — ícono de 52px, UNA línea con el nombre (no
// tienen descripción) y la flecha "›" a la derecha.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

// Anchos del nombre: variados para que no parezca rejilla.
const EXAMENES = ['52%', '38%', '61%', '45%', '57%', '41%']

export default function SeleccionExamenSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando exámenes…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra titulo="Gratuitos" />

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAMENES.map((ancho, i) => (
          <div
            key={i}
            className="skeleton-entrada"
            style={{
              background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 20,
              border: '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 16,
              animationDelay: `${0.2 + i * 0.05}s`,
            }}
          >
            <Skeleton width={52} height={52} radius={12} sutil />
            <Skeleton width={ancho} height={14} sutil />
            <span style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem', opacity: 0.5 }}>›</span>
          </div>
        ))}
      </div>
    </SkeletonPantalla>
  )
}
