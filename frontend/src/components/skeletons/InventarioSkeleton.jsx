// InventarioSkeleton.jsx
// Siluetas de pages/Inventario.jsx:
// - ColeccionSkeleton: la colección mientras carga — encabezado "Tu
//   colección" (texto fijo, se muestra de verdad) y la cuadrícula de 3
//   columnas con tarjetas de ícono + nombre. Sin el brillo azul "neón" del
//   panel real: un skeleton es neutro por definición.
// - default: la página completa (barra con "Inventario" + colección), para
//   el fallback de <Suspense> de la ruta.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

const TARJETAS = 6

function ContenidoColeccion() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{
        color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
      }}>
        Tu colección
      </p>

      <div style={{
        background: 'var(--surface2)', borderRadius: 16, padding: 12,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {Array.from({ length: TARJETAS }, (_, i) => (
          <div
            key={i}
            className="skeleton-tarjeta skeleton-entrada"
            style={{
              borderRadius: 14, minHeight: 92, padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              animationDelay: `${0.2 + i * 0.05}s`,
            }}
          >
            <Skeleton width={32} height={32} radius={10} sutil />
            <Skeleton width="70%" height={10} sutil />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ColeccionSkeleton() {
  return (
    <SkeletonPantalla etiqueta="Cargando tu inventario…">
      <ContenidoColeccion />
    </SkeletonPantalla>
  )
}

export default function InventarioSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando tu inventario…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra titulo="Inventario" tituloStyle={{ fontSize: undefined }} />
      <div className="page-content-compact">
        <ContenidoColeccion />
      </div>
    </SkeletonPantalla>
  )
}
