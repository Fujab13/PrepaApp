// TutoriasAlumno.jsx
// Sub-página de "/tutorias" (ver Tutorias.jsx) para el lado Alumno: consulta
// las ofertas que los maestros publican en `ofertas_maestro` (solo lectura,
// mismo componente que usa /ofertas — ver PublicacionOfertas.jsx). Los
// alumnos ya no pueden publicar sus propias solicitudes; coordinan el resto
// (grupo de WhatsApp, pago) directamente con el maestro.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { PublicacionOfertas } from "../components/PublicacionOfertas";

import { AiOutlineClose } from "react-icons/ai";
import { PiStudent } from "react-icons/pi";
import { HiCheckCircle } from "react-icons/hi2";

// Indicador informativo (no bloqueante): azul si ya se completó, gris si no.
function EstadoPill({ completado, etiqueta, onClick }) {
  const verificando = completado === null;
  const listo = completado === true;
  return (
    <button
      type="button"
      onClick={listo || verificando ? undefined : onClick}
      disabled={verificando}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
        padding: "6px 14px",
        borderRadius: 999,
        border: "none",
        cursor: listo || verificando ? "default" : "pointer",
        background: listo ? "#4f8ef722" : "var(--surface2)",
        color: listo ? "#4f8ef7" : "var(--text-muted)",
        fontSize: 12.5,
        fontWeight: 600,
        opacity: verificando ? 0.6 : 1,
      }}
    >
      {listo && <HiCheckCircle style={{ fontSize: 15 }} />}
      {etiqueta}
    </button>
  );
}

export default function TutoriasAlumno() {
  const navigate = useNavigate();
  const { user, cargando: cargandoAuth } = useAuth();

  const [examenOk, setExamenOk] = useState(null);
  const [formularioOk, setFormularioOk] = useState(null);

  useEffect(() => {
    if (!user) return;
    let activo = true;

    (async () => {
      const [{ data: examenRows }, { data: formularioRows }] = await Promise.all([
        supabase.from("resultados_examen").select("id").limit(1),
        supabase.from("formularios_area").select("id").limit(1),
      ]);
      if (!activo) return;
      setExamenOk(Boolean(examenRows?.length));
      setFormularioOk(Boolean(formularioRows?.length));
    })();

    return () => { activo = false; };
  }, [user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="page-topbar-compact" style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", paddingBottom: 14 }}>
        <button onClick={() => navigate("/tutorias")} title="Salir" className="page-topbar-btn">
          <AiOutlineClose />
        </button>
        <span className="page-topbar-btn" style={{ fontSize: "1.35rem" }}>
          <PiStudent />
        </span>
        <h2 className="page-topbar-title" style={{ fontSize: "1rem" }}>Alumnos</h2>
      </header>

      <main className="page-content-compact" style={{ flex: 1, paddingBottom: 60, display: "flex", flexDirection: "column", gap: 16 }}>

        {cargandoAuth && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>Cargando…</p>
        )}

        {!cargandoAuth && !user && (
          <div className="sp-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
              Necesitas iniciar sesión para ver las ofertas de tus maestros.
            </p>
            <button
              onClick={() => navigate("/login?modo=login")}
              style={{ minHeight: 44, padding: "0 20px", borderRadius: 10, border: "none", background: "#7c5cbf", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {!cargandoAuth && user && (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <EstadoPill completado={examenOk} etiqueta="Examen Simulador" onClick={() => navigate("/examen")} />
              <EstadoPill completado={formularioOk} etiqueta="Formulario Área" onClick={() => navigate("/formulario-area")} />
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Consulta las clases que tus maestros tienen disponibles. El grupo de WhatsApp y el pago se coordinan
              directamente con ellos.
            </p>

            <PublicacionOfertas />
          </>
        )}
      </main>
    </div>
  );
}
