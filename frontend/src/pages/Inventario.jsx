import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { cargarYCachearLeccion } from '../services/leccionesPremium';
import { cargarYCachearExamen } from '../services/examenesPremium';
import { obtenerMetaProducto } from '../data/storeItems';
import { renderIconoMateria } from '../utils/renderIconoMateria';

import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineArchiveBoxXMark, HiOutlineSquares2X2 } from "react-icons/hi2";

export default function Inventario({ onClose, onNavigateStore }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoLeccionId, setCargandoLeccionId] = useState(null);
  const [errorLeccion, setErrorLeccion] = useState('');

  // Red de seguridad tras volver de pagar en la Tienda (?session_id=... en
  // el success_url de crear-sesion-pago): el webhook de Stripe puede tardar
  // o fallar, así que se le pregunta a Stripe directamente por el estado
  // real de esa sesión antes de leer el inventario — mismo patrón que ya
  // usa OfertaConfirmada.jsx (ver verificar-pago-producto). Sin esto, el
  // alumno podía regresar de pagar y ver su compra "desaparecida" hasta
  // que el webhook llegara o refrescara la página más tarde por su cuenta.
  const [confirmandoCompra, setConfirmandoCompra] = useState(Boolean(searchParams.get('session_id')));

  // Punto único para abrir cualquier producto del inventario: según su tipo,
  // descarga+cachea desde el bucket privado correspondiente (mismo patrón
  // para lecciones y para exámenes, ver leccionesPremium.js/examenesPremium.js)
  // y navega a la vista que lo consume.
  const abrirProducto = async (item) => {
    const producto = item.productos;
    if (!producto?.nombre) return;

    try {
      setErrorLeccion('');
      setCargandoLeccionId(item.producto_id);
      if (producto.tipo_producto === 'intento_examen') {
        // A diferencia de las lecciones (que usan producto.nombre como key
        // del bucket), los exámenes usan producto.sku: Supabase Storage
        // rechaza keys con acentos/espacios y el nombre de este producto
        // los tiene (ver examenesPremium.js).
        if (!producto.sku) throw new Error('Este examen no tiene un identificador de archivo configurado.');
        await cargarYCachearExamen(item.producto_id, producto.sku);
        navigate(`/examen/premium-${item.producto_id}`);
      } else {
        await cargarYCachearLeccion(item.producto_id, producto.nombre);
        navigate(`/leccion/premium-${item.producto_id}`);
      }
    } catch (err) {
      console.error('Error al abrir el producto del inventario:', err);
      setErrorLeccion('No se pudo abrir. Intenta de nuevo.');
    } finally {
      setCargandoLeccionId(null);
    }
  };
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const irATienda = () => {
    if (typeof onNavigateStore === 'function') {
      onNavigateStore();
      return;
    }
    navigate('/tienda');
  };

  async function verificarConStripe(sessionId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verificar-pago-producto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      return data?.estado_pago ?? null;
    } catch (err) {
      console.error('No se pudo verificar el pago directamente con Stripe:', err);
      return null;
    }
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      fetchInventario();
      return;
    }

    let cancelado = false;

    (async () => {
      // Casi siempre basta el primer intento (Stripe ya marcó la sesión
      // como pagada en cuanto el checkout redirige de vuelta); el par de
      // reintentos es solo por si el webhook y esta verificación llegan
      // casi al mismo tiempo y hay que darle un instante más.
      for (let intento = 0; intento < 3; intento++) {
        const estado = await verificarConStripe(sessionId);
        if (cancelado) return;
        if (estado === 'completado' || estado === 'cancelado' || estado === 'expirado') break;
        if (intento < 2) await new Promise((r) => setTimeout(r, 1500));
      }
      if (cancelado) return;

      // Limpia session_id de la URL: sin esto, un refresh en /inventario
      // volvería a disparar la verificación cada vez.
      const siguientes = new URLSearchParams(searchParams);
      siguientes.delete('session_id');
      setSearchParams(siguientes, { replace: true });

      setConfirmandoCompra(false);
      fetchInventario();
    })();

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventario = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('inventario_usuario')
        .select(`
          user_id,
          producto_id,
          fecha_adquisicion,
          productos (
            id,
            nombre,
            descripcion,
            tipo_producto,
            sku,
            metadata
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setInventario(data || []);
    } catch (error) {
      console.error('Error al cargar el inventario:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    abrirProducto(item);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

      <div className="page-topbar-compact">
        <button onClick={handleClose} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title">Inventario</h2>
        {!loading && inventario.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {inventario.length} {inventario.length === 1 ? 'objeto' : 'objetos'}
          </span>
        )}
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {errorLeccion && (
          <p style={{ color: 'var(--wrong)', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorLeccion}</p>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0' }}>
            <AiOutlineLoading3Quarters className="spin" style={{ fontSize: '1.4rem', color: '#47a6ff' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              {confirmandoCompra ? 'Confirmando tu compra…' : 'Cargando tu inventario…'}
            </p>
            {confirmandoCompra && (
              <p style={{ color: 'var(--text-muted)', fontSize: 11.5, margin: 0 }}>Esto puede tardar unos segundos.</p>
            )}
          </div>
        ) : inventario.length === 0 ? (
          <div className="sp-card" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div
              className="sp-card-icon"
              style={{ width: 52, height: 52, fontSize: '1.6rem', margin: '0 auto', background: 'rgba(71, 166, 255, 0.14)', color: '#47a6ff' }}
            >
              <HiOutlineArchiveBoxXMark />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text)', margin: '10px 0 4px', fontWeight: 700 }}>
              Tu inventario está vacío
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Lo que compres en la tienda va a aparecer aquí.
            </p>
            <button
              type="button"
              onClick={irATienda}
              className="gm-cta"
              style={{
                minHeight: 44, padding: '0 22px', borderRadius: 12, border: 'none',
                background: '#7c5cbf', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 92, 191, 0.3)',
              }}
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 7,
                background: 'rgba(71, 166, 255, 0.18)', color: '#47a6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', flexShrink: 0,
              }}>
                <HiOutlineSquares2X2 />
              </span>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1.3px', margin: 0,
              }}>
                Tu colección
              </p>
            </div>

            <div style={styles.zoneBlue}>
              {inventario.map((item) => {
                const meta = obtenerMetaProducto(item.productos || {});
                const cargandoEsteItem = cargandoLeccionId === item.producto_id;
                return (
                  <button
                    key={item.producto_id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    disabled={cargandoEsteItem}
                    className="gm-cta"
                    style={styles.cardBlue}
                  >
                    <div style={styles.cardIcon}>
                      {cargandoEsteItem
                        ? <AiOutlineLoading3Quarters className="spin" style={{ fontSize: '1.05rem' }} />
                        : renderIconoMateria(meta.icono, { size: 18 })}
                    </div>
                    <span style={styles.productName}>
                      {meta.titulo || item.productos?.nombre || 'Producto'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Se conserva el look "neón" original de esta pantalla (a diferencia del
// resto de la app, que usa sp-card) pero con el mismo ícono+color con el
// que cada producto ya aparece en Store.jsx (ver obtenerMetaProducto), y
// con feedback táctil real al presionar (gm-cta, global.css) — antes
// .cardBlue declaraba una transición de transform que nunca se disparaba.
const styles = {
  zoneBlue: {
    backgroundColor: '#101227',
    borderRadius: '16px',
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    border: '1px solid rgba(71, 166, 255, 0.5)',
    boxShadow: '0 0 24px rgba(71, 166, 255, 0.2)',
    width: '100%',
  },
  cardBlue: {
    background: 'linear-gradient(135deg, #14213d 0%, #0f172a 100%)',
    borderRadius: '14px',
    minHeight: '92px',
    border: '1px solid rgba(71, 166, 255, 0.55)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 8px',
    cursor: 'pointer',
    boxShadow: '0 0 0 1px rgba(71, 166, 255, 0.15), 0 0 14px rgba(71, 166, 255, 0.3), inset 0 0 10px rgba(71, 166, 255, 0.15)',
    userSelect: 'none',
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    WebkitTapHighlightColor: 'transparent',
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'rgba(124, 92, 191, 0.2)',
    color: '#a78bfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.05rem',
    flexShrink: 0,
    boxShadow: '0 0 10px rgba(124, 92, 191, 0.35)',
  },
  productName: {
    color: '#f0f0f0',
    fontSize: '11px',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
};
