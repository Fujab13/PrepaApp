// Tutorias.jsx
// Punto de entrada de "/tutorias": deja elegir entre el flujo de Alumnos
// (reservar una clase) y el de Maestros (aún en desarrollo). No requiere
// sesión para verse; cada sub-página valida el acceso por su cuenta.

import { useNavigate } from "react-router-dom";

import { PiChalkboardTeacher, PiStudent } from "react-icons/pi";
import { AiOutlineClose } from "react-icons/ai";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ paddingBottom: 14 }}>
        <button onClick={() => navigate("/")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiChalkboardTeacher />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Tutorías</h2>
      </header>

      <main
        className="page-content-compact"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}
      >
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "0 0 4px" }}>
          ¿Qué te gustaría hacer?
        </p>

        <div style={{ display: "flex", gap: 14 }}>
          {OPCIONES.map((op) => (
            <button
              key={op.to}
              type="button"
              onClick={() => navigate(op.to)}
              className="sp-card"
              style={{
                flex: 1,
                minHeight: 200,
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                border: "none",
                margin: 0,
                font: "inherit",
                color: "inherit",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                className="sp-card-icon"
                style={{ width: 56, height: 56, fontSize: "1.7rem", background: `${op.color}22`, color: op.color }}
              >
                {op.icono}
              </div>
              <p className="sp-card-title" style={{ fontSize: "1rem" }}>{op.titulo}</p>
              <p className="sp-card-description" style={{ textAlign: "center" }}>{op.subtitulo}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
