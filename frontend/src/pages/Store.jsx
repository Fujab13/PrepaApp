import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { STORE_ITEMS } from '../data/storeItems'

import { supabase } from '../supabase'

import { MdToken, MdWorkspacePremium } from 'react-icons/md'
import { HiOutlineRectangleStack, HiOutlineLifebuoy, HiOutlineSparkles } from 'react-icons/hi2'
import { FaStripe } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { PiShoppingCartSimpleFill } from "react-icons/pi";
import { BiSolidCoin } from "react-icons/bi";
import { PiHexagonDuotone  } from "react-icons/pi";

const CATEGORIA_ESTILO = {
  'Práctica extra': { Icon: HiOutlineRectangleStack, tinte: '96, 165, 250' },
  'Asistencia': { Icon: HiOutlineLifebuoy, tinte: '52, 211, 153' },
  'Suscripción': { Icon: MdWorkspacePremium, tinte: '167, 139, 250' },
}
const ESTILO_DEFAULT = { Icon: HiOutlineSparkles, tinte: '148, 163, 184' }

export default function Store() {
  const navigate = useNavigate()
  const { coins, ownsItem, purchaseWithCoins, startRealPayment } = useStore()
  const [feedback, setFeedback] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  const categorias = useMemo(() => {
    const set = new Set(STORE_ITEMS.map(i => i.categoria))
    return Array.from(set)
  }, [])

  function mostrarFeedback(type, text) {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 2200)
  }

  async function manejarCompra(item) {
    if (ownsItem(item.id) || loadingId) return
    setLoadingId(item.id)

    // --- monedas internas ---
    if (item.type === 'coins') {
      const result = purchaseWithCoins(item)
      if (result.ok) {
        mostrarFeedback('success', `¡Desbloqueaste "${item.nombre}"!`)
      } else if (result.reason === 'insufficient_funds') {
        mostrarFeedback('error', 'No tienes suficientes monedas')
      } else {
        mostrarFeedback('error', 'Ya tienes este artículo')
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="sp-header" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
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

        <div style={{
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

      <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>

        {categorias.map(categoria => {
          const { Icon, tinte } = CATEGORIA_ESTILO[categoria] || ESTILO_DEFAULT

          return (
            <div key={categoria} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

              <div className="sp-grid">
                {STORE_ITEMS.filter(i => i.categoria === categoria).map(item => {
                  const owned = ownsItem(item.id)
                  const isLoading = loadingId === item.id
                  const puedeComprar = item.type === 'coins' ? coins >= item.priceCoins : true

                  return (
                    <div key={item.id} className="sp-card">
                    <div className="sp-card-header">
                      
                      <div className="sp-card-icon"
                        style={{ background: `rgba(${tinte}, 0.14)`,color: `rgb(${tinte})`, }}>
                        {item.icono}
                      </div>
                      
                      <div className="sp-card-body">
                        <p className="sp-card-title">{item.nombre}</p>
                        <p className="sp-card-description">{item.descripcion}</p>
                      </div>
                    </div>

                    <button
                      className="btn-footer-scroll"
                      onClick={() => manejarCompra(item)}
                      disabled={owned || isLoading || (item.type === 'coins' && !puedeComprar)}
                      style={{
                        background: owned
                          ? 'var(--surface2)'
                          : item.type === 'coins'
                            ? (puedeComprar ? '#facc15' : 'var(--surface2)')
                            : '#7c5cbf',
                        color: owned
                          ? 'var(--text-muted)'
                          : item.type === 'coins'
                            ? (puedeComprar ? '#000000' : 'var(--text-muted)')
                            : '#ffffff',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: owned || (item.type === 'coins' && !puedeComprar) ? 'default' : 'pointer',
                      }}
                    >
                      {owned
                        ? 'propietario'
                        : isLoading
                          ? (<><span className="sp-spinner" />Procesando…</>)
                          : item.type === 'coins'
                            ? `${item.priceCoins} monedas`
                            : `$${item.priceMXN} MXN`
                      }
                    </button>
                  </div>
                  )
                })}
              </div>
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
    </div>
  )
}