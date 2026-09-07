// services/ranking.js
// Ranking semanal de actividad (RPC SECURITY DEFINER `obtener_ranking_semanal`,
// migraciones 20260905120000_ranking_semanal y 20260907120000_ranking_top100_y_mi_posicion):
// top 100 por puntos ganados en los últimos 7 días. Público a propósito
// (grant a anon incluido) — Tutorias.jsx no exige sesión para verse.
import { supabase } from './supabaseClient';

export async function obtenerRankingSemanal() {
  const { data, error } = await supabase.rpc('obtener_ranking_semanal');

  if (error) {
    console.error('[ranking] No se pudo cargar el ranking semanal:', error.message);
    throw error;
  }

  return data ?? [];
}

// Posición del usuario que hace la llamada entre TODOS los alumnos reales
// con actividad esta semana (sin el límite de 100 del tablero visible).
// Requiere sesión — sin usuario autenticado no hay `auth.uid()` de quién
// buscar y el RPC no regresa nada. Regresa `null` si el usuario no tiene
// ninguna actividad esta semana (no aparece en `puntos_actividad`).
export async function obtenerMiPosicionSemanal() {
  const { data, error } = await supabase.rpc('obtener_mi_posicion_semanal');

  if (error) {
    console.error('[ranking] No se pudo cargar tu posición semanal:', error.message);
    throw error;
  }

  return data?.[0] ?? null;
}
