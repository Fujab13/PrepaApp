// TiendaSkeleton.jsx
// Siluetas de pages/Store.jsx:
// - ProductosPremiumSkeleton: la sección de productos de dinero real
//   mientras llega la tabla `productos` (los artículos de monedas son fijos
//   y se ven de inmediato): encabezado de categoría + una tarjeta con la
//   forma de tarjetaPremium() — ícono, insignia, nombre, descripción, y
//   debajo precio y botón.
// - default: la página completa, para el fallback de <Suspense> de la ruta:
//   barra con "Tienda" y saldo, la sección de arriba, el separador "Con
//   monedas" y un par de tarjetas de monedas (forma de tarjetaGenerica()).

import { Skeleton, SkeletonTexto, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

function ContenidoProductosPremium() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width={96} height={10} />

      <div style={{
        borderRadius: 'var(--radius)',
        padding: 16,
        background: 'var(--surface2)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Skeleton width={52} height={52} radius={14} sutil />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={78} height={14} radius={999} sutil />
            <Skeleton width="60%" height={13} sutil />
            <SkeletonTexto lineas={2} alto={10} separacion={7} ultima="70%" sutil />
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid var(--border)',
        }}>
          <Skeleton width={70} height={20} sutil />
          <Skeleton width={112} height={44} radius={12} sutil />
        </div>
      </div>
    </div>
  )
}

function TarjetaMonedas() {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Skeleton width={46} height={46} radius={12} sutil />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 3 }}>
          <Skeleton width="50%" height={13} sutil />
          <SkeletonTexto lineas={2} alto={10} separacion={7} ultima="60%" sutil />
        </div>
      </div>
      <Skeleton height={40} radius={10} sutil />
    </div>
  )
}

export function ProductosPremiumSkeleton() {
  return (
    <SkeletonPantalla etiqueta="Cargando tienda…">
      <ContenidoProductosPremium />
    </SkeletonPantalla>
  )
}

export default function TiendaSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando tienda…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra
        titulo="Tienda"
        tituloStyle={{ fontSize: '1.15rem', fontWeight: 700 }}
        derecha={<Skeleton width={58} height={22} radius={999} />}
        style={{ paddingTop: 16, paddingBottom: 16 }}
      />

      <div className="page-content-compact" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <ContenidoProductosPremium />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)',
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.3px',
        }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          Con monedas
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton width={110} height={10} />
          <TarjetaMonedas />
          <TarjetaMonedas />
        </div>
      </div>
    </SkeletonPantalla>
  )
}
