import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'

import { supabase } from '../services/supabaseClient'

import { MdToken, MdWorkspacePremium } from 'react-icons/md'
import { HiOutlineRectangleStack, HiOutlineSparkles, HiOutlineSwatch } from 'react-icons/hi2'
import { FaPaw } from 'react-icons/fa'
import { FaStripe } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { PiShoppingCartSimpleFill } from "react-icons/pi";
import { BiSolidCoin } from "react-icons/bi";
import { PiHexagonDuotone  } from "react-icons/pi";
import { renderIconoMateria } from '../utils/renderIconoMateria'
import { MASCOTAS, paletaSilueta } from '../data/mascotas'
import PixelArt from '../components/PixelArt'

// Referencia estable (ver PixelArt.jsx: memo) — un objeto literal inline en
// el JSX de abajo se recrearía en cada render y anularía la memoización.
const ESTILO_SPRITE_TIENDA = { maxWidth: '100%', height: 'auto', color: 'var(--text-muted)' }

const CATEGORIA_ESTILO = {
  'Práctica extra': { Icon: HiOutlineRectangleStack, tinte: '96, 165, 250' },
  'Suscripción': { Icon: MdWorkspacePremium, tinte: '167, 139, 250' },
  'Personalización': { Icon: HiOutlineSwatch, tinte: '96, 165, 250' },
  'Mascotas': { Icon: FaPaw, tinte: '251, 146, 60' },
}
const ESTILO_DEFAULT = { Icon: HiOutlineSparkles, tinte: '148, 163, 184' }

// Rediseño: lo que se paga con dinero real va primero (ver categorias más
// abajo) — una categoría que no aparezca aquí simplemente cae al final, en
// el orden en que Set la haya recogido.
const ORDEN_CATEGORIAS = ['Suscripción', 'Práctica extra', 'Personalización', 'Mascotas']

// Gesto secreto para admins: 5 toques sobre el saldo de monedas en menos de
// 1.2s abre el panel de ajuste manual (ver panelAdminAbierto más abajo).
const TOQUES_PARA_PANEL_ADMIN = 5
const VENTANA_TOQUES_MS = 1200

export default function Store() {
  const navigate = useNavigate()
  const { coins, ownsItem, purchaseWithCoins, comprarComida, startRealPayment, claimFreeProduct, items, productosLoading, temaActivo, elegirTema, ajustarMonedasAdmin } = useStore()
  const { esAdmin } = useAuth()
  const [feedback, setFeedback] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  // Panel de pruebas (solo admin): oculto para cualquier otra cuenta, ni
  // siquiera con un cursor distinto al tocar el saldo — no hay pista visual
  // de que existe.
  const toquesAdminRef = useRef(0)
  const reinicioToquesRef = useRef(null)
  const [panelAdminAbierto, setPanelAdminAbierto] = useState(false)
  const [montoAdmin, setMontoAdmin] = useState('500')

  function tocarSaldo() {
    if (!esAdmin) return
    toquesAdminRef.current += 1
    clearTimeout(reinicioToquesRef.current)
    if (toquesAdminRef.current >= TOQUES_PARA_PANEL_ADMIN) {
      toquesAdminRef.current = 0
      setPanelAdminAbierto(true)
      return
    }
    reinicioToquesRef.current = setTimeout(() => { toquesAdminRef.current = 0 }, VENTANA_TOQUES_MS)
  }

  function aplicarAjusteAdmin(signo) {
    const monto = Math.round(Number(montoAdmin))
    if (!Number.isFinite(monto) || monto <= 0) return
    ajustarMonedasAdmin(monto * signo)
  }

  const categorias = useMemo(() => {
    const set = new Set(items.map(i => i.categoria))
    return Array.from(set).sort((a, b) => {
      const ia = ORDEN_CATEGORIAS.indexOf(a)
      const ib = ORDEN_CATEGORIAS.indexOf(b)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [items])

  // Primera categoría que ya es "de monedas" (todos sus items type:'coins')
  // — se usa solo para pintar un separador visual justo antes, marcando
  // dónde termina lo que se paga con dinero real y empieza lo demás.
  const primeraCategoriaMonedas = useMemo(() => {
    return categorias.find(cat => items.find(i => i.categoria === cat)?.type === 'coins')
  }, [categorias, items])

  // Tarjeta "banner" genérica (ícono + descripción + botón de precio) — la
  // usan todas las categorías salvo Mascotas, que en cambio muestra el
  // sprite real (ver más abajo). También cubre a los items de Mascotas que
  // NO son una mascota en sí (el Snack Pack de comida), para que no
  // desaparezcan de la tienda por no tener `mascotaId`.
  function tarjetaGenerica(item) {
    const owned = ownsItem(item.id)
    const isLoading = loadingId === item.id
    const puedeComprar = item.type === 'coins' ? coins >= item.priceCoins : true

    // Un item con `temaId` (ver storeItems.js) no se "consume": una vez
    // comprado, el mismo botón pasa a ser un toggle de activar/desactivar
    // ese tema en vez de quedar inerte con "propietario".
    const esTema = Boolean(item.temaId)
    const temaEstaActivo = esTema && temaActivo === item.temaId

    const iconColor = item.type === 'coins' ? '#facc15' : '#7c5cbf'
    const iconBg = item.type === 'coins' ? 'rgba(250, 204, 21, 0.16)' : 'rgba(124, 92, 191, 0.16)'

    return (
      <div key={item.id} className="sp-card">
        <div className="sp-card-header">
          <div className="sp-card-icon" style={{ background: iconBg, color: iconColor }}>
            {renderIconoMateria(item.icono, { size: 24 })}
          </div>
          <div className="sp-card-body">
            <p className="sp-card-title">{item.nombre}</p>
            <p className="sp-card-description">{item.descripcion}</p>
          </div>
        </div>

        <button
          className="btn-footer-scroll"
          onClick={() => (owned && esTema ? elegirTema(temaEstaActivo ? null : item.temaId) : manejarCompra(item))}
          disabled={(owned && !esTema) || isLoading || (item.type === 'coins' && !owned && !puedeComprar)}
          style={{
            background: temaEstaActivo
              ? 'var(--correct)'
              : owned
                ? 'var(--surface2)'
                : item.type === 'coins'
                  ? (puedeComprar ? '#facc15' : 'var(--surface)')
                  : '#7c5cbf',
            color: temaEstaActivo
              ? '#04140c'
              : owned
                ? 'var(--text)'
                : item.type === 'coins'
                  ? (puedeComprar ? '#000000' : 'var(--text-muted)')
                  : '#ffffff',
            opacity: isLoading ? 0.75 : 1,
            cursor: (owned && !esTema) || (item.type === 'coins' && !owned && !puedeComprar) ? 'default' : 'pointer',
          }}
        >
          {owned
            ? (esTema ? (temaEstaActivo ? 'Tema activo ✓' : 'Activar') : 'propietario')
            : isLoading
              ? (<><span className="sp-spinner" />Procesando…</>)
              : item.type === 'coins'
                ? (item.priceCoins === 0 ? 'Gratis' : `${item.priceCoins} monedas`)
                : item.priceMXN === 0
                  ? 'Gratis'
                  : `$${item.priceMXN} MXN`
          }
        </button>
      </div>
    )
  }

  function mostrarFeedback(type, text) {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 2200)
  }

  async function manejarCompra(item) {
    if (ownsItem(item.id) || loadingId) return
    setLoadingId(item.id)

    // --- monedas internas ---
    if (item.type === 'coins') {
      // La comida es consumible (se puede comprar varias veces, ver
      // comprarComida en StoreContext.jsx) — todo lo demás es un
      // desbloqueo único de toda la vida (purchaseWithCoins).
      const result = item.comidaCantidad ? comprarComida(item) : purchaseWithCoins(item)
      if (result.ok) {
        mostrarFeedback('success', item.comidaCantidad
          ? `+${item.comidaCantidad} de comida para tus mascotas`
          : `¡Desbloqueaste "${item.nombre}"!`)
      } else if (result.reason === 'insufficient_funds') {
        mostrarFeedback('error', 'No tienes suficientes monedas')
      } else {
        mostrarFeedback('error', 'Ya tienes este artículo')
      }
      setLoadingId(null)
      return
    }

    // --- producto real gratuito (precio $0 en Supabase): sin Stripe ---
    if (item.type === 'real' && item.priceMXN === 0) {
      const result = await claimFreeProduct(item.productoId)
      if (result.ok) {
        mostrarFeedback('success', `¡Desbloqueaste "${item.nombre}"!`)
      } else {
        mostrarFeedback('error', 'No se pudo activar la lección gratuita')
      }
      setLoadingId(null)
      return
    }

    // --- dinero real, sin producto de Stripe configurado todavía ---
    if (!item.productoId) {
      const result = await startRealPayment(item)
      if (result.ok) {
        mostrarFeedback('success', `¡Compra confirmada: "${item.nombre}"!`)
      } else if (result.reason === 'payment_gateway_not_implemented') {
        mostrarFeedback('error', 'Pagos con dinero real próximamente')
      } else {
        mostrarFeedback('error', 'No se pudo procesar el pago')
      }
      setLoadingId(null)
      return
    }

    // --- Compra con dinero real vía Stripe Checkout ---
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        mostrarFeedback('error', 'Inicia sesión para comprar')
        setLoadingId(null)
        return
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-sesion-pago`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ producto_id: item.productoId, cantidad: 1 }),
        }
      )

      const data = await res.json()

      if (!res.ok || data.error || !data.url) {
        mostrarFeedback('error', data.error || 'No se pudo iniciar el pago')
        setLoadingId(null)
        return
      }

      window.location.href = data.url // redirige a Stripe Checkout
    } catch (err) {
      console.error(err)
      mostrarFeedback('error', 'No se pudo procesar el pago')
      setLoadingId(null)
    }
  }

  return (
    // className="suspension-temporal" inert="true" 
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="sp-header page-topbar-compact" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => navigate('/')}
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
        <span style={{ fontSize: '1.3rem', width: '28px', textAlign: 'center', color: 'var(--text)' }}>
          <PiShoppingCartSimpleFill />
        </span>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Tienda
        </h1>

        <div
          onClick={tocarSaldo}
          style={{
            marginLeft: 'auto',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            fontSize: '0.88rem'
          }}>
          <PiHexagonDuotone   style={{ color: '#facc15', fontSize: '1.05rem' }} />
          {coins}
        </div>
      </div>

      <div className="page-content-compact" style={{ paddingTop: 20, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>

        {productosLoading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
            Cargando tienda…
          </p>
        )}

        {categorias.map(categoria => {
          const { Icon, tinte } = CATEGORIA_ESTILO[categoria] || ESTILO_DEFAULT

          return (
            <div key={categoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoria === primeraCategoriaMonedas && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  margin: '4px 0 8px', color: 'var(--text-muted)',
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.3px',
                }}>
                  <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  Con monedas
                  <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22, height: 22,
                  borderRadius: '7px',
                  background: `rgba(${tinte}, 0.18)`,
                  color: `rgb(${tinte})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  <Icon />
                </span>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.3px',
                  margin: 0
                }}>
                  {categoria}
                </p>
              </div>

              {categoria === 'Mascotas' ? (
                <>
                  {/* Lo que NO es una mascota en sí (el Snack Pack de
                      comida) va primero, con el banner genérico — antes de
                      la grilla de sprites, para que se lea como "el
                      insumo" y no se pierda entre las mascotas. */}
                  {items.some(i => i.categoria === categoria && !i.mascotaId) && (
                    <div className="sp-grid" style={{ marginBottom: 10 }}>
                      {items.filter(i => i.categoria === categoria && !i.mascotaId).map(tarjetaGenerica)}
                    </div>
                  )}

                  {/* Mismo diseño que "Tu colección" en Mascota.jsx: sprite
                      real (en gris/silueta si aún no es tuya, vía
                      currentColor), en vez del banner genérico de
                      ícono/descripción/precio fijo del resto de la tienda —
                      para mascotas, ver el sprite de verdad importa más que
                      un ícono representativo. La felicidad NO se muestra
                      aquí a propósito (solo en Mi Mascota → Tu colección):
                      la tienda es para comprar, no para vigilar cuidado. */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {items.filter(i => i.categoria === categoria && i.mascotaId).map(item => {
                      const mascota = MASCOTAS.find(m => m.id === item.mascotaId)
                      if (!mascota) return null

                      const owned = ownsItem(item.id)
                      const isLoading = loadingId === item.id
                      const puedeComprar = coins >= item.priceCoins
                      const paletaMostrada = owned ? mascota.paleta : paletaSilueta(mascota.id)

                      return (
                        <div key={item.id} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          borderRadius: 14, padding: '14px 8px',
                          opacity: owned ? 1 : 0.55,
                          // Sin esto, el ancho fijo del PixelArt (columnas ×
                          // size en px) obliga a esta columna del grid a no
                          // encogerse nunca por debajo de ese tamaño, aunque
                          // el contenedor de la sección sí se ajuste.
                          minWidth: 0,
                        }}>
                          <PixelArt grid={mascota.grid} paleta={paletaMostrada} size={4} style={ESTILO_SPRITE_TIENDA} />
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
                            {mascota.nombre}
                          </span>
                          {owned ? (
                            <span style={{
                              minHeight: 36, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
                            }}>
                              propietario
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => manejarCompra(item)}
                              disabled={isLoading || !puedeComprar}
                              className="btn-footer-scroll"
                              style={{
                                fontSize: 10.5, padding: '8px 6px', minHeight: 36, width: '100%',
                                opacity: isLoading ? 0.75 : 1,
                                cursor: puedeComprar ? 'pointer' : 'default',
                              }}
                            >
                              {isLoading
                                ? 'Procesando…'
                                : (item.priceCoins === 0 ? 'Gratis' : `${item.priceCoins} monedas`)}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="sp-grid">
                  {items.filter(i => i.categoria === categoria).map(tarjetaGenerica)}
                </div>
              )}
            </div>
          )
        })}

        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.7rem', 
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px' 
        }}> 
          <span>Tus pagos están protegidos y procesados por</span>
          <a href="https://stripe.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none', 
              cursor: 'pointer'
            }}
          >
            <FaStripe size="3.1em" />
          </a>
        </p>

        
      </div>

      {feedback && (
        <div className="sp-toast" style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: feedback.type === 'success' ? 'var(--correct)' : 'var(--wrong)',
          color: '#000000',
          fontWeight: 700,
          fontSize: '0.85rem',
          padding: '12px 20px',
          borderRadius: '12px',
          maxWidth: '90%',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          zIndex: 200
        }}>
          {feedback.text}
        </div>
      )}

      {/* Panel de pruebas para admin: solo llega a existir en el DOM si
          esAdmin (ver tocarSaldo) — nada que un usuario normal pueda
          "encontrar" inspeccionando el árbol, ni con esAdmin en false. */}
      {esAdmin && panelAdminAbierto && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, zIndex: 300,
          }}
          onClick={() => setPanelAdminAbierto(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 320,
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 20,
              display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.6)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Solo admin · pruebas
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
                Saldo actual: {coins} monedas
              </p>
            </div>

            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={montoAdmin}
              onChange={e => setMontoAdmin(e.target.value)}
              style={{
                width: '100%', minHeight: 44, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'var(--surface2)', color: 'var(--text)',
                fontSize: '1rem', fontWeight: 600, padding: '0 14px',
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => aplicarAjusteAdmin(1)}
                style={{
                  flex: 1, minHeight: 44, borderRadius: 10, border: 'none',
                  background: 'var(--correct)', color: '#04140c',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                + Añadir
              </button>
              <button
                type="button"
                onClick={() => aplicarAjusteAdmin(-1)}
                style={{
                  flex: 1, minHeight: 44, borderRadius: 10, border: 'none',
                  background: 'var(--wrong)', color: '#2a0a0a',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                − Quitar
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPanelAdminAbierto(false)}
              style={{
                minHeight: 44, borderRadius: 10, border: 'none',
                background: 'transparent', color: 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}