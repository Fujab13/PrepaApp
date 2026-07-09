import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMateria } from '../data/index'
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center', // Alinea verticalmente los centros de los tres elementos
      gap: 10,
      padding: '16px 0 12px',
      marginTop: '15px',
    }}>
      <button
        onClick={() => navigate('/')}
        title="Salir"
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text)', 
          fontSize: '1.4rem', 
          cursor: 'pointer', 
          display: 'flex',      // Forzamos al botón a centrar internamente su icono
          alignItems: 'center',
          padding: 0            // Quitamos el padding para evitar desfases
        }}
      >
        <AiOutlineClose />
      </button>
      
      <span style={{ 
        background: 'transparent', 
        border: 'none', 
        color: 'var(--text)', 
        fontSize: '1.35rem', 
        display: 'flex',        // Forzamos al span a centrar internamente el emoji/icono
        alignItems: 'center',
        padding: 0              // Quitamos el padding para alineación perfecta
      }}>
        {materia.icono}
      </span>
      
      <span style={{ 
        fontWeight: 700, 
        fontSize: '1.1rem',
        lineHeight: 1           // Evita que el interlineado del texto empuje la caja hacia abajo
      }}>
        {materia.nombre}
      </span>
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
              cursor: 'pointer',
              transition: 'background 300ms ease, color 300ms ease'
            }}
          >
          {t.titulo}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px', flex: 1 }}>
        <Tarjeta
          tema={tema}
          color={materia.color}
          completados={completados}
          onToggleSubtema={handleToggleSubtema}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
          <button
            onClick={() => setTemaIdx(i => Math.max(0, i - 1))}
            disabled={temaIdx === 0}
            style={{
              flex: 1, background: 'var(--surface)', color: 'var(--text)',
              border: 'none', borderRadius: '12px', padding: '12px',
              opacity: temaIdx === 0 ? 0.3 : 1, cursor: temaIdx === 0 ? 'default' : 'pointer',
              transition: 'opacity 300ms ease'
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
            style={{
              flex: 1, background: materia.color, color: '#000', fontWeight: 700,
              border: 'none', borderRadius: '12px', padding: '12px',
              opacity: temaIdx === totalTemas - 1 ? 0.3 : 1,
              cursor: temaIdx === totalTemas - 1 ? 'default' : 'pointer',
              transition: 'opacity 300ms ease'
            }}
          >
          Siguiente
          </button>
        </div>
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
            background: i === actual ? color : 'var(--surface)',
            transition: 'width 300ms ease, background 300ms ease'
          }}
        />
      ))}
    </div>
  )
}