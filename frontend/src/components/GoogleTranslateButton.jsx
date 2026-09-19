import { useEffect, useState } from 'react';
import { MdOutlineTranslate } from 'react-icons/md';

// Antes este boton activaba el widget embebido "Google Website
// Translator" (iframe + <select> de idiomas) — se quito por completo: el
// widget insistia en mostrar su franja superior y su globo de "te sirvio
// esta traduccion" (intentamos ocultarlos por CSS, ver commits previos),
// pero el problema real resulto ser el propio traductor NATIVO del
// navegador (el de los ⋮ → Traducir / el icono en la barra de
// direcciones): ese es mucho mejor — esta bien adaptado a movil y no
// pregunta nada — pero NINGUNA pagina puede abrirlo por codigo (no existe
// API web para eso, es una restriccion de seguridad del navegador, sin
// excepcion). Lo maximo que se puede hacer es señalarle al alumno donde
// esta: este boton ahora solo muestra un resplandor pulsante cerca de la
// esquina superior derecha (ahi vive el menu del navegador en Chrome/
// Safari moviles) con una instruccion corta, y se cierra solo.
const DURACION_GUIA_MS = 4500;

export default function GoogleTranslateButton() {
  const [mostrarGuia, setMostrarGuia] = useState(false);

  useEffect(() => {
    if (!mostrarGuia) return;
    const t = setTimeout(() => setMostrarGuia(false), DURACION_GUIA_MS);
    return () => clearTimeout(t);
  }, [mostrarGuia]);

  return (
    <>
      <button
        onClick={() => setMostrarGuia((v) => !v)}
        title="Como traducir esta pagina"
        className="page-topbar-btn"
        style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
      >
        <MdOutlineTranslate />
      </button>

      {mostrarGuia && (
        // pointerEvents 'none' en el overlay completo salvo el propio globo
        // de texto: un toque en cualquier otra parte de la pantalla no debe
        // quedar "atrapado" por esta guia, solo tocar el mensaje la cierra
        // antes de que se acabe sola.
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* Resplandor pulsante: apunta hacia la esquina superior derecha
              de la PANTALLA (no de esta tarjeta/pagina) porque ahi vive el
              menu del navegador — lo mas cerca que el CSS puede acercarse a
              "señalar" algo que esta fuera del documento. */}
          <div
            aria-hidden="true"
            className="guia-traducir-resplandor"
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,92,191,0.85) 0%, rgba(124,92,191,0.35) 45%, rgba(124,92,191,0) 72%)',
            }}
          />

          <div
            onClick={() => setMostrarGuia(false)}
            style={{
              position: 'absolute',
              top: 60,
              right: 14,
              maxWidth: 220,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 12px 28px -10px rgba(0,0,0,0.5)',
              fontSize: 12.5,
              lineHeight: 1.4,
              color: 'var(--text)',
              fontWeight: 600,
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            Para traducir, toca el menú de tu navegador (arriba) y elige "Traducir".
          </div>
        </div>
      )}
    </>
  );
}
