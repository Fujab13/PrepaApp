import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../services/supabaseClient'
import { fetchProductosActivos } from '../services/productos'
import { COIN_ITEMS, productoAStoreItem } from '../data/storeItems'
import { leerEstado, guardarEstado, claveUnidad } from '../utils/monedasSeguras'
import { leerTemaActivo, aplicarTema } from '../utils/temas'

const StoreContext = createContext(null)

const INVENTORY_KEY = 'user_inventory'
const COMIDA_KEY = 'mascotas_comida'
const MAX_MONEDAS_POR_RECOMPENSA = 200 // ver COLORES_DIFICIL en EscaneoRecompensa.jsx: máximo teórico real es 160 (4 puntos x 40)

// Las "monedas" y el inventario local (localInventory) siguen siendo
// gamificación pura, sin dinero real, por lo que se quedan en localStorage
// (ver utils/monedasSeguras.js para el porqué del formato firmado). Los
// productos comprados con dinero real (los que tienen `productoId` en
// storeItems.js) viven en la tabla `inventario_usuario` de Supabase, y es
// tu Edge Function del Webhook la que los escribe cuando Stripe confirma
// el pago — este contexto solo LEE ese resultado.
export function StoreProvider({ children }) {
  const [{ coins, reclamadas }, setMonedas] = useState(() => {
    const estado = leerEstado()
    return { coins: estado.coins, reclamadas: new Set(estado.reclamadas) }
  })

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(INVENTORY_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // Tema visual comprable con monedas (ver storeItems.js/COIN_ITEMS,
  // "Tema Slate Reverie"). Se re-aplica al montar (el atributo en <html> no
  // sobrevive un reload por sí solo, solo lo guardado en localStorage).
  const [temaActivo, setTemaActivo] = useState(() => leerTemaActivo())

  useEffect(() => {
    aplicarTema(temaActivo)
  }, [temaActivo])

  const elegirTema = useCallback((temaId) => {
    setTemaActivo(temaId)
  }, [])

  // Comida para las mascotas (ver storeItems.js "Bolsa de comida" y
  // pages/Mascota.jsx). A diferencia de coins/inventory, es un contador
  // simple sin firma: el peor caso de manipularlo es alimentar mascotas de
  // pixel art gratis, no hay nada que proteger aquí (mismo criterio que ya
  // se usaba para `inventory`, que tampoco lleva firma).
  const [comida, setComida] = useState(() => {
    const saved = localStorage.getItem(COMIDA_KEY)
    return saved !== null ? Number(saved) : 0
  })

  useEffect(() => {
    localStorage.setItem(COMIDA_KEY, String(comida))
  }, [comida])

  // --- Sesión de usuario (Supabase Auth) ---
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // --- Inventario real, leído de Supabase (fuente de verdad para compras con dinero) ---
  const [dbInventory, setDbInventory] = useState([]) // [{ producto_id, cantidad_disponible, cantidad_total_adquirida }]
  const [dbInventoryLoading, setDbInventoryLoading] = useState(false)

  // --- Catálogo real, leído de la tabla `productos` de Supabase ---
  const [productos, setProductos] = useState([])
  const [productosLoading, setProductosLoading] = useState(true)

  const fetchProductos = useCallback(async () => {
    setProductosLoading(true)
    const data = await fetchProductosActivos()
    setProductos(data)
    setProductosLoading(false)
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  // Catálogo completo que consume Store.jsx: items de gamificación (fijos)
  // + items reales (nombre/precio/disponibilidad vienen de Supabase, no hardcodeados)
  const items = useMemo(
    () => [...COIN_ITEMS, ...productos.map(productoAStoreItem)],
    [productos]
  )

  useEffect(() => {
    guardarEstado({ coins, reclamadas: [...reclamadas] })
  }, [coins, reclamadas])

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

  // Valida el monto antes de acreditarlo: aunque alguien llame a esta
  // función a mano desde la consola (p. ej. vía React DevTools), el daño
  // queda acotado a lo que un escaneo legítimo ya podría dar, no a un
  // número arbitrario.
  const addCoins = useCallback((amount) => {
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_MONEDAS_POR_RECOMPENSA) return
    setMonedas(prev => ({ ...prev, coins: prev.coins + amount }))
  }, [])

  const haReclamadoUnidad = useCallback((materiaId, unidad) => {
    return reclamadas.has(claveUnidad(materiaId, unidad))
  }, [reclamadas])

  // Herramienta de pruebas para la cuenta de admin (ver Store.jsx: gesto
  // secreto de tocar el saldo varias veces, solo visible si `esAdmin` —
  // verificado server-side vía el RPC `es_admin_actual`, AuthContext.jsx).
  // A propósito NO pasa por el tope de `addCoins`/`reclamarRecompensaUnidad`
  // (ese tope existe para que un escaneo falsificado no dé de más; esto es
  // un ajuste manual explícito para probar la tienda, no una recompensa).
  // Sigue sin poder bajar de 0.
  const ajustarMonedasAdmin = useCallback((delta) => {
    if (!Number.isFinite(delta) || delta === 0) return
    setMonedas(prev => ({ ...prev, coins: Math.max(0, Math.round(prev.coins + delta)) }))
  }, [])

  // Acredita la recompensa de escaneo Y marca la unidad como reclamada en
  // un solo paso: así el saldo y el registro de "ya cobrado" siempre viajan
  // juntos bajo una sola firma (ver monedasSeguras.js), sin una ventana
  // donde uno quede desincronizado del otro. Rehacer una unidad ya
  // completada no vuelve a acreditar nada.
  const reclamarRecompensaUnidad = useCallback((materiaId, unidad, monto) => {
    const clave = claveUnidad(materiaId, unidad)
    if (!Number.isFinite(monto) || monto <= 0 || monto > MAX_MONEDAS_POR_RECOMPENSA) return
    setMonedas(prev => {
      if (prev.reclamadas.has(clave)) return prev
      const reclamadasNuevas = new Set(prev.reclamadas)
      reclamadasNuevas.add(clave)
      return { coins: prev.coins + monto, reclamadas: reclamadasNuevas }
    })
  }, [])

  // Un item se considera "tuyo" de dos formas distintas según su tipo:
  //  - type: 'coins'  -> revisa el arreglo local `inventory`
  //  - type: 'real'   -> revisa `dbInventory` (la verdad la tiene Supabase)
  const ownsItem = useCallback((itemId) => {
    const item = items.find(i => i.id === itemId)

    if (item?.productoId) {
      return dbInventory.some(
        row => row.producto_id === item.productoId && row.cantidad_total_adquirida > 0
      )
    }

    return inventory.includes(itemId)
  }, [inventory, dbInventory, items])

  // Cuántas unidades le quedan disponibles de un producto consumible
  // (útil más adelante para cosas como "intentos de examen"). Si el item
  // no es de tipo 'real' o no tiene productoId, devuelve null.
  const saldoDisponible = useCallback((itemId) => {
    const item = items.find(i => i.id === itemId)
    if (!item?.productoId) return null

    const fila = dbInventory.find(row => row.producto_id === item.productoId)
    return fila ? fila.cantidad_disponible : 0
  }, [dbInventory, items])

  // Compra con monedas internas (gamificación, sin dinero real)
  const purchaseWithCoins = useCallback((item) => {
    if (inventory.includes(item.id)) {
      return { ok: false, reason: 'already_owned' }
    }
    if (coins < item.priceCoins) {
      return { ok: false, reason: 'insufficient_funds' }
    }
    setMonedas(prev => ({ ...prev, coins: prev.coins - item.priceCoins }))
    setInventory(prev => [...prev, item.id])
    return { ok: true }
  }, [coins, inventory])

  // Compra de un consumible (a diferencia de purchaseWithCoins, NUNCA
  // bloquea por "ya lo tienes" — se puede comprar cuantas veces se quiera,
  // cada una suma `comidaCantidad` en vez de desbloquear algo una sola vez).
  const comprarComida = useCallback((item) => {
    if (coins < item.priceCoins) {
      return { ok: false, reason: 'insufficient_funds' }
    }
    setMonedas(prev => ({ ...prev, coins: prev.coins - item.priceCoins }))
    setComida(prev => prev + (item.comidaCantidad || 0))
    return { ok: true }
  }, [coins])

  // Gasta 1 unidad de comida (al alimentar una mascota en Mascota.jsx).
  // Revisa `comida` ANTES de actualizar (no dentro del callback funcional
  // de setComida) para poder devolver el resultado de forma síncrona: el
  // updater de setState no se ejecuta a tiempo para que el caller lea su
  // resultado en la misma línea.
  const consumirComida = useCallback(() => {
    if (comida <= 0) return false
    setComida(prev => Math.max(0, prev - 1))
    return true
  }, [comida])

  // Fallback para items de tipo 'real' que todavía no tienen productoId
  // configurado (o sea, no pasan por Stripe Checkout). Store.jsx solo
  // recurre a esto cuando el item no trae productoId.
  const startRealPayment = useCallback(async (item) => {
    console.warn('[Store] Este item no tiene productoId configurado para Stripe.', item)
    return { ok: false, reason: 'payment_gateway_not_implemented' }
  }, [])

  // Reclama un producto de precio $0 (ej. "Medicina lección") sin pasar por
  // Stripe, vía el RPC `reclamar_producto_gratis` (SECURITY DEFINER: la
  // tabla `inventario_usuario` no admite INSERT directo del cliente).
  const claimFreeProduct = useCallback(async (productoId) => {
    const { error } = await supabase.rpc('reclamar_producto_gratis', {
      p_producto_id: productoId,
    })

    if (error) {
      console.error('[Store] No se pudo reclamar el producto gratis:', error.message)
      return { ok: false, reason: error.message }
    }

    await fetchDbInventory(user?.id)
    return { ok: true }
  }, [fetchDbInventory, user])

  const grantPurchase = useCallback((itemId) => {
    setInventory(prev => prev.includes(itemId) ? prev : [...prev, itemId])
  }, [])

  return (
    <StoreContext.Provider value={{
      coins,
      inventory,
      addCoins,
      haReclamadoUnidad,
      reclamarRecompensaUnidad,
      ajustarMonedasAdmin,
      temaActivo,
      elegirTema,
      comida,
      comprarComida,
      consumirComida,
      ownsItem,
      saldoDisponible,
      purchaseWithCoins,
      startRealPayment,
      claimFreeProduct,
      grantPurchase,
      user,
      authLoading,
      dbInventory,
      dbInventoryLoading,
      refreshInventory,
      items,
      productosLoading,
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