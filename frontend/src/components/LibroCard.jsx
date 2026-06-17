import { useEffect, useRef, useState } from 'react'

let pdfjsLib = null

function cargarPdfJs() {
  return new Promise((resolve) => {
    if (pdfjsLib) return resolve(pdfjsLib)
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib
      return resolve(pdfjsLib)
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      pdfjsLib = window.pdfjsLib
      resolve(pdfjsLib)
    }
    document.head.appendChild(script)
  })
}

export default function LibroCard({ libro, onClick }) {
  const canvasRef = useRef(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function renderPortada() {
      try {
        const lib = await cargarPdfJs()
        const url = `/libros/${libro.archivo}`
        const pdf = await lib.getDocument(url).promise
        if (cancelado) return

        const page = await pdf.getPage(1)
        if (cancelado) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Escala para portada liviana (~150px)
        const viewport = page.getViewport({ scale: 0.3 })
        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        if (!cancelado) setCargando(false)
      } catch (e) {
        if (!cancelado) {
          setError(true)
          setCargando(false)
        }
      }
    }

    renderPortada()
    return () => { cancelado = true }
  }, [libro.archivo])

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = libro.color
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: '48px',
        height: '64px',
        borderRadius: '6px',
        overflow: 'hidden',
        background: 'var(--surface2)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${libro.color}33`,
      }}>
        {cargando && (
          <span style={{ fontSize: '1.4rem' }}>📄</span>
        )}
        {error && (
          <span style={{ fontSize: '1.4rem' }}>📄</span>
        )}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cargando || error ? 'none' : 'block',
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: '1rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {libro.nombre}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
          PDF · Estudio
        </div>
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem', flexShrink: 0 }}>›</span>
    </div>
  )
}