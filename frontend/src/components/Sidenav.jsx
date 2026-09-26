import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import { resolverAvatarUsuario } from '../utils/avatar'
import { hayPromptDeInstalacion, suscribirseAPromptInstalacion, mostrarPromptInstalacion } from '../utils/pwaInstall'
import {
  notificacionesSoportadas,
  obtenerSuscripcionActual,
  activarNotificaciones,
  desactivarNotificaciones,
  mensajeErrorNotificaciones,
} from '../services/pushNotifications'

import { FaCreditCard } from "react-icons/fa6";
import { FaUserGraduate, FaPaw } from "react-icons/fa";
import { LiaCartPlusSolid } from "react-icons/lia";
import { PiShoppingCart } from "react-icons/pi";
import { SlUser } from "react-icons/sl";
import { PiShoppingCartSimpleFill } from "react-icons/pi";
import { RiUser3Fill } from "react-icons/ri";
import { FaClock } from "react-icons/fa6";
import { MdSdStorage, MdLibraryBooks } from "react-icons/md";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { PiChalkboardTeacher } from "react-icons/pi";
import { HiOutlineCog6Tooth, HiOutlineShieldCheck, HiOutlineUserPlus, HiOutlineFlag, HiOutlineClipboardDocumentList, HiOutlineArrowDownTray, HiOutlineBell, HiOutlineBellSlash } from "react-icons/hi2";


export default function Sidenav({ open, onClose }) {
  const navigate = useNavigate()
  const { user, esAdmin } = useAuth()
  const music = useMusic()
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== 'undefined' ? window.innerHeight : null)
  );
  const [puedeInstalar, setPuedeInstalar] = useState(hayPromptDeInstalacion);

  // Recordatorio de estudio cada ~3 días (ver edge function
  // recordatorio-estudio) — usa la MISMA suscripción push genérica que ya
  // usa el maestro para "alumno nuevo" en TutoriasMaestro.jsx, así que
  // activarla aquí también deja al usuario recibiendo cualquier otro push
  // que le corresponda (es una sola suscripción por navegador, no una por
  // tipo de aviso). `null` = todavía no se sabe.
  const [notifActivas, setNotifActivas] = useState(null);
  const [cambiandoNotif, setCambiandoNotif] = useState(false);
  // Por qué no se pudo activar (permiso negado/bloqueado…): antes el botón
  // fallaba en silencio y parecía roto.
  const [errorNotif, setErrorNotif] = useState('');

  useEffect(() => {
    let cancelado = false;
    setAvatarError(false);
    resolverAvatarUsuario(user).then((src) => { if (!cancelado) setAvatarSrc(src); });
    return () => { cancelado = true; };
  }, [user]);

  useEffect(() => suscribirseAPromptInstalacion(setPuedeInstalar), []);

  // Se revisa también al abrir el panel: se pueden activar/desactivar desde
  // Ajustes mientras el Sidenav está cerrado.
  useEffect(() => {
    if (!user || !notificacionesSoportadas()) return;
    let cancelado = false;
    obtenerSuscripcionActual().then((sub) => {
      if (!cancelado) setNotifActivas(Boolean(sub));
    });
    return () => { cancelado = true; };
  }, [user, open]);

  useEffect(() => {
    if (!errorNotif) return;
    const t = setTimeout(() => setErrorNotif(''), 5000);
    return () => clearTimeout(t);
  }, [errorNotif]);

  async function instalarApp() {
    const resultado = await mostrarPromptInstalacion();
    if (resultado !== null) setPuedeInstalar(false);
  }

  async function alternarNotificaciones() {
    setCambiandoNotif(true);
    setErrorNotif('');
    try {
      if (notifActivas) {
        await desactivarNotificaciones();
        setNotifActivas(false);
      } else {
        // Al activar, el navegador muestra enseguida la primera
        // notificación ("Notificaciones activadas") como confirmación.
        await activarNotificaciones();
        setNotifActivas(true);
      }
    } catch (err) {
      setErrorNotif(mensajeErrorNotificaciones(err));
    }
    setCambiandoNotif(false);
  }

  // El navegador movil recalcula 100dvh/100svh (y dispara el evento
  // 'resize' de visualViewport) solo hasta que la barra de direcciones
  // termina de ocultarse/mostrarse, por lo que escuchar esos eventos
  // sigue dejando al panel "atrasado" ~1s respecto al contenido, que si
  // crece en tiempo real durante el gesto de scroll. El valor de
  // visualViewport.height (a diferencia de su evento) si se actualiza
  // frame a frame durante esa animacion, asi que se sondea con
  // requestAnimationFrame mientras el panel esta abierto para seguirlo
  // sin ese retraso.
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const leerAltura = () => (vv ? vv.height : window.innerHeight);
    let rafId = requestAnimationFrame(function sondear() {
      setViewportHeight((previo) => {
        const actual = leerAltura();
        return actual !== previo ? actual : previo;
      });
      rafId = requestAnimationFrame(sondear);
    });

    return () => cancelAnimationFrame(rafId);
  }, [open]);

  async function cerrarSesion() {
    // Da de baja las notificaciones de ESTE navegador antes de salir: si no,
    // en un dispositivo compartido seguirían llegando los recordatorios de
    // esta cuenta (y la campanita saldría "activada" para el siguiente).
    if (notifActivas) {
      try { await desactivarNotificaciones() } catch { /* no bloquea el cierre */ }
      setNotifActivas(false)
    }
    await supabase.auth.signOut()
    onClose()
  }

  function ir(ruta) {
    navigate(ruta)
    onClose()
  }

  const mostrarBotonNotif = Boolean(user && notificacionesSoportadas());

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
      <div className="sidenav-panel" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '290px',
        ...(viewportHeight ? { height: `${viewportHeight}px` } : {}),
        background: 'var(--sidenav-bg, var(--surface))',
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
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {user && avatarSrc && !avatarError ? (
              <img
                src={avatarSrc}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <RiUser3Fill />
            )}
          </div>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
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

          {/* Engrane → panel de Ajustes (borrar tus datos, etc.). Solo con
              sesión: sin cuenta no hay datos propios que administrar. */}
          {user && (
            <button
              onClick={() => ir('/ajustes')}
              title="Ajustes"
              aria-label="Ajustes"
              className="util-btn"
              style={{
                width: 44, height: 44, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', borderRadius: 12,
                color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer',
              }}
            >
              <HiOutlineCog6Tooth />
            </button>
          )}
        </div>
          
        <hr style={{ border: 'none', borderTop: '1px solid var(--surface2)', marginBottom: 16, opacity: 0.6 }} />

        {/* Cuerpo con Scroll para las materias si exceden la pantalla */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: '4px' }}>
          

          {/* Botón Tutorías */}
          <button
            onClick={() => ir('/tutorias')}
            onMouseEnter={() => setHoveredBtn('tutorias')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyindex: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <FaUserGraduate />
            </span>
            <span>Ranking</span>
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

          {/* Botón Formulario Área */}
          <button
            onClick={() => ir('/formulario-area')}
            onMouseEnter={() => setHoveredBtn('formulario-area')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyindex: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <MdLibraryBooks />
            </span>
            <span>Formulario Área</span>
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

          {/* Botón Mascotas */}
          <button
            type="button"
            onClick={() => ir('/mi-mascota')}
            onMouseEnter={() => setHoveredBtn('mascota')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-sidernav"
          >
            <span style={{
              fontSize: '1.1rem',
              width: '32px', height: '32px',
              background: 'rgba(251, 146, 60, 0.15)',
              color: '#fb923c',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <FaPaw />
            </span>
            <span>Mascotas</span>
          </button>

          {/* Botón Tienda */}
          <button
            type="button"
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

          {/* Sección Administración: solo visible para correos en la tabla
              `admins` (ver migración 20260812130000) — la seguridad real
              vive en el backend (cada RPC de admin revalida
              es_admin_actual), esto solo evita mostrar el enlace a quien no
              lo puede usar. */}
          {esAdmin && (
            <>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: 700,
                margin: '8px 0 6px 4px',
                opacity: 0.8
              }}>
                Administración
              </p>

              <button
                onClick={() => ir('/admin/pagos')}
                onMouseEnter={() => setHoveredBtn('admin-pagos')}
                onMouseLeave={() => setHoveredBtn(null)}
                className="btn-sidernav"
              >
                <span style={{
                  fontSize: '1.1rem',
                  width: '32px', height: '32px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyindex: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <HiOutlineShieldCheck />
                </span>
                <span>Pagos a profesores</span>
              </button>

              <button
                onClick={() => ir('/admin/maestros')}
                onMouseEnter={() => setHoveredBtn('admin-maestros')}
                onMouseLeave={() => setHoveredBtn(null)}
                className="btn-sidernav"
              >
                <span style={{
                  fontSize: '1.1rem',
                  width: '32px', height: '32px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyindex: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <HiOutlineUserPlus />
                </span>
                <span>Profesores</span>
              </button>

              <button
                onClick={() => ir('/admin/ofertas')}
                onMouseEnter={() => setHoveredBtn('admin-ofertas')}
                onMouseLeave={() => setHoveredBtn(null)}
                className="btn-sidernav"
              >
                <span style={{
                  fontSize: '1.1rem',
                  width: '32px', height: '32px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyindex: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <HiOutlineClipboardDocumentList />
                </span>
                <span>Ofertas</span>
              </button>

              <button
                onClick={() => ir('/admin/reportes')}
                onMouseEnter={() => setHoveredBtn('admin-reportes')}
                onMouseLeave={() => setHoveredBtn(null)}
                className="btn-sidernav"
              >
                <span style={{
                  fontSize: '1.1rem',
                  width: '32px', height: '32px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyindex: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <HiOutlineFlag />
                </span>
                <span>Reportes</span>
              </button>
            </>
          )}
        </div>

        {/* Sección Inferior de Botones (Despegada con Sombra y Borde superior) */}
        <div style={{
          marginTop: 'auto',
          pt: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '16px 4px 4px 4px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          background: 'var(--surface)',
          boxShadow: '0 -12px 20px -10px rgba(0, 0, 0, 0.25)', // Logra el efecto de separación/elevación del fondo
          zIndex: 5
        }}>
          {puedeInstalar && (
            <button
              onClick={instalarApp}
              onMouseEnter={() => setHoveredBtn('instalar-app')}
              onMouseLeave={() => setHoveredBtn(null)}
              className="btn-sidernav"
              style={{ margin: 0, height: 44, padding: '0 10px', gap: 8 }}
            >
              <span style={{
                fontSize: '0.95rem',
                width: '26px', height: '26px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <HiOutlineArrowDownTray />
              </span>
              <span>Instalar app</span>
            </button>
          )}
          {(music || mostrarBotonNotif) && (
            <div style={{ display: 'flex', gap: 8 }}>
              {music && (
                <button
                  onClick={music.toggleMuted}
                  onMouseEnter={() => setHoveredBtn('musica')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  className="btn-sidernav"
                  style={{ margin: 0, flex: 1, height: 44, justifyContent: 'center', padding: '0 10px', gap: 8 }}
                  aria-label={music.muted ? 'Activar música' : 'Silenciar música'}
                >
                  <span style={{
                    fontSize: '0.95rem',
                    width: '26px', height: '26px',
                    background: 'rgba(124, 92, 191, 0.15)',
                    color: '#7c5cbf',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    {music.muted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </span>
                  {/* Sin el botón de notificaciones al lado, el de música
                      queda solo y angosto: se le agrega el texto para que no
                      se vea como un icono suelto sin explicación. Con los
                      dos botones juntos, el texto no cabe cómodo — se deja
                      solo el icono (el aria-label sigue cubriendo a11y). */}
                  {!mostrarBotonNotif && <span>{music.muted ? 'Activar música' : 'Silenciar música'}</span>}
                </button>
              )}
              {mostrarBotonNotif && (
                <button
                  onClick={alternarNotificaciones}
                  disabled={cambiandoNotif || notifActivas === null}
                  onMouseEnter={() => setHoveredBtn('notif-estudio')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  className="btn-sidernav"
                  style={{ margin: 0, flex: 1, height: 44, justifyContent: 'center', padding: '0 10px', opacity: cambiandoNotif ? 0.7 : 1 }}
                  aria-label={notifActivas ? 'Desactivar recordatorios de estudio' : 'Activar recordatorios de estudio'}
                >
                  <span style={{
                    fontSize: '0.95rem',
                    width: '26px', height: '26px',
                    background: 'rgba(79, 142, 247, 0.15)',
                    color: '#4f8ef7',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    {notifActivas ? <HiOutlineBellSlash /> : <HiOutlineBell />}
                  </span>
                </button>
              )}
            </div>
          )}
          {errorNotif && (
            <p role="alert" style={{ margin: '-4px 4px 0', fontSize: '0.76rem', lineHeight: 1.4, color: 'var(--wrong)' }}>
              {errorNotif}
            </p>
          )}
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
                height: 44,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            // Un solo acceso: el login por pasos ya ofrece "¿No tienes
            // cuenta? Crea una" desde su primera pantalla.
            <button
                onClick={() => ir('/login')}
                onMouseEnter={() => setHoveredBtn('login')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  background: hoveredBtn === 'login' ? '#6b4fa3' : '#7c5cbf',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  height: 44,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(124, 92, 191, 0.25)'
                }}
              >
                Iniciar sesión
              </button>
          )}
        </div>

      </div>
    </>
  )
}