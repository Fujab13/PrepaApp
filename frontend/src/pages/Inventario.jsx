import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { cargarYCachearLeccion } from '../services/leccionesPremium';

import { AiOutlineClose } from "react-icons/ai";

export default function Inventario({ onClose, onNavigateStore }) {
  const navigate = useNavigate();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoLeccionId, setCargandoLeccionId] = useState(null);
  const [errorLeccion, setErrorLeccion] = useState('');

  const abrirLeccion = async (item) => {
    const producto = item.productos;
    if (!producto?.nombre) return;

    try {
      setErrorLeccion('');
      setCargandoLeccionId(item.producto_id);
      await cargarYCachearLeccion(item.producto_id, producto.nombre);
      navigate(`/leccion/premium-${item.producto_id}`);
    } catch (err) {
      console.error('Error al abrir la lección premium:', err);
      setErrorLeccion('No se pudo abrir la lección. Intenta de nuevo.');
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

  useEffect(() => {
    fetchInventario();
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
    abrirLeccion(item);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

      <div className="page-topbar-compact">
        <button onClick={handleClose} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title">Inventario</h2>
      </div>

      <div className="page-content-compact" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {errorLeccion && (
          <p style={{ color: 'salmon' }}>{errorLeccion}</p>
        )}
        {loading ? (
          <p style={styles.loadingText}>Cargando inventario...</p>
        ) : (
          <div style={styles.gridContainer}>
            <div style={styles.zoneBlue}>
              {inventario.map((item) => (
                <div
                  key={item.producto_id}
                  style={styles.cardBlue}
                  onClick={() => handleItemClick(item)}
                >
                  <div style={styles.cardContent}>
                    <span style={styles.productName}>{item.productos?.nombre || 'Producto'}</span>
                    <span style={styles.productType}>{item.productos?.tipo_producto}</span>
                    {cargandoLeccionId === item.producto_id && (
                      <span style={styles.loadingTag}>Cargando…</span>
                    )}
                  </div>
                </div>
              ))}
              {inventario.length === 0 && (
                <div style={styles.emptyZoneText}>Tu inventario está vacío por el momento.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos basados estrictamente en las variables solicitadas
const styles = {
  loadingText: {
    color: '#846c89',
    textAlign: 'center',
    padding: '40px',
  },
  gridContainer: {
    padding: '20px 0',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
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
    maxWidth: '420px',
    minHeight: '260px',
    alignSelf: 'center',
  },
  cardBlue: {
    background: 'linear-gradient(135deg, #14213d 0%, #0f172a 100%)',
    borderRadius: '12px',
    height: '75px',
    border: '1px solid rgba(71, 166, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 0 1px rgba(71, 166, 255, 0.2), 0 0 12px rgba(71, 166, 255, 0.35), inset 0 0 8px rgba(71, 166, 255, 0.18)',
    userSelect: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
  },
  productName: {
    color: '#f0f0f0',
    fontSize: '11px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  productType: {
    color: '#4ade80',
    fontSize: '9px',
    textTransform: 'uppercase',
  },
  emptyZoneText: {
    gridColumn: 'span 3',
    color: '#8ec5ff',
    fontSize: '12px',
    textAlign: 'center',
    padding: '20px 0',
  },
};