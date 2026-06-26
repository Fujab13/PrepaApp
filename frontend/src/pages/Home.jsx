import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MATERIAS } from '../data/index'
import { LIBROS } from '../data/libros'
import { useProgreso } from '../hooks/useProgreso'
import MateriaCard from '../components/MateriaCard'
import Hexagono from '../components/Hexagono'
import LibroCard from '../components/LibroCard'
import Sidenav from '../components/Sidenav'

import { BiMobileVibration } from "react-icons/bi";
import { RxEnterFullScreen } from "react-icons/rx";
import { MdFullscreen } from "react-icons/md";
import { RiMenuFill } from "react-icons/ri";
import { FaInstagram, FaFacebook, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import { PiHexagon } from "react-icons/pi";

const animacionLunas = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
{/*{animacionLunas[frameIdx]}*/}
const animacionCarga = ['▱▱▱▱', '▰▱▱▱', '▰▰▱▱', '▰▰▰▱', '▰▰▰▰', '▰▰▰▱', '▰▰▱▱', '▰▱▱▱'];

export default function Home() {
  const navigate = useNavigate()
  const [sidenavOpen, setSidenavOpen] = useState(false)
  const [featuredId, setFeaturedId] = useState(
    () => { return localStorage.getItem('featured_materia_id') || MATERIAS[0].id}
  )
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
          fontSize: '1.5rem',
          opacity: 0.9
        }}>
          <PiHexagon />
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
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 5}}
          onClick={() => {
            const nuevoEstado = !vibracionActiva;
            setVibracionActiva(nuevoEstado);
            localStorage.setItem('hapticsEnabled', String(nuevoEstado));
            if (nuevoEstado) triggerVibration('success');
          }}>
            {vibracionActiva ? <BiMobileVibration /> : <BiMobileVibration />}
          </button>
          <button className="util-btn" 
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
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
        {MATERIAS.map(m => (
          <div key={m.id} onClick={() => {
            cambiarFeatured(m.id)
            navigate(`/leccion/${m.id}`)
          }}>
            <MateriaCard materia={m} />
          </div>
        ))}


        <p style={{  color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Tarjetas
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
          {/* <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{m.nombre}</p> */}
          {/*<p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Leer material del curso</p>*/}
          <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: 2 }}>
          {m.descripcion}
        </div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>›</span>
        </div>
        ))}
        


        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Material de la BUAP
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
  <div style={{ display: 'flex', gap: 16 }}>
    
    <a href="https://instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" 
      style={{ 
        background: `linear-gradient(355deg, ${featured?.color || '#3b82f6'}, #ffffffbe)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 2px 8px ${featured?.color || '#3b82f6'}80)`
      }}>
      <FaInstagram size={24} />
    </a>

    <a href="https://facebook.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" 
      style={{ 
        background: `linear-gradient(355deg, ${featured?.color || '#3b82f6'}, #ffffffbe)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 2px 8px ${featured?.color || '#3b82f6'}80)`
      }}>
      <FaFacebook size={24} />
    </a>

    <a href="mailto:fujab13@gmail.com" 
      style={{ 
       background: `linear-gradient(355deg, ${featured?.color || '#3b82f6'}, #ffffffbe)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 2px 8px ${featured?.color || '#3b82f6'}80)`
      }}>
      <FaEnvelope size={24} />
    </a>

    <a href="https://wa.me/527331274538" target="_blank" rel="noopener noreferrer" 
      style={{ 
        background: `linear-gradient(355deg, ${featured?.color || '#3b82f6'}, #ffffffbe)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 2px 8px ${featured?.color || '#3b82f6'}80)`
      }}>
      <FaWhatsapp size={24} />
    </a>

  </div>
  <p style={{ margin: 0, fontSize: 14 }}>© 2026 PrepaApp - Todos los derechos reservados</p>
</footer>
    </div>
  )
}
