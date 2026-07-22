import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import { MATERIAS } from '../data/index'

import { FaCreditCard } from "react-icons/fa6";
import { FaUserGraduate } from "react-icons/fa";
import { LiaCartPlusSolid } from "react-icons/lia";
import { PiShoppingCart } from "react-icons/pi";
import { SlUser } from "react-icons/sl";
import { PiShoppingCartSimpleFill } from "react-icons/pi";
import { RiUser3Fill } from "react-icons/ri";
import { FaClock } from "react-icons/fa6";
import { MdSdStorage } from "react-icons/md";


export default function Sidenav({ open, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hoveredBtn, setHoveredBtn] = useState(null);

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
      {/* Overlay con un desenfoque sutil */}
      {open && (
        <div 
          onClick={onClose} 
          style={{
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0, 0, 0, 0.4)', 
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Contenedor Lateral (Sidenav) */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        height: '100vh', 
        width: '290px',
        background: 'var(--surface)', 
        zIndex: 100,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px 20px',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        boxSizing: 'border-box'
      }}>

        {/* Perfil de Usuario */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px', 
          marginBottom: 20,
          padding: '4px'
        }}>
          <div style={{
            width: 48, 
            height: 48, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--surface2), var(--surface))', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.3rem',
            color: '#8482e0',
            flexShrink: 0,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <RiUser3Fill />
          </div>
          <div style={{ overflow: 'hidden' }}>
            {user ? (
              <>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                  {user.email}
                </p>
                <p style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span> Cuenta activa
                </p>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>No has iniciado sesión</p>
            )}
          </div>
        </div>
          
        <hr style={{ border: 'none', borderTop: '1px solid var(--surface2)', marginBottom: 16, opacity: 0.6 }} />

        {/* Cuerpo con Scroll para las materias si exceden la pantalla */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: '4px' }}>
          
          {/* Botón Tienda */}
          <button 
            onClick={() => ir('/tienda')} 
            onMouseEnter={() => setHoveredBtn('tienda')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(124, 92, 191, 0.15)',
              color: '#7c5cbf',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyindex: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <PiShoppingCartSimpleFill />
            </span>
            <span>Tienda</span>
          </button>

          {/* Botón Examen Simulador */}
          <button 
            onClick={() => ir('/examen')} 
            onMouseEnter={() => setHoveredBtn('examen')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyindex: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <FaClock />
            </span>
            <span>Examen Simulador</span>
          </button>

          {/* Botón Inventario */}
          <button 
            onClick={() => ir('/inventario')} 
            onMouseEnter={() => setHoveredBtn('inventario')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(124, 92, 191, 0.15)',
              color: '#bf5c5c',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyindex: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <MdSdStorage />
            </span>
            <span>Inventario</span>
          </button>

          {/* Sección Cuestionarios */}
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px', 
            fontWeight: 700, 
            margin: '8px 0 6px 4px',
            opacity: 0.8
          }}>
            Cuestionarios
          </p>

          {MATERIAS.map(m => (
            <button 
              key={m.id} 
              onClick={() => ir(`/leccion/${m.id}`)} 
              onMouseEnter={() => setHoveredBtn(m.id)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                background: hoveredBtn === m.id ? 'var(--surface2)' : 'transparent', 
                border: 'none', 
                color: 'var(--text)',
                textAlign: 'left', 
                padding: '10px 12px', 
                borderRadius: '10px',
                fontSize: '0.9rem', 
                fontWeight: 500,
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ opacity: hoveredBtn === m.id ? 1 : 0.8, display: 'flex', alignItems: 'center' }}>
                {m.icono}
              </span> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.nombre}
              </span>
            </button>
          ))}
        </div>

        {/* Sección Inferior de Botones (Despegada con Sombra y Borde superior) */}
        <div style={{ 
          marginTop: 'auto', 
          pt: '16px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: 10,
          padding: '16px 4px 4px 4px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          background: 'var(--surface)',
          boxShadow: '0 -12px 20px -10px rgba(0, 0, 0, 0.25)', // Logra el efecto de separación/elevación del fondo
          zIndex: 5
        }}>
          {user ? (
            <button 
              onClick={cerrarSesion} 
              onMouseEnter={() => setHoveredBtn('logout')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                background: hoveredBtn === 'logout' ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface2)', 
                color: hoveredBtn === 'logout' ? '#ef4444' : 'var(--wrong)', 
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '12px', 
                padding: '12px', 
                fontWeight: 600, 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <button 
                onClick={() => ir('/login')} 
                onMouseEnter={() => setHoveredBtn('login')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  background: hoveredBtn === 'login' ? '#6b4fa3' : '#7c5cbf', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '12px', 
                  padding: '12px', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(124, 92, 191, 0.25)'
                }}
              >
                Iniciar sesión
              </button>
              <button 
                onClick={() => ir('/login')} 
                onMouseEnter={() => setHoveredBtn('signup')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  background: hoveredBtn === 'signup' ? 'rgba(255,255,255,0.05)' : 'var(--surface2)', 
                  color: 'var(--text)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px', 
                  padding: '12px', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Registrarse
              </button>
            </>
          )}
        </div>

      </div>
    </>
  )
}