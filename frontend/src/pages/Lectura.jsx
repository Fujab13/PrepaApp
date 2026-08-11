import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMateria } from '../data/leccionesGratis'
import { renderIconoMateria } from '../utils/renderIconoMateria'
import { getLectura } from '../data/lecturas/index'
import Tarjeta from './Tarjeta'

import { AiOutlineClose } from "react-icons/ai";

export default function Lectura() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const materia = getMateria(materiaId)
  const lectura = getLectura(materiaId)
  const [temaIdx, setTemaIdx] = useState(0)
  const activeTabRef = useRef(null)

  // --- Progreso persistente por materia (localStorage) ---
  // Estructura guardada: { [subtemaId]: true }
  const storageKey = `progreso-${materiaId}`
  const [completados, setCompletados] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      const obj = raw ? JSON.parse(raw) : {}
      return new Set(Object.keys(obj).filter(k => obj[k]))
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    try {
      const obj = {}
      completados.forEach(id => { obj[id] = true })
      localStorage.setItem(storageKey, JSON.stringify(obj))
    } catch {
      // localStorage no disponible, se ignora silenciosamente
    }
  }, [completados, storageKey])

  const handleToggleSubtema = (subtemaId) => {
    setCompletados(prev => {
      const next = new Set(prev)
      if (next.has(subtemaId)) next.delete(subtemaId)
      else next.add(subtemaId)
      return next
    })
  }

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
  const totalTemas = lectura.temas.length

  return (
    <div style={{ display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
    }}>
    <div className="page-topbar-compact" style={{ paddingBottom: 12 }}>
      <button
        onClick={() => navigate('/')}
        title="Salir"
        className="page-topbar-btn"
      >
        <AiOutlineClose />
      </button>

      <span className="page-topbar-btn" style={{ fontSize: '1.35rem' }}>
        {renderIconoMateria(materia.icono, { size: 20 })}
      </span>

      <span className="page-topbar-title">
        {materia.nombre}
      </span>
    </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {lectura.temas.map((t, i) => (
          <button
            key={t.id}
            ref={i === temaIdx ? activeTabRef : null}
            onClick={() => setTemaIdx(i)}
            style={{
              background: i === temaIdx ? materia.color : 'var(--surface2)',
              color: i === temaIdx ? '#000' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'background 300ms ease, color 300ms ease'
            }}
          >
          {t.titulo}
          </button>
        ))}
      </div>

      <div className="page-content-compact" style={{ flex: 1, paddingBottom: 90 }}>
        <Tarjeta
          tema={tema}
          color={materia.color}
          completados={completados}
          onToggleSubtema={handleToggleSubtema}
        />
      </div>

      <div className="page-footer-fixed">
        <button
          onClick={() => setTemaIdx(i => Math.max(0, i - 1))}
          disabled={temaIdx === 0}
          className="btn-footer-scroll"
          style={{
            flex: 1,
            opacity: temaIdx === 0 ? 0.35 : 1,
            color: 'var(--text-muted)',
            border: '0.5px solid var(--surface)',
          }}
        >
         Anterior
        </button>

        {/* Indicador de paginación: dots si hay pocos temas, "x de y" si hay muchos */}
        <PaginacionIndicador
          total={totalTemas}
          actual={temaIdx}
          color={materia.color}
          onSelect={setTemaIdx}
        />

        <button
          onClick={() => setTemaIdx(i => Math.min(totalTemas - 1, i + 1))}
          disabled={temaIdx === totalTemas - 1}
          className="btn-footer-scroll"
          style={{
            flex: 1,
            background: materia.color,
            color: '#000',
            fontWeight: 700,
            opacity: temaIdx === totalTemas - 1 ? 0.35 : 1,
          }}
        >
        Siguiente
        </button>
      </div>

    </div>
  )
}

/**
 * PaginacionIndicador
 * - Si hay 8 temas o menos: dots clickeables (el activo se estira tipo "pill").
 * - Si hay más de 8: texto compacto "x de y" para no saturar la pantalla.
 */
function PaginacionIndicador({ total, actual, color, onSelect }) {
  if (total > 8) {
    return (
      <span
        style={{
          flexShrink: 0,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          padding: '0 8px',
          whiteSpace: 'nowrap'
        }}
      >
        {actual + 1} de {total}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Ir al tema ${i + 1}`}
          style={{
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            height: 8,
            width: i === actual ? 22 : 8,
            borderRadius: 999,
            background: i === actual ? color : 'var(--surface2)',
            transition: 'width 300ms ease, background 300ms ease'
          }}
        />
      ))}
    </div>
  )
}