import { Skeleton } from '../Skeleton'

export const estiloTarjetaRecordatorios = {
  background: 'var(--surface2)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

export default function RecordatoriosAjustesSkeleton() {
  return (
    <div style={estiloTarjetaRecordatorios} aria-busy="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Skeleton width="62%" height={13} radius={5} sutil />
        </div>
        <Skeleton width={56} height={44} radius={14} sutil />
      </div>

      <div role="group" aria-label="Frecuencia" style={{ display: 'flex', gap: 8 }}>
        {['Diario', 'Cada 3 días', 'Semanal'].map((_, i) => (
          <Skeleton
            key={i}
            width="33.333%"
            height={44}
            radius={12}
            sutil
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton width="65%" height={44} radius={12} sutil />
        <Skeleton width="35%" height={44} radius={12} sutil />
      </div>
    </div>
  )
}
