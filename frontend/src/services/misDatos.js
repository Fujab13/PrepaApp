// services/misDatos.js
// Datos personales del propio alumno que puede revisar/borrar desde
// Ajustes (pages/Ajustes.jsx). Todo va filtrado por user_id del propio
// usuario; además RLS solo deja ver/borrar filas propias (ver migración
// 20260926120000_borrar_datos_propios.sql).
import { supabase } from './supabaseClient'

// Tablas que el alumno puede borrar. La clave es lo que usa la UI.
export const DATOS_BORRABLES = {
  examen: 'resultados_examen',
  formulario: 'formularios_area',
}

// Cuántas filas propias hay en cada tabla, para saber si hay algo que borrar.
export async function contarMisDatos(userId) {
  const entradas = await Promise.all(
    Object.entries(DATOS_BORRABLES).map(async ([clave, tabla]) => {
      const { count, error } = await supabase
        .from(tabla)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      if (error) throw error
      return [clave, count ?? 0]
    })
  )
  return Object.fromEntries(entradas)
}

// Último Formulario de área del propio usuario (o null si nunca lo llenó),
// para precargarlo en pages/FormularioArea.jsx.
export async function obtenerUltimoFormulario(userId) {
  const { data, error } = await supabase
    .from('formularios_area')
    .select('*')
    .eq('user_id', userId)
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

// Borra TODAS las filas propias de una tabla. Regresa cuántas se borraron:
// 0 con filas existentes significa que la policy de delete no está aplicada
// en la base (RLS lo bloquea en silencio, sin error).
export async function borrarMisDatos(clave, userId) {
  const tabla = DATOS_BORRABLES[clave]
  if (!tabla || !userId) throw new Error('parametros_invalidos')

  const { data, error } = await supabase
    .from(tabla)
    .delete()
    .eq('user_id', userId)
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}
