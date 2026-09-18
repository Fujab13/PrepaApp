import { useEffect, useRef, useState } from 'react';
import { MdOutlineTranslate } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const SCRIPT_ID = 'google-translate-script';
const SCRIPT_SRC = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
const PRECONNECT_ID = 'google-translate-preconnect';

// Idiomas mas comunes entre los alumnos: se restringe la lista para que el
// selector de Google no muestre las ~100 opciones por defecto (esas no caben
// bien en pantallas de movil).
const IDIOMAS_PREFERIDOS = 'en,es,pt,it,zh-CN,hi,ru';

// Google pone "Select Language" como opcion por defecto del <select> (texto
// que viene de su propio widget, no hay parametro para configurarlo) — se
// acorta a solo "Language" reescribiendo esa opcion en el DOM en cuanto
// aparece.
function acortarTextoOpcionPorDefecto() {
  const opcion = document.querySelector('#google_translate_element select.goog-te-combo option[value=""]');
  if (opcion && opcion.textContent !== 'Language') opcion.textContent = 'Language';
  return Boolean(opcion);
}

function widgetYaVisible() {
  return Boolean(document.querySelector('#google_translate_element select.goog-te-combo'));
}

// El <select> tarda en aparecer porque Google lo puebla de forma asincrona
// (a veces en mas de una pasada) despues de crear el widget — antes se
// asumia que ya estaba listo justo despues de llamar a TranslateElement, lo
// que hacia parecer que el boton "no hacia nada" mientras tanto. Se observa
// el contenedor hasta que el <select> real aparece (o se agota el tiempo).
function esperarWidgetListo(onListo, onTimeout) {
  const contenedor = document.getElementById('google_translate_element');
  if (!contenedor) return;

  acortarTextoOpcionPorDefecto();
  if (widgetYaVisible()) {
    onListo();
    return;
  }

  const observer = new MutationObserver(() => {
    acortarTextoOpcionPorDefecto();
    if (widgetYaVisible()) {
      onListo();
      observer.disconnect();
    }
  });
  observer.observe(contenedor, { childList: true, subtree: true, characterData: true });
  setTimeout(() => {
    observer.disconnect();
    if (!widgetYaVisible()) onTimeout();
  }, 8000);
}

function inicializarWidget(onListo, onTimeout) {
  if (!window.google?.translate?.TranslateElement) return;
  // Si el <select> ya existe (p. ej. se cerro y se volvio a abrir con el
  // script ya cargado en segundo plano), no se vuelve a crear el widget:
  // llamar a TranslateElement dos veces sobre el mismo div lo duplicaba y
  // era otra causa de que "dejara de funcionar" al reabrirlo.
  if (!widgetYaVisible()) {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'es',
        includedLanguages: IDIOMAS_PREFERIDOS,
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      'google_translate_element'
    );
  }
  esperarWidgetListo(onListo, onTimeout);
}

// Boton que activa bajo demanda el widget oficial "Google Website Translator":
// evita depender del clic derecho del navegador para traducir y muestra de una
// vez la lista de idiomas disponibles. Se usa la UI por defecto de Google
// (incluida su franja superior al traducir) sin restyling.
export default function GoogleTranslateButton() {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  useEffect(() => {
    // Adelanta el DNS/TLS al origen de Google Translate apenas se monta el
    // boton (no descarga nada todavia), para que el primer clic tarde menos.
    if (document.getElementById(PRECONNECT_ID)) return;
    const link = document.createElement('link');
    link.id = PRECONNECT_ID;
    link.rel = 'preconnect';
    link.href = 'https://translate.google.com';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const marcarListo = () => { if (montadoRef.current) setCargando(false); };
    const marcarError = () => {
      document.getElementById(SCRIPT_ID)?.remove();
      if (montadoRef.current) { setCargando(false); setError(true); }
    };

    if (window.google?.translate?.TranslateElement) {
      setCargando(true);
      inicializarWidget(marcarListo, marcarError);
      return;
    }

    setCargando(true);
    setError(false);

    if (document.getElementById(SCRIPT_ID)) {
      // El script ya se esta cargando (de un clic anterior): solo se espera
      // a que el callback global (definido mas abajo la primera vez) resuelva.
      return;
    }

    window.googleTranslateElementInit = () => inicializarWidget(marcarListo, marcarError);
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = marcarError;
    document.body.appendChild(script);
  }, [abierto]);

  // El aviso de error solo se muestra 1s y despues se cierra solo, para no
  // dejar el panel atorado en ese estado — un siguiente clic vuelve a
  // intentar desde cero (el script fallido ya se elimino en marcarError).
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => {
      if (montadoRef.current) { setError(false); setAbierto(false); }
    }, 1000);
    return () => clearTimeout(t);
  }, [error]);

  const alHacerClic = () => setAbierto((v) => !v);

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, maxWidth: '100%', minWidth: 0 }}>
      <button
        onClick={alHacerClic}
        title={error ? 'No se pudo cargar el traductor, toca para reintentar' : 'Traducir pagina'}
        className="page-topbar-btn"
        style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
      >
        {cargando ? <AiOutlineLoading3Quarters className="spin" /> : <MdOutlineTranslate />}
      </button>
      {abierto && error && (
        <span style={{ fontSize: '0.72rem', color: 'var(--wrong)' }}>Error</span>
      )}
      <div
        id="google_translate_element"
        style={{ display: abierto && !error ? 'block' : 'none', maxWidth: '100%' }}
      />
    </div>
  );
}
