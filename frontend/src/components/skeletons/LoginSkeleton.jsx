// LoginSkeleton.jsx
// Silueta del primer paso de pages/Login.jsx (correo) para el fallback de
// <Suspense> de su ruta: barra con cerrar + marca, título grande, un campo,
// y abajo el botón principal y el de Google. Los textos fijos (marca,
// "Inicia sesión") se muestran de verdad.

import { Skeleton, SkeletonPantalla } from '../Skeleton'
import MarcaPrepaApp from '../MarcaPrepaApp'

export default function LoginSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 0' }}>
        <Skeleton circle height={36} style={{ margin: 4 }} />
        <MarcaPrepaApp size={18} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 24px 24px', gap: 22 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Inicia sesión</h1>
            <Skeleton width={190} height={12} />
          </div>
          <Skeleton height={50} radius={12} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton height={52} radius={14} />
          <Skeleton height={52} radius={14} style={{ marginTop: 22 }} />
        </div>
      </div>
    </SkeletonPantalla>
  )
}
