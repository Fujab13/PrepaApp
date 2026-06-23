import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { STORE_ITEMS } from '../data/storeItems'

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

    
    const result = await startRealPayment(item)
    if (result.ok) {
      mostrarFeedback('success', `¡Compra confirmada: "${item.nombre}"!`)
    } else if (result.reason === 'payment_gateway_not_implemented') {
      mostrarFeedback('error', 'Pagos con dinero real próximamente')
    } else {
      mostrarFeedback('error', 'No se pudo procesar el pago')
    }
    setLoadingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        
        <button
          onClick={() => navigate('/')}
          title="Salir"
          style={{
            flexShrink: 0,
            background: 'var(--surface)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            width: 34,
            height: 34,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        ✕
        </button>
        <span style={{ fontSize: '1.4rem', width: '30px', textAlign: 'center' }}>
          🏢
        </span>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
          Tienda
        </h1>
        
        {/* 🔅💲🔵🟨🔳🌀🍉🌱🎫 */}
        <div style={{
          marginLeft: 'auto',
          background: 'var(--surface)',
          borderRadius: '999px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          💲{coins}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

        <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
        }}>
  
        <p style={{ color: 'var(--text)', fontSize: '1.05rem', textAlign: 'justify', margin: 0 }}>
          Me encuentro entre aquellos que piensan que la ciencia tiene una gran belleza [...]
        </p>
        
        <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textAlign: 'right', margin: '4px 0 0 0' }}>
          Marie Curie 1933 
        </p>
  
        </div>

        {categorias.map(categoria => (
          <div key={categoria} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              {categoria}
            </p>

            {STORE_ITEMS.filter(i => i.categoria === categoria).map(item => {
              const owned = ownsItem(item.id)
              const isLoading = loadingId === item.id
              const puedeComprar = item.type === 'coins' ? coins >= item.priceCoins : true

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      fontSize: '1.8rem',
                      width: '52px', height: '52px',
                      background: 'var(--surface2)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icono}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{item.nombre}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        {item.descripcion}
                      </p>
                    </div>
                  </div>

                  <button
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
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      width: '100%',
                      opacity: isLoading ? 0.6 : 1,
                      cursor: owned ? 'default' : 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {owned
                      ? '✓ Ya lo tienes'
                      : isLoading
                        ? 'Procesando…'
                        : item.type === 'coins'
                          ? ` ${item.priceCoins} monedas`
                          : `$${item.priceMXN} MXN`
                    }
                  </button>
                </div>
              )
            })}
          </div>
        ))}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', marginTop: 4 }}>
          Los pagos con dinero real se procesan de forma segura por un proveedor externo.
        </p>
      </div>

      {feedback && (
        <div style={{
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