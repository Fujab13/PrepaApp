// Tutorias.jsx
// Punto de entrada de "/tutorias": deja elegir entre el flujo de Alumnos
// (reservar una clase) y el de Maestros (aún en desarrollo). No requiere
// sesión para verse; cada sub-página valida el acceso por su cuenta.

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";
import { HiChevronLeft } from "react-icons/hi2";

const CLAVE_TUTORIAL_VISTO = "prepaapp_tutorial_tutorias_visto";

const PASOS_TUTORIAL = [
  {
    titulo: "¿Cómo funcionan las Tutorías 1-a-1?",
    texto: "En el portal de Alumnos ves las clases individuales que tus maestros publican: materia, horario, duración y precio. Tú eliges cuál te conviene.",
  },
  {
    titulo: "Antes de reservar",
    texto: "Completa el Examen Simulador y el Formulario de Área desde tu portal de alumno. Con eso, tu maestro conoce tus resultados desde antes y sabe exactamente en qué enfocar tu clase.",
  },
  {
    titulo: "Reserva tu asiento",
    texto: "Al reservar, tu lugar queda apartado 15 minutos mientras completas el pago, así nadie más puede quitártelo mientras decides. Si no pagas a tiempo, se libera solo.",
  },
  {
    titulo: "Después de pagar",
    texto: "Tu maestro te agrega a un grupo de WhatsApp para mandarte la liga de la clase y coordinar cualquier detalle extra directamente contigo.",
  },
];

// Guía corta y descartable (se marca como vista en localStorage) para que un
// alumno nuevo entienda el flujo completo antes de entrar a su portal: por
// qué el examen/formulario son un requisito, qué significa "reservar" (TTL)
// y que el grupo de WhatsApp llega DESPUÉS de pagar, no antes.
function TutorialAlumno({ onCerrar }) {
  const [paso, setPaso] = useState(0);
  const ultimo = paso === PASOS_TUTORIAL.length - 1;
  const actual = PASOS_TUTORIAL[paso];

  return (
    <div className="sp-card" style={{ background: "var(--surface2)", position: "relative" }}>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar guía"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          minWidth: 32,
          minHeight: 32,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <AiOutlineClose />
      </button>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "#7c5cbf", margin: "0 0 6px", textTransform: "uppercase" }}>
        Guía rápida · {paso + 1}/{PASOS_TUTORIAL.length}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 24px 6px 0" }}>{actual.titulo}</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 14px" }}>{actual.texto}</p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, rowGap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {PASOS_TUTORIAL.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === paso ? "#7c5cbf" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {paso > 0 && (
            <button
              type="button"
              onClick={() => setPaso((p) => p - 1)}
              style={{
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <HiChevronLeft /> Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (ultimo ? onCerrar() : setPaso((p) => p + 1))}
            style={{
              minHeight: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: "#7c5cbf",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {ultimo ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

const OPCIONES = [
  {
    to: "/tutorias/alumno",
    icono: <PiStudent />,
    color: "#7c5cbf",
    titulo: "Alumnos",
    subtitulo: "Reserva una clase 1-a-1 con un maestro.",
  },
  {
    to: "/tutorias/maestro",
    icono: <PiChalkboardTeacher />,
    color: "#06b6d4",
    titulo: "Maestros",
    subtitulo: "Consulta y gestiona tus tutorías asignadas.",
  },
];

export default function Tutorias() {
  const navigate = useNavigate();

  // La guía nunca se oculta del todo: "Entendido" (o la X) solo la manda
  // debajo de las tarjetas de Alumnos/Maestros y sube esas tarjetas al
  // primer lugar. Para quien ya la vio antes, arranca directo abajo (no
  // tiene sentido volver a taparle las tarjetas cada vez que entra).
  const [tutorialAbajo, setTutorialAbajo] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_TUTORIAL_VISTO) === "1";
    } catch {
      return false;
    }
  });

  function moverTutorialAbajo() {
    setTutorialAbajo(true);
    try {
      localStorage.setItem(CLAVE_TUTORIAL_VISTO, "1");
    } catch {
      // localStorage puede fallar en modo privado; no es crítico para la guía.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiStudent />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Tutorías</h2>
      </header>

      <main
        className="page-content-compact"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}
      >
        {!tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--text-muted)", textAlign: "center", margin: "4px 0 2px",
        }}>
          ¿Qué te gustaría hacer?
        </p>

        {/* grid en vez de flex: en iOS Safari un <button> como flex item no
            siempre respeta align-items:stretch (bug conocido de WebKit con
            controles de formulario), así que las dos tarjetas terminaban de
            distinto alto. Grid sí las estira parejo en ambos ejes, y
            aspectRatio (en vez de un minHeight fijo en px) hace que el
            tamaño escale bien tanto en un iPhone SE angosto como en el
            máximo de 480px que usa toda la app (#root en global.css).
            sp-card-interactive (global.css) da el hover/active/focus con
            pseudo-clases; queda disponible para reusar en otras páginas. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {OPCIONES.map((op) => (
            <button
              key={op.to}
              type="button"
              onClick={() => navigate(op.to)}
              className="sp-card sp-card-interactive"
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "0.72",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                margin: 0,
                padding: 16,
                font: "inherit",
                color: "inherit",
                WebkitTapHighlightColor: "transparent",
                boxSizing: "border-box",
              }}
            >
              <div
                className="sp-card-icon"
                style={{
                  width: 68,
                  height: 68,
                  fontSize: "2.3rem",
                  background: `radial-gradient(circle at 32% 28%, ${op.color}3d, ${op.color}17)`,
                  color: op.color,
                  boxShadow: `0 0 0 1px ${op.color}2a inset`,
                }}
              >
                {op.icono}
              </div>
              <p className="sp-card-title" style={{ fontSize: "0.95rem", marginTop: 4 }}>{op.titulo}</p>
              <p className="sp-card-description" style={{ textAlign: "center" }}>{op.subtitulo}</p>
            </button>
          ))}
        </div>

        {tutorialAbajo && <TutorialAlumno onCerrar={moverTutorialAbajo} />}
      </main>
    </div>
  );
}
