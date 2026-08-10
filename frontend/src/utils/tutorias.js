// tutorias.js
// Constantes y helpers compartidos entre TutoriasAlumno.jsx y
// TutoriasMaestro.jsx: ambas páginas publican ofertas con la misma forma
// (materia/fecha-hora/duración/precio/notas) y llaman a los mismos RPCs,
// así que comparten los mismos mensajes de error y estilos de input.

export const DURACIONES = [
  { label: "60 min", minutos: 60 },
  { label: "90 min", minutos: 90 },
  { label: "120 min", minutos: 120 },
];

export const ACCEPT_ARCHIVOS = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx";

export const PRECIO_MIN_MXN = 50;
export const PRECIO_MAX_MXN = 5000;

const MENSAJES_ERROR = {
  antelacion_insuficiente: "Elige un horario con al menos 24 horas de anticipación.",
  materia_invalida: "Selecciona una materia válida.",
  duracion_invalida: "Selecciona una duración válida.",
  precio_invalido: `El precio debe estar entre $${PRECIO_MIN_MXN} y $${PRECIO_MAX_MXN} MXN.`,
  rol_invalido: "Ocurrió un error inesperado, intenta de nuevo.",
  notas_muy_largas: "Tus notas son muy largas (máximo 500 caracteres).",
  demasiados_archivos: "Puedes adjuntar máximo 5 archivos.",
  archivo_invalido: "Uno de tus archivos no se pudo procesar, intenta subirlo de nuevo.",
  sin_profesor_disponible: "Aún no tenemos un maestro disponible para esa materia u horario.",
  horario_no_disponible: "Ese horario ya se acaba de ocupar, elige otro.",
  no_autenticado: "Inicia sesión para continuar.",
  nombre_requerido: "Configura tu nombre antes de continuar.",
  oferta_no_encontrada: "Esa oferta ya no está disponible.",
  oferta_no_disponible: "Esa oferta ya fue tomada por alguien más.",
  no_puedes_aceptar_tu_propia_oferta: "No puedes aceptar tu propia oferta.",
  oferta_vencida: "Esa oferta ya venció.",
  oferta_no_cancelable: "Esa oferta ya no se puede cancelar.",
  profesor_no_disponible: "El maestro de esa oferta ya no está disponible.",
  profesor_sin_pagos_conectados: "Ese maestro todavía no conecta su cuenta de pagos.",
  no_autorizado: "No tienes permiso para hacer esto.",
  estrellas_invalidas: "Selecciona de 1 a 5 estrellas.",
  comentario_muy_largo: "Tu comentario es muy largo (máximo 300 caracteres).",
  solicitud_no_encontrada: "No encontramos esa clase.",
  clase_no_calificable: "Esa clase todavía no se puede calificar.",
  clase_aun_no_termina: "Esa clase todavía no termina.",
  no_calificable: "Esa clase no se puede calificar.",
  ya_calificaste: "Ya calificaste esta clase.",
};

export function mensajeError(err) {
  const code = Object.keys(MENSAJES_ERROR).find((c) => err?.message?.includes(c));
  return code ? MENSAJES_ERROR[code] : "No se pudo procesar tu solicitud. Intenta de nuevo.";
}

export const inputStyle = {
  width: "100%",
  minHeight: 44,
  background: "var(--surface2)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};
