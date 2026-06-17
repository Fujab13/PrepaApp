import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMateria } from '../data/index'
import { getLectura } from '../data/lecturas/index'
import RenderContenido from '../components/Latex'

export default function Lectura() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const materia = getMateria(materiaId)
  const lectura = getLectura(materiaId)
  const [temaIdx, setTemaIdx] = useState(0)
  const activeTabRef = useRef(null)

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [temaIdx])

  if (!materia || !lectura) {
    navigate('/')
    return null
  }

  const tema = lectura.temas[temaIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'var(--surface)', border: 'none', color: 'var(--text)', borderRadius: '8px', padding: '8px 14px', fontSize: '1.1rem' }}
        >
        ✕
        </button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{materia.icono} {materia.nombre}</span>
      </div>

      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {lectura.temas.map((t, i) => (
          <button
            key={t.id}
            ref={i === temaIdx ? activeTabRef : null}
            onClick={() => setTemaIdx(i)}
            style={{
              background: i === temaIdx ? materia.color : 'var(--surface)',
              color: i === temaIdx ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
          {t.titulo}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px', flex: 1 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: materia.color }}>
          {tema.titulo}
          </h2>
          <RenderContenido texto={tema.contenido} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
          <button
            onClick={() => setTemaIdx(i => Math.max(0, i - 1))}
            disabled={temaIdx === 0}
            style={{
              flex: 1, background: 'var(--surface)', color: 'var(--text)',
              border: 'none', borderRadius: '12px', padding: '12px',
              opacity: temaIdx === 0 ? 0.3 : 1, cursor: temaIdx === 0 ? 'default' : 'pointer'
            }}
          >
          ← Anterior
          </button>

          <button
            onClick={() => setTemaIdx(i => Math.min(lectura.temas.length - 1, i + 1))}
            disabled={temaIdx === lectura.temas.length - 1}
            style={{
              flex: 1, background: materia.color, color: '#000', fontWeight: 700,
              border: 'none', borderRadius: '12px', padding: '12px',
              opacity: temaIdx === lectura.temas.length - 1 ? 0.3 : 1,
              cursor: temaIdx === lectura.temas.length - 1 ? 'default' : 'pointer'
            }}
          >
          Siguiente →
          </button>
        </div>
      </div>

    </div>
  )
}