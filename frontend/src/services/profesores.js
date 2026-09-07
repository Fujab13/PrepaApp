// services/profesores.js
// Registro self-service de profesores + verificación de documentos y el
// login aparte que desbloquea el portal de maestro (ver migración
// 20260826120000_registro_autoservicio_profesores).
import { supabase } from './supabaseClient';

/**
 * Da de alta al usuario en sesión como profesor pendiente de verificar
 * (RPC `registrar_profesor_propio`). Genera y guarda una contraseña de
 * 6 dígitos que solo el equipo puede ver (vía `listarProfesoresAdmin`) para
 * mandársela una vez que la documentación quede validada.
 */
export async function registrarProfesorPropio({ nombre, curp, emailContacto, telefonoContacto, materias, numeroCuenta }) {
  const { data, error } = await supabase.rpc('registrar_profesor_propio', {
    p_nombre: nombre,
    p_curp: curp,
    p_email_contacto: emailContacto,
    p_telefono_contacto: telefonoContacto || null,
    p_materias: materias,
    p_numero_cuenta: numeroCuenta,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Corrige los datos de un registro todavía pendiente de verificar (RPC
 * `actualizar_profesor_propio`). Falla a propósito si ya quedó verificado.
 */
export async function actualizarProfesorPropio({ nombre, curp, emailContacto, telefonoContacto, materias, numeroCuenta }) {
  const { data, error } = await supabase.rpc('actualizar_profesor_propio', {
    p_nombre: nombre,
    p_curp: curp,
    p_email_contacto: emailContacto,
    p_telefono_contacto: telefonoContacto || null,
    p_materias: materias,
    p_numero_cuenta: numeroCuenta,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Corrige SOLO la CLABE de cobro (RPC `actualizar_cuenta_profesor`),
 * a diferencia de `actualizarProfesorPropio` funciona incluso si el
 * profesor ya quedó verificado: la cuenta de cobro no es parte de lo que
 * se validó contra la documentación.
 */
export async function actualizarCuentaProfesor(numeroCuenta) {
  const { data, error } = await supabase.rpc('actualizar_cuenta_profesor', {
    p_numero_cuenta: numeroCuenta,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Estado del registro del profesor en sesión (o null si nunca se registró). */
export async function obtenerMiEstadoProfesor() {
  const { data, error } = await supabase.rpc('mi_estado_profesor');
  if (error) {
    console.error('[profesores] No se pudo cargar tu estado de registro:', error.message);
    throw error;
  }
  return data?.[0] ?? null;
}

/**
 * Gate aparte del login normal de Supabase Auth: valida correo de cuenta +
 * contraseña de 6 dígitos contra la fila de `profesores` ya verificada.
 * No crea ni modifica ninguna sesión — solo desbloquea la UI del portal.
 */
export async function verificarLoginProfesor(email, contrasena) {
  const { data, error } = await supabase.rpc('verificar_login_profesor', {
    p_email: email,
    p_contrasena: contrasena,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Lista de profesores (pendientes y verificados) para el panel de admin. */
export async function listarProfesoresAdmin() {
  const { data, error } = await supabase.rpc('admin_listar_profesores');
  if (error) {
    console.error('[profesores] No se pudo listar a los profesores:', error.message);
    throw error;
  }
  return data ?? [];
}

export async function establecerProfesorVerificado(profesorId, verificado) {
  const { error } = await supabase.rpc('admin_set_profesor_verificado', {
    p_profesor_id: profesorId,
    p_verificado: verificado,
  });
  if (error) throw error;
}

export async function establecerProfesorActivo(profesorId, activo) {
  const { error } = await supabase.rpc('admin_set_profesor_activo', {
    p_profesor_id: profesorId,
    p_activo: activo,
  });
  if (error) throw error;
}

/** Info básica y pública de un profesor (para PerfilProfesor.jsx y las tarjetas de oferta). */
export async function obtenerPerfilProfesor(profesorUserId) {
  const { data, error } = await supabase.rpc('obtener_perfil_profesor', {
    p_profesor_user_id: profesorUserId,
  });
  if (error) {
    console.error('[profesores] No se pudo cargar el perfil del profesor:', error.message);
    throw error;
  }
  return data?.[0] ?? null;
}

/** Reviews públicos (id, estrellas, comentario, es_propia) de un profesor — la del usuario en sesión (si existe) va primero, luego las demás más recientes primero. */
export async function obtenerCalificacionesProfesor(profesorUserId) {
  const { data, error } = await supabase.rpc('obtener_calificaciones_profesor', {
    p_profesor_user_id: profesorUserId,
  });
  if (error) {
    console.error('[profesores] No se pudieron cargar las calificaciones:', error.message);
    throw error;
  }
  return data ?? [];
}

/** Si el usuario en sesión ya puede calificar a este profesor (compró y la clase ya pasó, sin calificar aún). */
export async function puedoCalificarProfesor(profesorUserId) {
  const { data, error } = await supabase.rpc('puedo_calificar_profesor', {
    p_profesor_user_id: profesorUserId,
  });
  if (error) throw error;
  return Boolean(data);
}

/**
 * Motivo puntual por el que el usuario en sesión sí/no puede calificar a
 * este profesor: 'ok' | 'no_autenticado' | 'uno_mismo' | 'pago_no_completado'
 * | 'sin_compra'. 'ok' ya cubre tanto "nunca calificó" como "ya calificó y
 * puede editar" — calificar_profesor hace upsert.
 */
export async function estadoCalificarProfesor(profesorUserId) {
  const { data, error } = await supabase.rpc('estado_calificar_profesor', {
    p_profesor_user_id: profesorUserId,
  });
  if (error) throw error;
  return data;
}

/** La calificación (estrellas + comentario) que el usuario en sesión ya le dejó a este profesor, o null si no ha calificado. */
export async function obtenerMiCalificacionProfesor(profesorUserId) {
  const { data, error } = await supabase.rpc('obtener_mi_calificacion_profesor', {
    p_profesor_user_id: profesorUserId,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * Genera un magic link (edge function `admin-acceso-profesor`, requiere
 * service-role) para que un admin entre directo a la cuenta real de un
 * profesor. Quien llama debe cerrar su propia sesión antes de navegar a la
 * URL resultante (ver AdminMaestros.jsx) — es un swap real de sesión.
 */
export async function generarAccesoProfesor(email) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Tu sesión expiró, vuelve a iniciar sesión.');

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-acceso-profesor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok || data.error || !data.url) {
    throw new Error(data.error || 'No se pudo generar el acceso a esa cuenta.');
  }
  return data.url;
}

export async function calificarProfesor(profesorUserId, estrellas, comentario) {
  const { data, error } = await supabase.rpc('calificar_profesor', {
    p_profesor_user_id: profesorUserId,
    p_estrellas: estrellas,
    p_comentario: comentario || null,
  });
  if (error) throw error;
  return data;
}
