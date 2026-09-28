import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

// Tope de respaldo mientras aún no se conoce el tamaño real de la materia
// (p. ej. en Leccion.jsx, antes de que termine de cargar el JSON/lección
// premium). En cuanto se conoce, el llamador pasa `totalUnidades` calculado
// con getTotalUnidades() y ese es el que realmente se usa.
const MAX_UNIDADES_RESPALDO = 26

// `soloLocal`: el avance vive solo en este dispositivo, con su propia clave
// (Modo conceptos, ver utils/modoConceptos.js): no toca progreso_usuario ni el
// progreso de la lección normal, aunque haya sesión.
export function useProgreso(materiaId, totalUnidades = MAX_UNIDADES_RESPALDO, { soloLocal = false } = {}) {
  const { user } = useAuth()
  const usarSupabase = Boolean(user) && !soloLocal
  const claveLocal = soloLocal ? `progreso_conceptos_${materiaId}` : `progreso_quiz_${materiaId}`
  const [unidad, setUnidad]     = useState(1)
  const [elemento, setElemento] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!materiaId) return
    setCargando(true)

    if (usarSupabase) {
      supabase
        .from('progreso_usuario')
        .select('unidad_actual, elemento_actual')
        .eq('user_id', user.id)
        .eq('materia_id', materiaId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUnidad(data.unidad_actual ?? 1)
            setElemento(data.elemento_actual ?? 0)
          } else {
            setUnidad(1)
            setElemento(0)
          }
          setCargando(false)
        })
    } else {
      const raw = localStorage.getItem(claveLocal)
      if (raw) {
        try {
          const { unidad_actual, elemento_actual } = JSON.parse(raw)
          setUnidad(unidad_actual ?? 1)
          setElemento(elemento_actual ?? 0)
        } catch {
          setUnidad(1)
          setElemento(0)
        }
      } else {
        setUnidad(1)
        setElemento(0)
      }
      setCargando(false)
    }
  }, [materiaId, user, soloLocal])

  // `avanceValido` (default true): en false cuando el avance viene de
  // "Omitir unidad" (Leccion.jsx) en vez de terminarla de verdad — la
  // unidad sigue avanzando con normalidad, pero el trigger de puntos
  // (otorgar_puntos_leccion, ver migración 20260906120000) no lo cuenta
  // para el ranking semanal.
  async function guardarProgreso(nuevaUnidad, nuevoElemento, { avanceValido = true } = {}) {
    const unidadFinal    = Math.min(nuevaUnidad, totalUnidades + 1)
    const elementoFinal  = unidadFinal > totalUnidades ? 0 : nuevoElemento

    // Se guardan los valores previos para poder revertir la UI si el upsert
    // falla: sin esto, el avance optimista de abajo deja al alumno viendo
    // una unidad que nunca se llegó a guardar — recién se nota al recargar
    // y aparecer de vuelta en la unidad vieja, sin explicación.
    const unidadPrevia   = unidad
    const elementoPrevio = elemento

    setUnidad(unidadFinal)
    setElemento(elementoFinal)

    if (usarSupabase) {
      const { error } = await supabase.from('progreso_usuario').upsert(
        {
          user_id:         user.id,
          materia_id:      materiaId,
          unidad_actual:   unidadFinal,
          elemento_actual: elementoFinal,
          ultima_interaccion: new Date().toISOString(),
          avance_valido: avanceValido,
        },
        { onConflict: 'user_id,materia_id' }
      )
      if (error) {
        console.error('[useProgreso] No se pudo guardar tu progreso:', error.message)
        setUnidad(unidadPrevia)
        setElemento(elementoPrevio)
      }
    } else {
      localStorage.setItem(
        claveLocal,
        JSON.stringify({ unidad_actual: unidadFinal, elemento_actual: elementoFinal })
      )
    }
  }

  async function reiniciar() {
    const unidadPrevia   = unidad
    const elementoPrevio = elemento

    setUnidad(1)
    setElemento(0)
    if (usarSupabase) {
      const { error } = await supabase.from('progreso_usuario').upsert(
        {
          user_id:         user.id,
          materia_id:      materiaId,
          unidad_actual:   1,
          elemento_actual: 0,
          ultima_interaccion: new Date().toISOString(),
        },
        { onConflict: 'user_id,materia_id' }
      )
      if (error) {
        // Sin esto la UI se queda en unidad 1 mientras la BD conserva la
        // unidad vieja, desincronizadas hasta el siguiente guardado exitoso.
        console.error('[useProgreso] No se pudo reiniciar tu progreso:', error.message)
        setUnidad(unidadPrevia)
        setElemento(elementoPrevio)
      }
    } else {
      localStorage.removeItem(claveLocal)
    }
  }

  const unidadesCompletas = Math.min(unidad - 1, totalUnidades)

  return { unidad, elemento, cargando, guardarProgreso, reiniciar, unidadesCompletas, totalUnidades }
}