// AjustesSkeleton.jsx
// Silueta de pages/Ajustes.jsx mientras se cuentan los datos del usuario (y
// fallback de <Suspense> de su ruta): barra con "Ajustes", sección "Tu
// cuenta" (usuario) y "Tus datos" con una fila por opción. Los títulos son
// fijos y se muestran de verdad; solo el estado y el botón se sombrean.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'

const FILAS = ['Resultados del examen', 'Formulario de área']

const ENCABEZADO = {
  color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
}

export default function AjustesSkeleton() {
  return (
    <SkeletonPantalla
      etiqueta="Cargando ajustes…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <SkeletonBarra titulo="Ajustes" />
      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={ENCABEZADO}>Tu cuenta</p>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Skeleton width={130} height={13} sutil />
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>Tu nombre en el ranking</p>
          </div>
          <Skeleton width={78} height={44} radius={12} sutil />
        </div>

        <p style={{ ...ENCABEZADO, marginTop: 8 }}>Tus datos</p>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {FILAS.map((titulo, i) => (
            <div
              key={titulo}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{titulo}</p>
                <Skeleton width={120} height={10} sutil />
              </div>
              <Skeleton width={78} height={44} radius={12} sutil />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPantalla>
  )
}
