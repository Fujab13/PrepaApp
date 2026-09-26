// RankingSkeleton.jsx
// Siluetas de pages/Tutorias.jsx (la pantalla "Ranking"):
// - RankingSemanalSkeleton: el contenido de la tarjeta "Ranking Semanal"
//   mientras llega el RPC — podio de 3 (2º, 1º, 3º, con las mismas alturas
//   de pedestal) y las primeras filas de la lista.
// - default: la página completa, para el fallback de <Suspense> de la ruta.
//   Los textos fijos (títulos) se muestran de verdad: solo se "sombrea" lo
//   que depende de datos.

import { Skeleton, SkeletonPantalla } from '../Skeleton'

const FILAS_LISTA = 6

// Mismo orden visual (2º, 1º, 3º) y medidas que ColumnaPodio en Tutorias.jsx.
const PODIO = [
  { corona: 41, pedestal: 40 },
  { corona: 49, pedestal: 54 },
  { corona: 41, pedestal: 30 },
]

function ContenidoRankingSemanal() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
        {PODIO.map(({ corona, pedestal }, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, maxWidth: 118, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton circle height={corona} sutil style={{ marginBottom: 12 }} />
            <Skeleton width="68%" height={11} sutil />
            <Skeleton width="36%" height={9} sutil style={{ marginTop: 6, marginBottom: 9 }} />
            <Skeleton height={pedestal} radius="10px 10px 4px 4px" sutil />
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: 14, overflow: 'hidden' }}>
        {Array.from({ length: FILAS_LISTA }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < FILAS_LISTA - 1 ? '1px solid var(--surface2)' : 'none',
            }}
          >
            <Skeleton width={16} height={11} style={{ margin: '0 2px' }} />
            {/* Anchos variados para que no parezca una rejilla. */}
            <Skeleton width={`${35 + ((i * 17) % 30)}%`} height={11} />
            <span style={{ flex: 1 }} />
            <Skeleton width={40} height={11} />
          </div>
        ))}
      </div>
    </>
  )
}

export function RankingSemanalSkeleton() {
  return (
    <SkeletonPantalla etiqueta="Cargando ranking…">
      <ContenidoRankingSemanal />
    </SkeletonPantalla>
  )
}

export default function RankingSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando ranking…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <Skeleton circle height={36} />
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Ranking</h2>
      </div>
      <div className="page-content-compact">
        <div style={{
          borderRadius: 'var(--radius)',
          padding: '22px 16px 18px',
          marginTop: 6,
          background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
          border: '0.5px solid var(--border)',
        }}>
          <p style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.3, textAlign: 'center' }}>
            Ranking Semanal
          </p>
          <ContenidoRankingSemanal />
        </div>
      </div>
    </SkeletonPantalla>
  )
}
