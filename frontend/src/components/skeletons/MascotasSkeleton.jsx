// MascotasSkeleton.jsx
// Silueta de pages/Mascota.jsx para el fallback de <Suspense> de su ruta:
// barra con "Mascotas" y el contador de comida, el marco del sandbox (380px
// de alto), el botón "Alimentar a todos" y la tarjeta "Tu colección" con
// su cuadrícula de 3 columnas (sprite, nombre, barra de felicidad).

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

const MASCOTAS = 6

export default function MascotasSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando tus mascotas…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra
        titulo="Mascotas"
        tituloStyle={{ fontSize: undefined }}
        derecha={<Skeleton width={56} height={28} radius={999} />}
      />

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 24, padding: 4, background: 'linear-gradient(145deg, var(--surface2), var(--surface))' }}>
          <Skeleton height={380} radius={20} sutil />
        </div>

        <Skeleton height={48} radius={14} />

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16,
        }}>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
          }}>
            Tu colección
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Array.from({ length: MASCOTAS }, (_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 8px',
                }}
              >
                <Skeleton width={48} height={48} radius={8} sutil />
                <Skeleton width="60%" height={10} sutil />
                <Skeleton height={4} radius={999} sutil />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPantalla>
  )
}
