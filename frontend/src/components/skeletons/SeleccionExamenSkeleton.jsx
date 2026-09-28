// SeleccionExamenSkeleton.jsx
// Silueta de pages/SeleccionExamen.jsx para el fallback de <Suspense> de
// su ruta: barra con "Gratuitos" y la tómbola de tarjetas
// (components/TombolaExamenes.jsx) vista de frente: la tarjeta del centro
// completa y sus vecinas achatadas y tenues, como en el cilindro; debajo la
// lista de submaterias y abajo los botones anterior / Empezar / siguiente.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

// Por tarjeta, de arriba abajo: alto aparente, opacidad y ancho del nombre.
const TARJETAS = [
  { alto: 26, opacidad: 0.3, ancho: '40%' },
  { alto: 68, opacidad: 0.6, ancho: '52%' },
  { alto: 84, opacidad: 1, ancho: '61%' },
  { alto: 68, opacidad: 0.6, ancho: '45%' },
  { alto: 26, opacidad: 0.3, ancho: '38%' },
]

export default function SeleccionExamenSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando exámenes…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
    >
      <SkeletonBarra titulo="Gratuitos" />

      <div
        className="page-content-compact"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 8 }}
      >
        {TARJETAS.map(({ alto, opacidad, ancho }, i) => (
          <div
            key={i}
            className="skeleton-entrada"
            style={{
              width: '100%', maxWidth: 420, height: alto, opacity: opacidad, overflow: 'hidden',
              background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '0 16px',
              border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 14,
              animationDelay: `${0.2 + i * 0.05}s`,
            }}
          >
            {alto > 40 && <Skeleton width={48} height={Math.min(48, alto - 20)} radius={12} sutil />}
            <Skeleton width={ancho} height={14} sutil />
          </div>
        ))}

        <div style={{
          width: '100%', maxWidth: 420, marginTop: 28, padding: '4px 0',
          background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          {['58%', '44%', '66%', '50%'].map((ancho, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <Skeleton width={4} height={18} radius={2} sutil />
              <Skeleton width={ancho} height={12} sutil />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '14px 16px' }}>
        <Skeleton width={200} height={56} radius={16} />
        <Skeleton width={114} height={58} radius={16} sutil />
      </div>
    </SkeletonPantalla>
  )
}
