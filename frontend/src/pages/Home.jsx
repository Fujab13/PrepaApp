import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MATERIAS } from '../data/leccionesGratis'
import { LIBROS } from '../data/libros'
import { useProgreso } from '../hooks/useProgreso'
import MateriaCard from '../components/MateriaCard'
import Hexagono from '../components/Hexagono'
import LibroCard from '../components/LibroCard'
import Sidenav from '../components/Sidenav'
import TemariosCards from '../components/TemariosCards'
import { triggerVibration } from '../utils/haptics'
import { obtenerLeccionDeSesion } from '../services/leccionesPremium'

import { BiMobileVibration } from "react-icons/bi";
import { RxEnterFullScreen } from "react-icons/rx";
import { MdFullscreen } from "react-icons/md";
import { RiMenuFill } from "react-icons/ri";
import { FaInstagram, FaFacebook, FaEnvelope, FaWhatsapp } from 'react-icons/fa'

const animacionLunas = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
{/*{animacionLunas[frameIdx]}*/}
const animacionCarga = ['▱▱▱▱', '▰▱▱▱', '▰▰▱▱', '▰▰▰▱', '▰▰▰▰', '▰▰▰▱', '▰▰▱▱', '▰▱▱▱'];

export default function Home() {
  const navigate = useNavigate()
  const [sidenavOpen, setSidenavOpen] = useState(false)
  const [featuredId, setFeaturedId] = useState(
    () => { return localStorage.getItem('featured_materia_id') || MATERIAS[0].id}
  )
  
  const [premiumLesson, setPremiumLesson] = useState(null)
  const [premiumLessonLoading, setPremiumLessonLoading] = useState(false)
  const [premiumLessonError, setPremiumLessonError] = useState('')

  const [esFullscreen, setEsFullscreen] = useState(false)
  const [vibracionActiva, setVibracionActiva] = useState(
  localStorage.getItem('hapticsEnabled') !== 'false'
  );
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
    }, 300); // ms
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      setPremiumLessonLoading(true)
      setPremiumLessonError('')
      const cacheada = obtenerLeccionDeSesion()
      if (cacheada?.data) {
        const data = cacheada.data
        setPremiumLesson({
          id: `premium-${cacheada.productoId}`,
          nombre: data.nombre || data.titulo || cacheada.nombreProducto || 'Lección premium',
          icono: data.icono || 'FaBookOpen',
          color: data.color || '#7c5cbf',
          preguntas: Array.isArray(data.preguntas) ? data.preguntas : [],
        })
      } else {
        setPremiumLesson(null)
      }
    } catch (err) {
      console.error('No se pudo leer la lección premium desde sesión:', err)
      setPremiumLessonError('No se pudo cargar la lección premium.')
      setPremiumLesson(null)
    } finally {
      setPremiumLessonLoading(false)
    }
  }, [])

  const materiasAMostrar = premiumLesson ? [premiumLesson, ...MATERIAS] : MATERIAS
  const navegarLeccion = (materia) => {
    if (materia.id.startsWith('premium-')) {
      navigate(`/leccion/${materia.id}`)
      return
    }
    cambiarFeatured(materia.id)
    navigate(`/leccion/${materia.id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>

      <Sidenav open={sidenavOpen} onClose={() => setSidenavOpen(false)} />

      <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: featured.color }}>
        <button onClick={() => setSidenavOpen(true)} style={{background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 0}}>
          <RiMenuFill />
        </button>
                
         <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          opacity: 0.9
        }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              width: '30px', 
              height: '30px', 
              objectFit: 'contain' 
            }} 
          />

        </span>

        <h1 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 500, 
          margin: 0, 
          color: '#ffffff',
          letterSpacing: '-0.01em'
        }}>
          Prepa<span style={{ fontWeight: 300, opacity: 0.6 }}>App</span>
        </h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)', 
          fontSize: '0.75rem', 
          marginLeft: 'auto',
          textTransform: 'uppercase', 
          letterSpacing: '1.5px', 
          padding: 7
          
        }}>
          <button className="util-btn" 
          onClick={() => {
            const nuevoEstado = !vibracionActiva;
            setVibracionActiva(nuevoEstado);
            localStorage.setItem('hapticsEnabled', String(nuevoEstado));
            if (nuevoEstado) triggerVibration('success');
          }}>
            {vibracionActiva ? <BiMobileVibration /> : <BiMobileVibration />}
          </button>
          <button className="util-btn" 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
              setEsFullscreen(true);
            } else {
              document.exitFullscreen();
              setEsFullscreen(false);
            }
          }}>
            {esFullscreen ? <MdFullscreen /> : <MdFullscreen />}
          </button>
        </div>
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
              background: `linear-gradient(355deg, ${featured.color}, #ffffffbe)`,
              //background: featured.color,
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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Cuestionarios
        </p>
        {premiumLessonLoading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px' }}>
            Cargando lección premium...
          </p>
        )}
        {premiumLessonError && (
          <p style={{ color: 'salmon', fontSize: '0.85rem', margin: '0 0 12px' }}>
            {premiumLessonError}
          </p>
        )}
        {materiasAMostrar.map(m => (
          <div key={m.id} onClick={() => navegarLeccion(m)}>
            <MateriaCard materia={m} />
          </div>
        ))}
        
        
  <>
  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', paddingLeft: '4px' }}>
    Tarjetas
  </p>
  <TemariosCards
    materias={MATERIAS}
    featuredColor={featured.color}
    onSelect={(materia) => cambiarFeatured(materia.id)}
  />
</>
        


        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Material
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
      <footer style={{
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  color: 'var(--text-muted)'
}}>
  <div style={{ display: 'flex', gap: 18 }}>
    
    <a href="https://instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" 
      style={{ 
        color: 'var(--text)',
        opacity: 0.9
      }}>
      <FaInstagram size={22} />
    </a>

    <a href="https://facebook.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" 
      style={{ 
        color: 'var(--text)',
        opacity: 0.9
      }}>
      <FaFacebook size={22} />
    </a>

    <a href="mailto:fujab13@gmail.com" 
      style={{ 
        color: 'var(--text)',
        opacity: 0.9
      }}>
      <FaEnvelope size={22} />
    </a>

    <a href="https://wa.me/527331274538" target="_blank" rel="noopener noreferrer" 
      style={{ 
        color: 'var(--text)',
        opacity: 0.9
      }}>
      <FaWhatsapp size={22} />
    </a>

  </div>
  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>© 2026 PrepaApp - Todos los derechos reservados</p>
</footer>
    </div>
  )
}
