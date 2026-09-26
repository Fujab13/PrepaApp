// SeleccionExamen.jsx
// Pantalla intermedia del botón "Examen Simulador" del Sidenav: antes entraba
// directo al examen general, ahora deja elegir entre los exámenes propios
// registrados en data/examenesDisponibles.js. Los exámenes premium comprados
// en la Tienda NO pasan por aquí — siguen abriéndose desde Inventario.jsx
// directo a /examen/premium-<id>, sin tocar esta pantalla.
// Navega a: /examen/:examenId (ver Examen.jsx)

import { useNavigate } from 'react-router-dom';
import { EXAMENES_DISPONIBLES } from '../data/examenesDisponibles.js';
import ExamenCard from '../components/ExamenCard';
import { triggerVibration } from '../utils/haptics';

import { AiOutlineClose } from 'react-icons/ai';

export default function SeleccionExamen() {
  const navigate = useNavigate();

  const elegirExamen = (examenId) => {
    triggerVibration('success');
    navigate(`/examen/${examenId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="page-topbar-compact" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg)' }}>
        <button onClick={() => navigate('/')} title="Cerrar" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <h2 className="page-topbar-title" style={{ fontSize: '1rem' }}>Gratuitos</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAMENES_DISPONIBLES.map((examen) => (
          <ExamenCard
            key={examen.id}
            nombre={examen.nombre}
            color={examen.color}
            icono={<examen.Icono />}
            onClick={() => elegirExamen(examen.id)}
          />
        ))}
      </main>
    </div>
  );
}
