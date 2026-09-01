import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

const MAX_UNIDADES = 26

export function useProgreso(materiaId) {
  const { user } = useAuth()
  const [unidad, setUnidad]     = useState(1)
  const [elemento, setElemento] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!materiaId) return
    setCargando(true)

    if (user) {
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
      const raw = localStorage.getItem(`progreso_quiz_${materiaId}`)
      if (raw) {
        try {
          const { unidad_actual, elemento_actual } = JSON.parse(raw)
          setUnidad(unidad_actual ?? 1)
          setElemento(elemento_actual ?? 0)
        } catch {
          setUnidad(1)
          setElemento(0)
        }
      }
      setCargando(false)
    }
  }, [materiaId, user])

  async function guardarProgreso(nuevaUnidad, nuevoElemento) {
    const unidadFinal    = Math.min(nuevaUnidad, MAX_UNIDADES + 1)
    const elementoFinal  = unidadFinal > MAX_UNIDADES ? 0 : nuevoElemento

    // Se guardan los valores previos para poder revertir la UI si el upsert
    // falla: sin esto, el avance optimista de abajo deja al alumno viendo
    // una unidad que nunca se llegó a guardar — recién se nota al recargar
    // y aparecer de vuelta en la unidad vieja, sin explicación.
    const unidadPrevia   = unidad
    const elementoPrevio = elemento

    setUnidad(unidadFinal)
    setElemento(elementoFinal)

    if (user) {
      const { error } = await supabase.from('progreso_usuario').upsert(
        {
          user_id:         user.id,
          materia_id:      materiaId,
          unidad_actual:   unidadFinal,
          elemento_actual: elementoFinal,
          ultima_interaccion: new Date().toISOString(),
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
        `progreso_quiz_${materiaId}`,
        JSON.stringify({ unidad_actual: unidadFinal, elemento_actual: elementoFinal })
      )
    }
  }

  async function reiniciar() {
    const unidadPrevia   = unidad
    const elementoPrevio = elemento

    setUnidad(1)
    setElemento(0)
    if (user) {
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
      localStorage.removeItem(`progreso_quiz_${materiaId}`)
    }
  }

  const unidadesCompletas = Math.min(unidad - 1, MAX_UNIDADES)

  return { unidad, elemento, cargando, guardarProgreso, reiniciar, unidadesCompletas }
}