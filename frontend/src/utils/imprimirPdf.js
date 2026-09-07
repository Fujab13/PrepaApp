// imprimirPdf.js
// La app no usa ninguna librería de PDF: todo "PDF" es en realidad el
// destino "Guardar como PDF" del diálogo nativo de impresión del navegador
// (window.print(), ver .informe-print en global.css). Esa API no tiene
// parámetro de nombre de archivo — el navegador sugiere `document.title`
// como nombre al guardar — así que para que cada reporte se guarde con un
// nombre automático (MAYÚSCULAS + fecha) hay que cambiar el título justo
// antes de imprimir y regresarlo después.

const TITULO_ORIGINAL = document.title;
const RE_DIACRITICOS = new RegExp("[̀-ͯ]", "g");

function sinAcentos(texto) {
  return texto.normalize("NFD").replace(RE_DIACRITICOS, "");
}

/** "Informe de preparación", 2026-09-07T... → "PREPAAPP_INFORME_DE_PREPARACION_2026-09-07" */
export function nombrePdf(tipoReporte, fecha) {
  const d = fecha ? new Date(fecha) : new Date();
  const fechaIso = Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  const slug = sinAcentos(tipoReporte)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return `PREPAAPP_${slug}_${fechaIso}`;
}

/** window.print() con el nombre de archivo sugerido puesto como document.title. */
export function imprimirComoPdf(nombreArchivo) {
  document.title = nombreArchivo;
  const restaurar = () => {
    document.title = TITULO_ORIGINAL;
    window.removeEventListener("afterprint", restaurar);
  };
  window.addEventListener("afterprint", restaurar);
  window.print();
  // Respaldo por si el navegador no dispara "afterprint" (pasa en algunos
  // flujos móviles de "compartir/guardar PDF").
  setTimeout(restaurar, 2000);
}
