// services/ranking.js
// Ranking semanal de actividad (RPC SECURITY DEFINER `obtener_ranking_semanal`,
// migración 20260905120000_ranking_semanal): top 25 por puntos ganados en los
// últimos 7 días. Público a propósito (grant a anon incluido) — Tutorias.jsx
// no exige sesión para verse.
import { supabase } from './supabaseClient';

export async function obtenerRankingSemanal() {
  const { data, error } = await supabase.rpc('obtener_ranking_semanal');

  if (error) {
    console.error('[ranking] No se pudo cargar el ranking semanal:', error.message);
    throw error;
  }

  return data ?? [];
}
