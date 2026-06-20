import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const StoreContext = createContext(null)

const COINS_KEY = 'user_coins'
const INVENTORY_KEY = 'user_inventory'

// TODO(migración): cuando exista tabla `wallets` / `purchases` en Supabase,
// reemplazar lectura/escritura de localStorage por selects/upserts a la BD,
// idealmente sincronizados por `user.id` desde useAuth().
export function StoreProvider({ children }) {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(COINS_KEY)
    return saved !== null ? Number(saved) : 10000 // monedas de bienvenida
  })

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(INVENTORY_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(COINS_KEY, String(coins))
  }, [coins])

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  }, [inventory])

  const addCoins = useCallback((amount) => {
    setCoins(prev => prev + amount)
  }, [])

  const ownsItem = useCallback((itemId) => inventory.includes(itemId), [inventory])

  // Compra con monedas internas (gamificación, sin dinero real)
  const purchaseWithCoins = useCallback((item) => {
    if (inventory.includes(item.id)) {
      return { ok: false, reason: 'already_owned' }
    }
    if (coins < item.priceCoins) {
      return { ok: false, reason: 'insufficient_funds' }
    }
    setCoins(prev => prev - item.priceCoins)
    setInventory(prev => [...prev, item.id])
    return { ok: true }
  }, [coins, inventory])

  // Punto de integración para la pasarela de pago real (dinero real).
  // Tu amigo debe reemplazar el cuerpo de esta función por la llamada
  // a su SDK/checkout (Stripe, Mercado Pago, etc). Debe:
  //  1. Iniciar el proceso de pago con item.priceMXN (o la moneda que use)
  //  2. Esperar confirmación del proveedor (webhook o callback)
  //  3. Si se confirma, llamar a grantPurchase(item.id) para desbloquear el item
  // Mientras tanto, devuelve "pending" para no romper la UI.
  const startRealPayment = useCallback(async (item) => {
    // TODO(pasarela de pago): integrar aquí el SDK de pagos.
    // Ejemplo de forma esperada una vez integrado:
    //   const result = await paymentSDK.checkout({ amount: item.priceMXN, itemId: item.id })
    //   if (result.status === 'approved') grantPurchase(item.id)
    console.warn('[Store] Pasarela de pago no implementada todavía.', item)
    return { ok: false, reason: 'payment_gateway_not_implemented' }
  }, [])

  const grantPurchase = useCallback((itemId) => {
    setInventory(prev => prev.includes(itemId) ? prev : [...prev, itemId])
  }, [])

  return (
    <StoreContext.Provider value={{
      coins,
      inventory,
      addCoins,
      ownsItem,
      purchaseWithCoins,
      startRealPayment,
      grantPurchase,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}