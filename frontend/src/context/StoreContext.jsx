import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../services/supabaseClient'
import { fetchProductosActivos } from '../services/productos'
import { COIN_ITEMS, productoAStoreItem } from '../data/storeItems'
import { leerEstado, guardarEstado } from '../utils/monedasSeguras'
import { leerTemaActivo, aplicarTema } from '../utils/temas'

const StoreContext = createContext(null)

const INVENTORY_KEY = 'user_inventory'
const COMIDA_KEY = 'mascotas_comida'
const MASCOTA_SELECCIONADA_KEY = 'mascota_seleccionada'
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

  // Mascota "compañera": cuál (si acaso) sigue al usuario fuera de Mi
  // Mascota (ver components/MascotaCompanera.jsx, montado en Home/Leccion)
  // — a lo sumo una a la vez, mismo patrón que `temaActivo` de arriba.
  // Local y sin firma (mismo criterio que `comida`/`inventory`: es
  // presentación, no hay nada real que proteger).
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(() => {
    try { return localStorage.getItem(MASCOTA_SELECCIONADA_KEY) || null } catch { return null }
  })

  useEffect(() => {
    try {
      if (mascotaSeleccionada) localStorage.setItem(MASCOTA_SELECCIONADA_KEY, mascotaSeleccionada)
      else localStorage.removeItem(MASCOTA_SELECCIONADA_KEY)
    } catch { /* sin localStorage, la preferencia no persiste */ }
  }, [mascotaSeleccionada])

  // Toggle: tocar la estrella de la que ya está activa la quita (queda
  // ninguna seleccionada) — "una y solo una a la vez".
  const seleccionarMascota = useCallback((mascotaId) => {
    setMascotaSeleccionada(prev => prev === mascotaId ? null : mascotaId)
  }, [])

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

  // Acredita la recompensa de escaneo. Antes esto también bloqueaba volver
  // a acreditar una unidad ya reclamada (anti-farm) — a pedido, ese bloqueo
  // se quitó: rehacer una unidad y reclamar de nuevo sí paga otra vez.
  // `materiaId`/`unidad` se quedan en la firma por si hace falta
  // reintroducir ese control más adelante, aunque ahora no se usan aquí.
  const reclamarRecompensaUnidad = useCallback((materiaId, unidad, monto) => {
    if (!Number.isFinite(monto) || monto <= 0 || monto > MAX_MONEDAS_POR_RECOMPENSA) return
    setMonedas(prev => ({ ...prev, coins: prev.coins + monto }))
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

  // Gasta `cantidad` unidades de comida de golpe (1 al alimentar una sola
  // mascota; varias cuando Mascota.jsx alimenta a toda la manada de una
  // vez). Revisa `comida` ANTES de actualizar (no dentro del callback
  // funcional de setComida) para poder devolver el resultado de forma
  // síncrona: el updater de setState no se ejecuta a tiempo para que el
  // caller lea su resultado en la misma línea — por eso también hay que
  // gastarla toda en un solo setComida en vez de llamar a esta función en
  // un loop (cada llamada dentro del mismo tick vería el mismo `comida`
  // desactualizado y todas pasarían el chequeo aunque no alcance).
  const consumirComida = useCallback((cantidad = 1) => {
    if (comida < cantidad) return false
    setComida(prev => Math.max(0, prev - cantidad))
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

  // Quita un item de `inventory` (lo contrario de grantPurchase/
  // purchaseWithCoins) — a propósito NO devuelve las monedas gastadas, es
  // "soltar" el desbloqueo, no una devolución. Solo tiene sentido para
  // items type:'coins' (los de tipo 'real' viven en Supabase, no aquí).
  // Usado por Mascota.jsx para eliminar una mascota de la colección.
  const removeInventoryItem = useCallback((itemId) => {
    setInventory(prev => prev.filter(id => id !== itemId))
  }, [])

  // Memoizado: sin esto, este objeto se recrea en cada render de
  // StoreProvider (p. ej. cuando cambia dbInventoryLoading o productos,
  // algo sin relación con mascotas) y React trata eso como "el contexto
  // cambió", forzando un re-render de TODO consumidor de useStore() en la
  // app — Mascota.jsx, MascotaCompanera.jsx (montado en Home/Lección/
  // Examen), Store.jsx, etc. — aunque los valores que a cada uno le
  // importan sigan iguales. Todas las funciones ya eran estables
  // (useCallback); lo que faltaba era estabilizar el objeto que las agrupa.
  const value = useMemo(() => ({
    coins,
    inventory,
    addCoins,
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
    removeInventoryItem,
    mascotaSeleccionada,
    seleccionarMascota,
    user,
    authLoading,
    dbInventory,
    dbInventoryLoading,
    refreshInventory,
    items,
    productosLoading,
  }), [
    coins,
    inventory,
    addCoins,
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
    removeInventoryItem,
    mascotaSeleccionada,
    seleccionarMascota,
    user,
    authLoading,
    dbInventory,
    dbInventoryLoading,
    refreshInventory,
    items,
    productosLoading,
  ])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}