// LeccionSkeleton.jsx
// Silueta de pages/Leccion.jsx mientras carga: barra superior (salir, ícono
// de materia, hexágono de progreso, barra, utilidades), contador "Correctas
// / Unidad", tarjeta de la pregunta (con sus botones de IA/lectura) y cuatro
// opciones. Usa las mismas clases de página, paddings y medidas que la
// lección real (ver OpcionBtn.jsx y Hexagono.jsx) para que el cambio al
// contenido no "salte".
//
// `color`/`icono` son de la materia y son opcionales: en el fallback de
// <Suspense> todavía no se conocen, pero dentro de Leccion.jsx a veces sí —
// y lo que ya se sabe se muestra de verdad (ícono real, acentos del color).

import { Skeleton, SkeletonTexto, SkeletonPantalla } from '../Skeleton'
import { renderIconoMateria } from '../../utils/renderIconoMateria'

// Anchos del texto de cada opción: variados para que no parezca rejilla.
const OPCIONES = ['62%', '48%', '71%', '40%']

// Hexágono con punta arriba, como Hexagono.jsx (proporción ancho:alto
// de √3:2).
const HEXAGONO = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'

const estiloEtiqueta = { color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }

export default function LeccionSkeleton({ color, icono }) {
  // Tinte tenue del color de la materia (hex + alfa) para el hexágono y la
  // pista de la barra; sin materia, se quedan con el tono neutro.
  const tinte = color ? { background: `${color}2e` } : undefined

  return (
    <SkeletonPantalla
      etiqueta="Preparando tu lección…"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}
    >
      <div className="page-topbar-compact" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <Skeleton circle height={36} />

        {icono ? (
          <span style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', color, flexShrink: 0 }}>
            {renderIconoMateria(icono)}
          </span>
        ) : (
          <Skeleton circle height={30} />
        )}

        {/* A 1/3 del hexágono real (≈57×66): una pista discreta de que ahí
            va el hexágono, sin robarle protagonismo al resto de la silueta. */}
        <Skeleton
          width={19}
          height={22}
          radius={0}
          style={{ clipPath: HEXAGONO, ...tinte }}
        />

        <Skeleton height={6} radius={99} style={{ flex: 1, ...tinte }} />

        <div style={{ display: 'flex', gap: 12, paddingRight: 4 }}>
          <Skeleton circle height={20} />
          <Skeleton circle height={20} />
        </div>
      </div>

      <div className="page-content-compact" style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Las etiquetas son fijas, solo los números dependen de datos. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <p style={estiloEtiqueta}>Correctas</p>
            <Skeleton width={34} height={12} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Unidad</p>
            <Skeleton width={14} height={10} />
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
          borderRadius: 6,
          padding: '20px 20px 12px',
          marginBottom: 46,
          borderLeft: `4px solid ${color || 'var(--surface2)'}`,
          boxShadow: '0 4px 16px -10px rgba(0,0,0,0.6)',
        }}>
          <SkeletonTexto lineas={3} alto={13} separacion={12} ultima="45%" sutil />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Skeleton circle height={32} sutil />
            <Skeleton circle height={32} sutil />
            <Skeleton width={34} height={20} radius={999} sutil style={{ margin: '0 5px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPCIONES.map((ancho, i) => (
            <div
              key={i}
              className="skeleton-tarjeta skeleton-entrada"
              style={{
                borderWidth: 2, padding: '21px 20px', display: 'flex', alignItems: 'center',
                boxShadow: '0 3px 10px -4px rgba(0,0,0,0.45)',
                animationDelay: `${0.2 + i * 0.07}s`,
              }}
            >
              <Skeleton width={ancho} height={13} sutil />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPantalla>
  )
}
