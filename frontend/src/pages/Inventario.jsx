import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

import { AiOutlineClose } from "react-icons/ai";

export default function Inventario({ onClose, onNavigateStore }) {
  const navigate = useNavigate();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  
  const pressTimer = useRef(null);

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

  // Cargar inventario del usuario actual
  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Consulta uniendo inventario_usuario con productos
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

  // Manejo de clic sostenido (Long Press para móviles y escritorio)
  const handleTouchStart = (item, e) => {
    e.persist();
    pressTimer.current = setTimeout(() => {
      openActionMenu(item, e);
    }, 600); // 600ms de presión sostenida
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const openActionMenu = (item, e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    setSelectedItem(item);
    setMenuPosition({ x: clientX || window.innerWidth / 2, y: clientY || window.innerHeight / 2 });
  };

  // Alternar estado preferente (Simulado mediante un campo en metadata o lógica local/estado de BD)
  // Nota: Para persistir los preferentes puedes añadir un campo booleano 'preferente' en la tabla inventario_usuario
  const togglePreferente = async (item) => {
    // Ejemplo de actualización lógica o en base de datos si agregas la columna 'preferente'
    const currentMetadata = item.productos.metadata || {};
    const nuevoEstadoPreferente = !currentMetadata.preferente;

    const updatedMetadata = { ...currentMetadata, preferente: nuevoEstadoPreferente };

    // Actualizamos localmente para fluidez inmediata
    setInventario(prev => prev.map(inv => {
      if (inv.producto_id === item.producto_id) {
        return {
          ...inv,
          productos: { ...inv.productos, metadata: updatedMetadata }
        };
      }
      return inv;
    }));

    setSelectedItem(null);
    setMenuPosition(null);
  };

  // Separar elementos en Zona Azul (Preferentes) y Zona Negra (No preferentes / Guardados)
  const preferredItems = inventario.filter(item => item.productos?.metadata?.preferente);
  const standardItems = inventario.filter(item => !item.productos?.metadata?.preferente);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>
        <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 0 12px',
                marginTop: '15px',
              }}>
                {/* 1. Botón Salir */}
                <button
                  onClick={handleClose}
                  title="Salir"
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text)', 
                    fontSize: '1.4rem', 
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0 
                  }}
                >
                  <AiOutlineClose />
                </button>
                <h2 style={{ color: 'var(--text)', fontSize: '1.2rem', margin: 0 }}>Inventario</h2>
                </div>
        {loading ? (
          <p style={styles.loadingText}>Cargando inventario...</p>
        ) : (
          <div style={styles.gridContainer}>
            {/* ZONA AZUL: Elementos Preferentes */}
            <div style={styles.zoneBlue}>
              {preferredItems.map((item) => (
                <div
                  key={item.producto_id}
                  style={styles.cardBlue}
                  onMouseDown={(e) => handleTouchStart(item, e)}
                  onMouseUp={handleTouchEnd}
                  onTouchStart={(e) => handleTouchStart(item, e)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div style={styles.cardContent}>
                    <span style={styles.productName}>{item.productos?.nombre || 'Producto'}</span>
                    <span style={styles.productType}>{item.productos?.tipo_producto}</span>
                  </div>
                </div>
              ))}
              {/* Rellenar espacios vacíos visuales si se desea mantener estructura de cuadrícula */}
              {preferredItems.length === 0 && (
                <div style={styles.emptyZoneText}>Mantén presionado un elemento inferior para añadirlo a preferentes (Zona Azul).</div>
              )}
            </div>

            {/* ZONA NEGRA: Elementos del usuario guardados */}
            <div style={styles.zoneBlack}>
              {standardItems.map((item) => (
                <div
                  key={item.producto_id}
                  style={styles.cardBlack}
                  onMouseDown={(e) => handleTouchStart(item, e)}
                  onMouseUp={handleTouchEnd}
                  onTouchStart={(e) => handleTouchStart(item, e)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div style={styles.cardContent}>
                    <span style={styles.productNameMuted}>{item.productos?.nombre || 'Producto'}</span>
                    <span style={styles.productTypeMuted}>{item.productos?.tipo_producto}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel de Acciones flotante (Clic Sostenido) */}
        {selectedItem && menuPosition && (
          <div style={styles.contextMenuOverlay} onClick={() => { setSelectedItem(null); setMenuPosition(null); }}>
            <div style={{ ...styles.contextMenu, top: Math.min(menuPosition.y, window.innerHeight - 200), left: Math.min(menuPosition.x, window.innerWidth - 220) }}>
              <p style={styles.menuTitle}>{selectedItem.productos?.nombre}</p>
              <button 
                style={styles.menuButton} 
                onClick={() => togglePreferente(selectedItem)}
              >
                {selectedItem.productos?.metadata?.preferente ? '⭐ Quitar de Preferentes' : '⭐ Fijar en Zona Azul'}
              </button>
              <button 
                style={styles.menuButton} 
                onClick={() => { setSelectedItem(null); if(onNavigateStore) onNavigateStore(); }}
              >
                🛒 Ir a la Tienda
              </button>
              <button 
                style={styles.menuButtonFuture} 
                onClick={() => alert('Función futura en desarrollo')}
              >
                ✨ Opción Futura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos basados estrictamente en las variables solicitadas
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #1a1a2e',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#f0f0f0',
    fontSize: '18px',
    cursor: 'pointer',
    marginRight: '15px',
  },
  title: {
    color: '#f0f0f0',
    fontSize: '20px',
    margin: 0,
    fontWeight: '600',
  },
  loadingText: {
    color: '#846c89',
    textAlign: 'center',
    padding: '40px',
  },
  gridContainer: {
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  zoneBlue: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    border: '1px solid rgba(132, 108, 137, 0.3)',
  },
  zoneBlack: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  cardBlue: {
    background: 'linear-gradient(135deg, #22223b 0%, #1a1a2e 100%)',
    borderRadius: '12px',
    height: '75px',
    border: '2px solid #846c89',
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'center',
    padding: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(132, 108, 137, 0.2)',
    userSelect: 'none',
    transition: 'transform 0.1s ease',
  },
  cardBlack: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    height: '75px',
    border: '2px solid #22223b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.1s ease',
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
  productNameMuted: {
    color: '#846c89',
    fontSize: '11px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  productTypeMuted: {
    color: '#846c89',
    fontSize: '9px',
    textTransform: 'uppercase',
  },
  emptyZoneText: {
    gridColumn: 'span 3',
    color: '#846c89',
    fontSize: '12px',
    textAlign: 'center',
    padding: '20px 0',
  },
  contextMenuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 2000,
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#22223b',
    borderRadius: '12px',
    padding: '10px',
    width: '200px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #846c89',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  menuTitle: {
    color: '#f0f0f0',
    fontSize: '12px',
    fontWeight: '600',
    margin: '0 0 5px 0',
    borderBottom: '1px solid #1a1a2e',
    paddingBottom: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuButton: {
    backgroundColor: '#1a1a2e',
    color: '#f0f0f0',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '12px',
    cursor: 'pointer',
  },
  menuButtonFuture: {
    backgroundColor: '#1a1a2e',
    color: '#846c89',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '12px',
    cursor: 'pointer',
  },
};