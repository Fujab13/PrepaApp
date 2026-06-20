import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { MATERIAS } from '../data/index'


export default function Sidenav({ open, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [esFullscreen, setEsFullscreen] = useState(false)
  const [vibracionActiva, setVibracionActiva] = useState(
  localStorage.getItem('hapticsEnabled') !== 'false'
  );
  async function cerrarSesion() {
    await supabase.auth.signOut()
    onClose()
  }
  function ir(ruta) {
    navigate(ruta)
    onClose()
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99
        }}/>
      )}

      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
        background: 'var(--surface)', zIndex: 100,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        display: 'flex', flexDirection: 'column', padding: '32px 24px', gap: 8
      }}>

        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--surface2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 12
          }}>
          👤
          </div>
          
          {user ? (
            <>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.email}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cuenta activa</p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No has iniciado sesión</p>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px' 
        }}>
  
          <button className="util-btn" 
          style={{ borderRadius: 0 }}
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
              setEsFullscreen(true);
            } else {
              document.exitFullscreen();
              setEsFullscreen(false);
            }
          }}>
            {esFullscreen ? 'Fullscreen' : 'Fullscreen'}
          </button>

          <button className="util-btn" 
            style={{ borderRadius: 0 }}
          onClick={() => {
            const nuevoEstado = !vibracionActiva;
            setVibracionActiva(nuevoEstado);
            localStorage.setItem('hapticsEnabled', String(nuevoEstado));
            if (nuevoEstado) triggerVibration('success');
          }}>
            {vibracionActiva ? 'Vibration' : 'Vibration'}
          </button>
          
        </div>
          
        <hr style={{ border: 'none', borderTop: '1px solid var(--surface2)', marginBottom: 16 }} />

        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
          Cuestionarios
        </p>
        {MATERIAS.map(m => (
          <button key={m.id} onClick={() => ir(`/leccion/${m.id}`)} style={{
            background: 'transparent', border: 'none', color: 'var(--text)',
            textAlign: 'left', padding: '10px 8px', borderRadius: '10px',
            fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span>{m.icono}</span> {m.nombre}
          </button>
        ))}

        <button onClick={() => ir('/tienda')} style={{
          background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
          border: '1px solid var(--surface2)',
          color: 'var(--text)',
          textAlign: 'left',
          padding: '12px 14px',
          borderRadius: '14px',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '12px 0 4px'
        }}>
          <span style={{
          fontSize: '1.2rem',
          width: '30px', height: '30px',
          background: 'var(--surface2)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            🛍️
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          Tienda
          </span>
        </button>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {user ? (
            <button onClick={cerrarSesion} style={{
              background: 'var(--surface2)', color: 'var(--wrong)', border: 'none',
              borderRadius: '12px', padding: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              Cerrar sesión
            </button>
          ) : (
            <>
              <button onClick={() => ir('/login')} style={{
                background: '#7c5cbf', color: '#fff', border: 'none',
                borderRadius: '12px', padding: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}>
                Iniciar sesión
              </button>
              <button onClick={() => ir('/login')} style={{
                background: 'var(--surface2)', color: 'var(--text)', border: 'none',
                borderRadius: '12px', padding: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}>
                Registrarse
              </button>
            </>
          )}
        </div>

      </div>
    </>
  )
}