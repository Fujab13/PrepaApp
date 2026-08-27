// motivosReporte.js
// Catálogo fijo de categorías de reporte contra un profesor (ver migración
// 20260826150000_reportes_profesor.sql). Estilo Roblox: quien reporta elige
// una categoría concreta, no autoevalúa qué tan grave fue — la gravedad es
// una propiedad de la categoría, no una entrada libre del usuario.
export const MOTIVOS_REPORTE = [
  { id: "no_asistio", etiqueta: "No se presentó a la clase", gravedad: "leve" },
  { id: "mala_calidad", etiqueta: "La clase no cumplió lo prometido", gravedad: "leve" },
  { id: "cobro_indebido", etiqueta: "Cobró de más o pidió pago fuera de lo acordado", gravedad: "moderado" },
  { id: "lenguaje_ofensivo", etiqueta: "Lenguaje ofensivo o grosero", gravedad: "moderado" },
  { id: "solicitud_informacion_personal", etiqueta: "Pidió información personal indebida", gravedad: "moderado" },
  { id: "discriminacion", etiqueta: "Discriminación", gravedad: "grave" },
  { id: "acoso_o_intimidacion", etiqueta: "Acoso o intimidación", gravedad: "grave" },
  { id: "contenido_inapropiado", etiqueta: "Contenido inapropiado o sexual", gravedad: "grave" },
  { id: "fraude_o_estafa", etiqueta: "Fraude o estafa", gravedad: "grave" },
  { id: "otro", etiqueta: "Otro", gravedad: "leve" },
];

export const ETIQUETA_GRAVEDAD = {
  leve: { texto: "Leve", color: "#eab308" },
  moderado: { texto: "Moderado", color: "#f97316" },
  grave: { texto: "Grave", color: "#ef4444" },
};
