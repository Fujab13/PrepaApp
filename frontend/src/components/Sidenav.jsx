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


export default function Sidenav({ open, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
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

        <div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  marginBottom: 24 
}}>
  <div style={{
    width: 52, height: 52, borderRadius: '50%',
    background: 'var(--surface2)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
    flexShrink: 0 
  }}>
    <RiUser3Fill />
  </div>
  <div>
    {user ? (<> {/* .split('@')[0] */}
      <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{user.email}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Cuenta activa</p>
      </>) : (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No has iniciado sesión</p>
    )}
  </div>
</div>
          
        <hr style={{ border: 'none', borderTop: '1px solid var(--surface2)', marginBottom: 16 }} />
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
            <PiShoppingCartSimpleFill />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          Tienda
          </span>
        </button>
        <button onClick={() => ir('/examen')} style={{
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
            <FaClock />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          Examen Simulador
          </span>
        </button>
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