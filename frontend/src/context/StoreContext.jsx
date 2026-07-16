import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { STORE_ITEMS } from '../data/storeItems'

const StoreContext = createContext(null)

const COINS_KEY = 'user_coins'
const INVENTORY_KEY = 'user_inventory'

// Las "monedas" y el inventario local (localInventory) siguen siendo
// gamificación pura, sin dinero real, por lo que se quedan en localStorage.
// Los productos comprados con dinero real (los que tienen `productoId` en
// storeItems.js) viven en la tabla `inventario_usuario` de Supabase, y es
// tu Edge Function del Webhook la que los escribe cuando Stripe confirma
// el pago — este contexto solo LEE ese resultado.
export function StoreProvider({ children }) {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(COINS_KEY)
    return saved !== null ? Number(saved) : 9790 // monedas de bienvenida
  })

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(INVENTORY_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // --- Sesión de usuario (Supabase Auth) ---
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // --- Inventario real, leído de Supabase (fuente de verdad para compras con dinero) ---
  const [dbInventory, setDbInventory] = useState([]) // [{ producto_id, cantidad_disponible, cantidad_total_adquirida }]
  const [dbInventoryLoading, setDbInventoryLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(COINS_KEY, String(coins))
  }, [coins])

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  }, [inventory])

  // Detecta la sesión actual y se mantiene al tanto de login/logout
  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (activo) {
        setUser(session?.user ?? null)
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  // Trae el saldo de compras reales del usuario desde `inventario_usuario`
  const fetchDbInventory = useCallback(async (userId) => {
    if (!userId) {
      setDbInventory([])
      return
    }

    setDbInventoryLoading(true)
    const { data, error } = await supabase
      .from('inventario_usuario')
      .select('producto_id, cantidad_disponible, cantidad_total_adquirida')
      .eq('user_id', userId)

    if (error) {
      console.error('[Store] No se pudo cargar el inventario desde Supabase:', error)
      setDbInventoryLoading(false)
      return
    }

    setDbInventory(data ?? [])
    setDbInventoryLoading(false)
  }, [])

  useEffect(() => {
    fetchDbInventory(user?.id)
  }, [user, fetchDbInventory])

  // Al volver de Stripe, el navegador vuelve a poner la pestaña en primer
  // plano: aprovechamos ese momento para refrescar el inventario, ya que
  // el Webhook pudo haber confirmado el pago mientras el usuario pagaba.
  useEffect(() => {
    function alVolverALaPestaña() {
      if (document.visibilityState === 'visible') {
        fetchDbInventory(user?.id)
      }
    }
    document.addEventListener('visibilitychange', alVolverALaPestaña)
    return () => document.removeEventListener('visibilitychange', alVolverALaPestaña)
  }, [user, fetchDbInventory])

  // Exponla para que una página como "/pago-exitoso" pueda forzar el refresco
  const refreshInventory = useCallback(() => fetchDbInventory(user?.id), [user, fetchDbInventory])

  const addCoins = useCallback((amount) => {
    setCoins(prev => prev + amount)
  }, [])

  // Un item se considera "tuyo" de dos formas distintas según su tipo:
  //  - type: 'coins'  -> revisa el arreglo local `inventory`
  //  - type: 'real'   -> revisa `dbInventory` (la verdad la tiene Supabase)
  const ownsItem = useCallback((itemId) => {
    const item = STORE_ITEMS.find(i => i.id === itemId)

    if (item?.productoId) {
      return dbInventory.some(
        row => row.producto_id === item.productoId && row.cantidad_total_adquirida > 0
      )
    }

    return inventory.includes(itemId)
  }, [inventory, dbInventory])

  // Cuántas unidades le quedan disponibles de un producto consumible
  // (útil más adelante para cosas como "intentos de examen"). Si el item
  // no es de tipo 'real' o no tiene productoId, devuelve null.
  const saldoDisponible = useCallback((itemId) => {
    const item = STORE_ITEMS.find(i => i.id === itemId)
    if (!item?.productoId) return null

    const fila = dbInventory.find(row => row.producto_id === item.productoId)
    return fila ? fila.cantidad_disponible : 0
  }, [dbInventory])

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

  // Fallback para items de tipo 'real' que todavía no tienen productoId
  // configurado (o sea, no pasan por Stripe Checkout). Store.jsx solo
  // recurre a esto cuando el item no trae productoId.
  const startRealPayment = useCallback(async (item) => {
    console.warn('[Store] Este item no tiene productoId configurado para Stripe.', item)
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
      saldoDisponible,
      purchaseWithCoins,
      startRealPayment,
      grantPurchase,
      user,
      authLoading,
      dbInventory,
      dbInventoryLoading,
      refreshInventory,
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