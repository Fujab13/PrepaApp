// FormularioAreaSkeleton.jsx
// Silueta de pages/FormularioArea.jsx para el fallback de <Suspense> de su
// ruta: barra con "Formulario Área" y su barra de progreso, las primeras
// tres secciones (con su título y color de acento reales — son fijos) con
// la forma de sus campos, y el botón fijo de abajo. Mismas clases
// (.sp-card de Seccion.jsx) y el mismo acento() que la página real.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

const CAMPO = 44

function SeccionSilueta({ titulo, color, children }) {
  return (
    <div className="sp-card" style={{ borderTop: `2.5px solid ${color}`, paddingTop: 10, gap: 4, margin: 0 }}>
      <div className="sp-card-header" style={{ alignItems: 'center' }}>
        <div className="sp-card-icon" style={{ background: `${color}22` }} />
        <div className="sp-card-body">
          <p className="sp-card-title">{titulo}</p>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

function Chips({ anchos }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {anchos.map((ancho, i) => (
        <Skeleton key={i} width={ancho} height={CAMPO} radius={999} sutil />
      ))}
    </div>
  )
}

export default function FormularioAreaSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando formulario…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra titulo="Formulario Área" style={{ flexWrap: 'wrap', paddingBottom: 10, rowGap: 10 }} />
      <div style={{ padding: '0 16px' }}>
        <Skeleton height={3} radius={999} />
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 90 }}>
        <SeccionSilueta titulo="Datos personales" color="#4f8ef7">
          <Skeleton height={CAMPO} radius={12} sutil />
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton height={CAMPO} radius={12} sutil style={{ flex: 1 }} />
            <Skeleton height={CAMPO} radius={12} sutil style={{ flex: 1 }} />
          </div>
          <Skeleton height={CAMPO} radius={12} sutil />
        </SeccionSilueta>

        <SeccionSilueta titulo="Grado de preparatoria" color="#7c5cbf">
          <Chips anchos={[92, 92, 92]} />
        </SeccionSilueta>

        <SeccionSilueta titulo="Área a la que deseas aplicar" color="#f59e0b">
          <Chips anchos={[124, 98, 140, 110]} />
          <Skeleton height={CAMPO} radius={12} sutil />
        </SeccionSilueta>
      </div>

      <div className="page-footer-fixed">
        <Skeleton height={44} radius={10} style={{ flex: 1 }} />
      </div>
    </SkeletonPantalla>
  )
}
