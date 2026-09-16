import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { fusionarProgresoInvitado, leerProgresoInvitadoLocal } from '../services/progreso'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [esMaestro, setEsMaestro] = useState(false)
  const fusionEnCursoRef = useRef(false)

  // Progreso de invitado (sin cuenta) vive solo en localStorage (ver
  // useProgreso.js) y useProgreso cambia de fuente en cuanto hay sesión —
  // sin esto, el avance hecho antes de tener cuenta queda huérfano en el
  // navegador y nunca se junta con lo que ya tenga la cuenta. Se intenta en
  // cada aparición de sesión (carga inicial y cada cambio de auth): es
  // idempotente porque solo borra las claves de localStorage si el RPC
  // confirma que las guardó, así que reintentar tras un fallo de red no
  // pierde nada, y una vez fusionado no queda nada que volver a fusionar.
  const fusionarProgresoLocal = useCallback(async () => {
    if (fusionEnCursoRef.current) return
    const filas = leerProgresoInvitadoLocal()
    if (filas.length === 0) return
    fusionEnCursoRef.current = true
    try {
      const ok = await fusionarProgresoInvitado(filas)
      if (ok) {
        for (const { key } of filas) {
          try { localStorage.removeItem(key) } catch { /* no crítico si falla */ }
        }
      }
    } catch (e) {
      console.error('[Auth] No se pudo fusionar el progreso de invitado:', e)
    } finally {
      fusionEnCursoRef.current = false
    }
  }, [])

  const refrescarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      return
    }
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).maybeSingle()
    // Mismo criterio que refrescarEsAdmin/refrescarEsMaestro: si la consulta
    // falla, perfil cae en null igual, pero se loguea para no confundir un
    // fallo de red/RLS con que el usuario de verdad no tenga perfil.
    if (error) console.error('[Auth] No se pudo cargar el perfil:', error.message)
    setPerfil(data ?? null)
  }, [])

  // `es_admin_actual` (ver migración 20260812130000) solo contesta sobre el
  // propio auth.uid() del que llama, así que es seguro exponerla tal cual a
  // cualquier usuario autenticado; la lista real de admins nunca se lee
  // directo desde el cliente.
  const refrescarEsAdmin = useCallback(async (userId) => {
    if (!userId) {
      setEsAdmin(false)
      return
    }
    const { data, error } = await supabase.rpc('es_admin_actual')
    // Falla cerrado a propósito (sin admin confirmado, no hay acceso), pero
    // se loguea el error para no confundir un fallo de RPC con que a alguien
    // de verdad le hayan quitado el rol — ver AdminPagos/AdminMaestros.
    if (error) console.error('[Auth] No se pudo verificar el rol de admin:', error.message)
    setEsAdmin(Boolean(data))
  }, [])

  // `soy_maestro_actual` (ver migración 20260812140000) solo contesta sobre
  // el propio auth.uid(), igual que es_admin_actual — segura de exponer a
  // cualquier usuario autenticado.
  const refrescarEsMaestro = useCallback(async (userId) => {
    if (!userId) {
      setEsMaestro(false)
      return
    }
    const { data, error } = await supabase.rpc('soy_maestro_actual')
    // Mismo criterio que refrescarEsAdmin: falla cerrado, pero se loguea
    // para distinguir un fallo de RPC de una baja real del rol de maestro.
    if (error) console.error('[Auth] No se pudo verificar el rol de maestro:', error.message)
    setEsMaestro(Boolean(data))
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setCargando(false)
      refrescarPerfil(sessionUser?.id)
      refrescarEsAdmin(sessionUser?.id)
      refrescarEsMaestro(sessionUser?.id)
      if (sessionUser) fusionarProgresoLocal()
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      refrescarPerfil(session?.user?.id)
      refrescarEsAdmin(session?.user?.id)
      refrescarEsMaestro(session?.user?.id)
      if (session?.user) fusionarProgresoLocal()
    })
    return () => listener.subscription.unsubscribe()
  }, [refrescarPerfil, refrescarEsAdmin, refrescarEsMaestro, fusionarProgresoLocal])

  return (
    <AuthContext.Provider value={{ user, cargando, perfil, esAdmin, esMaestro, refrescarPerfil: () => refrescarPerfil(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}