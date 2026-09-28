// SeleccionExamen.jsx
// Pantalla intermedia del botón "Examen Simulador" del Sidenav: antes entraba
// directo al examen general, ahora deja elegir entre los exámenes propios
// registrados en data/examenesDisponibles.js, en una tómbola de tarjetas
// que gira (components/TombolaExamenes.jsx). Debajo, las submaterias del
// examen que quedó al frente, y abajo del todo los botones anterior / Empezar /
// siguiente (al alcance del pulgar), que son lo único que la gira: dejar
// presionada una flecha la gira seguido. Los exámenes premium comprados
// en la Tienda NO pasan por aquí — siguen abriéndose desde Inventario.jsx
// directo a /examen/premium-<id>, sin tocar esta pantalla.
// Navega a: /examen/:examenId (ver Examen.jsx)

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAMENES_DISPONIBLES } from '../data/examenesDisponibles.js';
import TombolaExamenes from '../components/TombolaExamenes';
import { triggerVibration } from '../utils/haptics';

import { AiOutlineClose } from 'react-icons/ai';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const REPETIR_TRAS_MS = 380; // dejar presionado: espera antes de girar seguido…
const REPETIR_CADA_MS = 170; // …y ritmo al que avanza mientras siga presionado

// Flecha cuadrada que avanza/retrocede la tómbola (van juntas en un grupo). Responde al presionar (no
// al soltar) para sentirse inmediata, y mientras siga presionada repite.
// Cada paso reinicia (con `key`) el empujón de la flecha y la onda.
function BotonFlecha({ direccion, onPaso }) {
  const [pulsos, setPulsos] = useState(0);
  const temporizadorRef = useRef(null);
  const arriba = direccion === 'arriba';
  const Icono = arriba ? FiChevronUp : FiChevronDown;

  const paso = () => { onPaso(); setPulsos(p => p + 1); };
  const soltar = () => { clearTimeout(temporizadorRef.current); temporizadorRef.current = null; };
  useEffect(() => soltar, []);

  function presionar(e) {
    if (e.button !== 0) return;
    paso();
    soltar();
    const repetir = () => { paso(); temporizadorRef.current = setTimeout(repetir, REPETIR_CADA_MS); };
    temporizadorRef.current = setTimeout(repetir, REPETIR_TRAS_MS);
  }

  return (
    <button
      type="button"
      className="tombola-btn"
      onPointerDown={presionar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      onContextMenu={e => e.preventDefault()}
      // Solo teclado (Enter/Espacio llegan como click con detail 0): con
      // dedo o mouse el paso ya se dio al presionar.
      onClick={e => { if (e.detail === 0) paso(); }}
      aria-label={arriba ? 'Examen anterior' : 'Siguiente examen'}
      title={arriba ? 'Anterior' : 'Siguiente'}
      style={{
        width: 56, height: 56, flexShrink: 0, border: 'none', borderRadius: 0,
        borderLeft: arriba ? 'none' : '1px solid var(--border)',
        background: 'transparent', color: 'var(--text)',
        fontSize: '1.5rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {pulsos > 0 && <span key={`onda-${pulsos}`} className="tombola-onda" />}
      <Icono
        key={pulsos}
        className={pulsos > 0 ? (arriba ? 'tombola-flecha-arriba' : 'tombola-flecha-abajo') : undefined}
        style={{ position: 'relative' }}
      />
    </button>
  );
}

export default function SeleccionExamen() {
  const navigate = useNavigate();
  const tombolaRef = useRef(null);
  const [indice, setIndice] = useState(0);
  const examen = EXAMENES_DISPONIBLES[indice];

  const elegirExamen = (elegido) => {
    triggerVibration('success');
    navigate(`/examen/${elegido.id}`);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden' }}>
      {/* Resplandor del color del examen al frente, detrás de la tómbola. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: '50%', width: 320, height: 320, marginLeft: -160,
          borderRadius: '50%', background: examen.color, opacity: 0.16, filter: 'blur(70px)',
          transition: 'background 0.5s ease', pointerEvents: 'none',
        }}
      />

      <header className="page-topbar-compact" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg)' }}>
        <button onClick={() => navigate('/')} title="Cerrar" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Gratuitos</h2>
      </header>

      <main
        className="page-content-compact"
        style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        {/* Márgenes negativos: el cilindro deja arriba y abajo una franja ya
            desvanecida por su máscara; así la tarjeta del frente queda más
            arriba y más cerca de la lista. */}
        <div style={{ width: '100%', maxWidth: 420, marginTop: -64, marginBottom: -36 }}>
          <TombolaExamenes
            ref={tombolaRef}
            examenes={EXAMENES_DISPONIBLES}
            onElegir={elegirExamen}
            onCambio={setIndice}
          />
        </div>

        {/* Submaterias del examen al frente; `key` las hace entrar de nuevo al cambiar. */}
        <ul
          key={examen.id}
          className="login-cascada"
          aria-label={`Contenido de ${examen.nombre}`}
          style={{
            width: '100%', maxWidth: 420, margin: 0, padding: '4px 0', listStyle: 'none',
            background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          }}
        >
          {examen.secciones.map((seccion, i) => (
            <li
              key={seccion.nombre}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                fontSize: '0.88rem', color: 'var(--text)',
              }}
            >
              <span style={{ width: 4, height: 18, borderRadius: 2, flexShrink: 0, background: seccion.color || examen.color }} />
              {seccion.nombre}
            </li>
          ))}
        </ul>
      </main>

      {/* Controles abajo, al alcance del pulgar. */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
      }}>
        <button
          type="button"
          onClick={() => tombolaRef.current?.elegir()}
          className="gm-cta"
          style={{
            position: 'relative', overflow: 'hidden', touchAction: 'manipulation',
            flex: 1, maxWidth: 260, minHeight: 56, borderRadius: 16, border: 'none',
            background: '#7c5cbf', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 10px 24px -10px rgba(124, 92, 191, 0.7)',
          }}
        >
          {/* Destello al cambiar de examen (se reinicia con `key`). */}
          <span key={examen.id} className="login-credencial-brillo" />
          Empezar
        </button>
        {/* Anterior y siguiente pegados, como un solo control segmentado. */}
        <div style={{
          display: 'flex', flexShrink: 0, overflow: 'hidden', borderRadius: 16,
          background: 'var(--surface2)', border: '1px solid var(--border)',
        }}>
          <BotonFlecha direccion="arriba" onPaso={() => tombolaRef.current?.anterior()} />
          <BotonFlecha direccion="abajo" onPaso={() => tombolaRef.current?.siguiente()} />
        </div>
      </div>
    </div>
  );
}
