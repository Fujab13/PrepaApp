// services/reportes.js
// Reportes anónimos contra un profesor (ver migración
// 20260826150000_reportes_profesor.sql). `crearReporteProfesor` funciona
// SIN sesión iniciada — es la única escritura de todo el proyecto abierta
// al rol anon.
import { supabase } from './supabaseClient';

export async function crearReporteProfesor({ profesorUserId, categoria, gravedad, descripcion, ofertaMaestroId, contacto }) {
  const { data, error } = await supabase.rpc('crear_reporte_profesor', {
    p_profesor_user_id: profesorUserId,
    p_categoria: categoria,
    p_gravedad: gravedad,
    p_descripcion: descripcion,
    p_oferta_maestro_id: ofertaMaestroId || null,
    p_contacto: contacto || null,
  });
  if (error) throw error;
  return data;
}

export async function listarReportesAdmin() {
  const { data, error } = await supabase.rpc('admin_listar_reportes');
  if (error) {
    console.error('[reportes] No se pudieron cargar los reportes:', error.message);
    throw error;
  }
  return data ?? [];
}

export async function actualizarEstadoReporte(reporteId, estado, notasAdmin) {
  const { error } = await supabase.rpc('admin_actualizar_estado_reporte', {
    p_reporte_id: reporteId,
    p_estado: estado,
    p_notas_admin: notasAdmin || null,
  });
  if (error) throw error;
}
