import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [esMaestro, setEsMaestro] = useState(false)

  const refrescarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      return
    }
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).maybeSingle()
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
    const { data } = await supabase.rpc('es_admin_actual')
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
    const { data } = await supabase.rpc('soy_maestro_actual')
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
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      refrescarPerfil(session?.user?.id)
      refrescarEsAdmin(session?.user?.id)
      refrescarEsMaestro(session?.user?.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [refrescarPerfil, refrescarEsAdmin, refrescarEsMaestro])

  return (
    <AuthContext.Provider value={{ user, cargando, perfil, esAdmin, esMaestro, refrescarPerfil: () => refrescarPerfil(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}