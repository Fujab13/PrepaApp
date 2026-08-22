import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getMateria } from '../data/leccionesGratis'
import { renderIconoMateria } from '../utils/renderIconoMateria'
import { getLectura } from '../data/lecturas/index'
import Tarjeta from './Tarjeta'

import { AiOutlineClose } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

// Quita acentos y normaliza mayúsculas para que la búsqueda encuentre
// "concordancia" aunque el usuario escriba "concordáncia" o "CONCORDANCIA".
function normalizarTexto(texto) {
  return (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Los ids del temario son slugs con guiones (ej. "conector-adicion"): los
// convierte a texto con espacios para que buscar "conector adicion" (o
// simplemente "conector") tambien encuentre esa subtema por su id.
function normalizarId(id) {
  return normalizarTexto(id).replace(/-/g, ' ')
}

export default function Lectura() {
  const { materiaId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const materia = getMateria(materiaId)
  const lectura = getLectura(materiaId)

  // Deep link opcional desde la Lección (botón de lupa):
  // ?tema=<id>&subtema=<id>&concepto=<índice>
  const temaParam = searchParams.get('tema')
  const subtemaParam = searchParams.get('subtema')
  const conceptoParam = searchParams.get('concepto')
  const conceptoIdxInicial = conceptoParam !== null && conceptoParam !== '' ? Number(conceptoParam) : null

  const [temaIdx, setTemaIdx] = useState(() => {
    if (!lectura || !temaParam) return 0
    const idx = lectura.temas.findIndex(t => t.id === temaParam)
    return idx >= 0 ? idx : 0
  })
  const activeTabRef = useRef(null)

  // Subtema/concepto a resaltar: arrancan con lo que traiga el deep link,
  // pero el buscador de esta misma página también puede actualizarlos.
  const [subtemaResaltado, setSubtemaResaltado] = useState(subtemaParam)
  const [conceptoResaltado, setConceptoResaltado] = useState(conceptoIdxInicial)

  const [queryBusqueda, setQueryBusqueda] = useState('')

  // Una vez ubicados en el tema correcto, hace scroll hasta el subtema
  // encontrado (por deep link o por el buscador) para que quede a la vista.
  useEffect(() => {
    if (!subtemaResaltado) return
    const t = setTimeout(() => {
      document.getElementById(`subtema-${subtemaResaltado}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
    return () => clearTimeout(t)
  }, [subtemaResaltado, temaIdx])

  // Búsqueda por id, título o conceptos (sin acentos ni mayúsculas), en
  // todos los temas. Los resultados se ordenan por prioridad para que un id
  // o título exacto (ej. buscar "tesis" y encontrar la subtema "Tesis")
  // siempre aparezca antes que una coincidencia suelta dentro de un párrafo
  // de un concepto (ej. "hipótesis", "paréntesis", que también contienen
  // "tesis" como subcadena).
  const resultadosBusqueda = useMemo(() => {
    if (!lectura) return []
    // Si el usuario pega o escribe un id tal cual (con guiones), lo trata
    // igual que si hubiera escrito espacios, para que calce con normalizarId.
    const q = normalizarTexto(queryBusqueda).replace(/-/g, ' ').trim()
    if (q.length < 2) return []

    const encontrados = []
    lectura.temas.forEach((t, ti) => {
      t.subtemas.forEach(s => {
        const idTexto = normalizarId(s.id)
        const tituloTexto = normalizarTexto(s.titulo)
        const idOTituloCoincide = idTexto.includes(q) || tituloTexto.includes(q)
        const idxConcepto = s.conceptos.findIndex(c => normalizarTexto(c).includes(q))

        if (!idOTituloCoincide && idxConcepto === -1) return

        // 0: id o título exactos. 1: id o título empiezan con la búsqueda.
        // 2: id o título la contienen en cualquier posición. 3: solo
        // apareció dentro del texto de un concepto.
        let prioridad = 3
        if (idOTituloCoincide) {
          if (idTexto === q || tituloTexto === q) prioridad = 0
          else if (idTexto.startsWith(q) || tituloTexto.startsWith(q)) prioridad = 1
          else prioridad = 2
        }

        encontrados.push({
          temaIdx: ti,
          temaTitulo: t.titulo,
          subtemaId: s.id,
          subtemaTitulo: s.titulo,
          conceptoIdx: idxConcepto !== -1 ? idxConcepto : null,
          fragmento: idxConcepto !== -1 ? s.conceptos[idxConcepto] : null,
          prioridad,
        })
      })
    })

    encontrados.sort((a, b) => a.prioridad - b.prioridad)
    return encontrados.slice(0, 8)
  }, [queryBusqueda, lectura])

  function seleccionarResultado(resultado) {
    setTemaIdx(resultado.temaIdx)
    setSubtemaResaltado(resultado.subtemaId)
    setConceptoResaltado(resultado.conceptoIdx)
    setQueryBusqueda('')
  }

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
  const hayQuery = queryBusqueda.trim().length >= 2

  return (
    <div style={{ display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
    }}>
    <div className="page-topbar-compact" style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => navigate('/')}
        title="Salir"
        className="page-topbar-btn"
        data-gamificacion="bajo"
      >
        <AiOutlineClose />
      </button>

      <span className="page-topbar-btn" style={{ fontSize: '1.35rem', flexShrink: 0 }}>
        {renderIconoMateria(materia.icono, { size: 20 })}
      </span>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <FiSearch style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', fontSize: '0.95rem', pointerEvents: 'none' }} />
        <input
          value={queryBusqueda}
          onChange={e => setQueryBusqueda(e.target.value)}
          placeholder="Buscar"
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '9px 12px 9px 34px',
            color: 'var(--text)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>
    </div>

    {hayQuery ? (
      <div style={{ padding: '10px 16px 0' }}>
        {resultadosBusqueda.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '18px 0' }}>
            Sin resultados para "{queryBusqueda}".
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {resultadosBusqueda.map((r, i) => (
              <button
                key={`${r.subtemaId}-${i}`}
                onClick={() => seleccionarResultado(r)}
                style={{
                  textAlign: 'left',
                  background: 'var(--surface2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: materia.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {r.temaTitulo}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                  {r.subtemaTitulo}
                </span>
                {r.fragmento && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {r.fragmento.length > 100 ? `${r.fragmento.slice(0, 100)}…` : r.fragmento}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    ) : (
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
    )}

      <div className="page-content-compact" style={{ flex: 1, paddingBottom: 90 }}>
        <Tarjeta
          tema={tema}
          color={materia.color}
          completados={completados}
          onToggleSubtema={handleToggleSubtema}
          subtemaResaltado={subtemaResaltado}
          conceptoResaltado={conceptoResaltado}
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
          className="btn-footer-scroll gm-cta"
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
