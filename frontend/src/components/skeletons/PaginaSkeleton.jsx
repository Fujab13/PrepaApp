// PaginaSkeleton.jsx
// Silueta genérica de "una página de la app" (barra superior con botón de
// salir + título, y unas tarjetas con ícono y texto): fallback de
// <Suspense> en App.jsx para las rutas que todavía no tienen una silueta
// propia. Una ruta que sí la tenga la declara en su propio <Suspense>.

import { Skeleton, SkeletonTexto, SkeletonPantalla } from '../Skeleton'

const TARJETAS = 3

export default function PaginaSkeleton() {
  return (
    <SkeletonPantalla style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <Skeleton circle height={36} />
        <Skeleton width={110} height={16} />
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: TARJETAS }, (_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 16,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}
          >
            <Skeleton width={46} height={46} radius={12} sutil />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <Skeleton width="45%" height={13} sutil />
              <SkeletonTexto lineas={2} alto={10} separacion={7} ultima="65%" sutil />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPantalla>
  )
}
