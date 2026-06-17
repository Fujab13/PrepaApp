import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MATERIAS } from '../data/index'
import { LIBROS } from '../data/libros'
import { useProgreso } from '../hooks/useProgreso'
import MateriaCard from '../components/MateriaCard'
import Hexagono from '../components/Hexagono'
import LibroCard from '../components/LibroCard'
import Sidenav from '../components/Sidenav'

const animacionLunas = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const animacionPollo = ['🥚', '🐣', '🐥', '🐤', '🐔', '🍗', '😋', '🍽️'];
const animacionCarga = ['▱▱▱▱', '▰▱▱▱', '▰▰▱▱', '▰▰▰▱', '▰▰▰▰', '▰▰▰▱', '▰▰▱▱', '▰▱▱▱'];
const animacionDados = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅', '🎲', '✨'];

export default function Home() {
  const navigate = useNavigate()
  const [sidenavOpen, setSidenavOpen] = useState(false)
  const [featuredId, setFeaturedId] = useState(
    () => { return localStorage.getItem('featured_materia_id') || MATERIAS[0].id}
  )

  const [frameIdx, setFrameIdx] = useState(0)

  const { unidadesCompletas } = useProgreso(featuredId)
  const featured = MATERIAS.find(m => m.id === featuredId) || MATERIAS[0]
  const cambiarFeatured = (id) => {
    setFeaturedId(id)
    localStorage.setItem('featured_materia_id', id)
  }

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % animacionLunas.length);
    }, 300); // 300ms

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>

      <Sidenav open={sidenavOpen} onClose={() => setSidenavOpen(false)} />

      <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: featured.color }}>
        <button onClick={() => setSidenavOpen(true)} style={{background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 0}}>
          ☰
        </button>
        <span style={{ fontSize: '1.6rem', width: '30px', textAlign: 'center' }}>
          {animacionLunas[frameIdx]}
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          PrepaApp
        </h1>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

        <div style={{background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'}}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          progreso en {featured.nombre}</p>

          <Hexagono
          progreso={unidadesCompletas}
          color={featured.color}
          onClick={() => navigate(`/leccion/${featured.id}`)}
          />

          <button
            onClick={() => navigate(`/leccion/${featured.id}`)}
            style={{
              background: featured.color,
              color: '#000000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '1rem',
              width: '100%',
              transition: 'opacity 0.2s'
            }}
          >
            ▶ Empezar lección
          </button>
        </div>



        <p style={{  color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Flashcards
        </p>
        {MATERIAS.map(m => (
          <div
            key={m.id}
            onClick={() => {
              cambiarFeatured(m.id)
              navigate(`/lectura/${m.id}`)}}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '20px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
          >
        <div style={{
            fontSize: '2rem',
            width: '52px', height: '52px',
            background: 'var(--surface2)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          {m.icono}
          </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{m.nombre}</p>
          {/*<p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Leer material del curso</p>*/}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
          {m.descripcion}
        </div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>›</span>
        </div>
        ))}



        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Quizzes
        </p>
        {MATERIAS.map(m => (
          <div key={m.id} onClick={() => {
            cambiarFeatured(m.id)
            navigate(`/leccion/${m.id}`)
          }}>
            <MateriaCard materia={m} />
          </div>
        ))}
        


        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Biblioteca
        </p>
        {LIBROS.map(libro => (
          <LibroCard
            key={libro.id}
            libro={libro}
            onClick={() => window.open(`/libros/${libro.archivo}`, '_blank')}
          />
        ))}

        

      </div>
      <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: featured.color }}>
      <span style={{ fontSize: '1.6rem', width: '30px', textAlign: 'center' }}>
          {animacionCarga[frameIdx]}
        </span>
      </div>
    </div>
  )
}
