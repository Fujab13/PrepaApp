// SeleccionExamenSkeleton.jsx
// Silueta de pages/SeleccionExamen.jsx para el fallback de <Suspense> de
// su ruta: barra con "Gratuitos" y la tómbola de tarjetas
// (components/TombolaExamenes.jsx) vista de frente: la tarjeta del centro
// completa y sus vecinas achatadas y tenues, como en el cilindro; debajo la
// lista de submaterias y abajo los botones anterior / Empezar / siguiente.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

// Vista frontal simplificada de la tómbola: un cilindro vertical con las
// tarjetas recortadas dentro, imitando el mismo espacio que el componente real.
const TARJETAS = [
  { y: 26, alto: 42, ancho: '42%', opacidad: 0.2 },
  { y: 74, alto: 58, ancho: '72%', opacidad: 0.42 },
  { y: 102, alto: 84, ancho: '100%', opacidad: 1 },
  { y: 194, alto: 58, ancho: '72%', opacidad: 0.42 },
  { y: 246, alto: 42, ancho: '42%', opacidad: 0.2 },
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
        <div
          className="skeleton-entrada"
          aria-hidden="true"
          style={{
            position: 'relative', width: '100%', height: 270, overflow: 'hidden',
            borderRadius: '48% / 14%', animationDelay: '0.15s',
            background: 'linear-gradient(90deg, color-mix(in srgb, var(--surface2) 72%, transparent), var(--surface2) 18%, var(--surface) 50%, var(--surface2) 82%, color-mix(in srgb, var(--surface2) 72%, transparent))',
            border: '1px solid var(--border)',
            boxShadow: 'inset 24px 0 30px -28px rgba(0,0,0,.7), inset -24px 0 30px -28px rgba(0,0,0,.7)',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 34, zIndex: 4,
            background: 'linear-gradient(to bottom, var(--bg), transparent)', opacity: .75,
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, zIndex: 4,
            background: 'linear-gradient(to top, var(--bg), transparent)', opacity: .75,
          }} />
          {TARJETAS.map(({ y, alto, ancho, opacidad }, i) => {
            const central = i === 2
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: '50%', top: y, height: alto,
                  width: ancho, transform: 'translateX(-50%)', opacity: opacidad,
                  zIndex: central ? 3 : 2, overflow: 'hidden',
                  borderRadius: central ? 'var(--radius)' : 12,
                  padding: central ? '0 16px' : '0 12px',
                  border: `1px solid ${central ? 'var(--border-strong)' : 'var(--border)'}`,
                  background: central ? 'var(--surface2)' : 'color-mix(in srgb, var(--surface2) 88%, transparent)',
                  boxShadow: central ? '0 12px 24px -18px rgba(0,0,0,.85)' : 'none',
                  display: 'flex', alignItems: 'center', gap: central ? 14 : 10,
                }}
              >
                <Skeleton
                  width={central ? 48 : 34}
                  height={central ? 48 : 34}
                  radius={central ? 12 : 9}
                  sutil
                />
                <Skeleton width={central ? '62%' : '48%'} height={central ? 14 : 10} radius={5} sutil />
              </div>
            )
          })}
        </div>

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
