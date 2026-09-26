// ExamenSkeleton.jsx
// Silueta de pages/Examen.jsx mientras carga: barra superior (salir,
// sección, progreso, contador y cronómetro), chip "#n" + cronómetro de la
// pregunta, tarjeta de la pregunta y cuatro respuestas con su casilla de
// inciso. Mismas clases, paddings y radios que el examen real.

import { Skeleton, SkeletonTexto, SkeletonPantalla } from '../Skeleton'

// Anchos del texto de cada respuesta: variados para que no parezca rejilla.
const RESPUESTAS = ['58%', '74%', '46%', '66%']

export default function ExamenSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Preparando tu examen…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div className="page-topbar-compact" style={{ paddingTop: 14 }}>
        <Skeleton circle height={36} />
        <Skeleton width={58} height={10} />
        <Skeleton height={6} radius={99} style={{ flex: 1 }} />
        <Skeleton width={34} height={10} />
        <Skeleton width={52} height={10} />
      </div>

      <div className="page-content-compact" style={{ paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Skeleton width={40} height={24} radius={8} />
          <Skeleton width={62} height={28} radius={8} />
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '18px 16px', marginBottom: 14 }}>
          <SkeletonTexto lineas={3} alto={12} separacion={12} ultima="50%" sutil />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RESPUESTAS.map((ancho, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px',
              }}
            >
              <Skeleton width={26} height={26} sutil />
              <Skeleton width={ancho} height={11} sutil />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPantalla>
  )
}
