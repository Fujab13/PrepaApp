// AjustesSkeleton.jsx
// Replica la estructura completa de Ajustes sin renderizar contenedores
// cargados por componentes hijos, evitando skeletons superpuestos.

import { Skeleton, SkeletonPantalla, SkeletonBarra } from '../Skeleton'
import RecordatoriosAjustesSkeleton from './RecordatoriosAjustesSkeleton'

const ENCABEZADO = {
  color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
}

const TARJETA = {
  background: 'var(--surface2)', borderRadius: 'var(--radius)', overflow: 'hidden',
}

const FILA = {
  minHeight: 68, display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 16px',
}

function TarjetaFilas({ filas, accion = 78 }) {
  return (
    <div style={TARJETA}>
      {filas.map((filasFila, i) => (
        <div key={i} style={{ ...FILA, borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton width={filasFila} height={13} radius={5} sutil />
          </div>
          <Skeleton width={accion} height={44} radius={12} sutil />
        </div>
      ))}
    </div>
  )
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
        <TarjetaFilas filas={['58%']} />

        <p style={{ ...ENCABEZADO, marginTop: 8 }}>Notificaciones</p>
        <RecordatoriosAjustesSkeleton />

        <p style={{ ...ENCABEZADO, marginTop: 8 }}>Música</p>
        <div style={TARJETA}>
          <div style={FILA}>
            <div style={{ flex: 1 }}><Skeleton width="53%" height={13} radius={5} sutil /></div>
            <Skeleton circle height={44} sutil />
            <Skeleton width={56} height={44} radius={14} sutil />
          </div>
          <div style={{ ...FILA, minHeight: 48, borderTop: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}><Skeleton width="24%" height={13} radius={5} sutil /></div>
            <Skeleton width={18} height={18} radius={5} sutil />
          </div>
        </div>

        <p style={{ ...ENCABEZADO, marginTop: 8 }}>Tus datos</p>
        <TarjetaFilas filas={['52%', '44%']} />

        <div style={{ ...TARJETA, ...FILA, width: '100%', marginTop: 4 }}>
          <div style={{ flex: 1 }}><Skeleton width="38%" height={13} radius={5} sutil /></div>
          <Skeleton width={18} height={18} radius={5} sutil />
        </div>
      </div>
    </SkeletonPantalla>
  )
}
